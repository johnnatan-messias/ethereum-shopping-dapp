pragma solidity >=0.4.25 <0.7.0;

import "./ConvertLib.sol";


/*
   function transferFrom(address _from, address _to, uint _value) returns (bool success);
   function approve(address _spender, uint _value) returns (bool success);
   function allowance(address _owner, address _spender) constant returns (uint remaining);
   event Approval(address indexed _owner, address indexed _spender, uint _value);
*/
contract SBCoin {
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    uint256 private _totalSupply;

    struct Product {
        uint24 id;
        uint24 categoryId;
        string categoryName;
        string productName;
        uint256 priceInSBC;
    }

    // Store wallet address. It is necessary to receive the payment for the products
    address storeAddress = 0x2c892f27Da5B175B44772E97dBebEC9308ee38E2;

    // Balances are in cent unit
    mapping(address => uint256) private balances;

    address private minter;

    //Product[] private availableProducts;
    mapping(uint24 => Product) private availableProducts;
    mapping(address => Product[]) private productsOwned;
    uint256 private totalAvailableProducts;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    /// Access modifier for minter-only functionality
    modifier onlyMinter() {
        require(
            msg.sender == minter,
            "Only the minter can access this functionality!"
        );
        _;
    }

    modifier productExists(uint24 id) {
        require(availableProducts[id].id != 0, "Product does not exist!");
        _;
    }

    modifier onlyStoreOrMinter() {
        require(
            msg.sender == minter || msg.sender == storeAddress,
            "Only minter or store address owner can access this functionality!"
        );
        _;
    }

    constructor() public {
        minter = msg.sender;
        // 100 sb = 1 Euro
        // There are 10 billion Euro worth in SB-coins in total
        // 1SBC = 1 Euro
        _totalSupply = 1000000000000;
        balances[msg.sender] = _totalSupply;
        _name = "Saarbrücken Coin";
        _symbol = "SBC";
        _decimals = 2;
        create_products();
    }

    /**
     * @dev See {IERC20-name}.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IERC20-symbol}.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev See {IERC20-decimals}.
     */
    function decimals() public view returns (uint8) {
        return _decimals;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    /*
    function mintCoin(address receiver, uint256 amount) public onlyMinter {
        require(amount != 0, "Cannot mint 0 coins!");
        balances[receiver] += amount;
        _totalSupply += amount;
    }
    */
    /**
     * @dev See {IERC20-transfer}.
     */
    function transfer(address receiver, uint256 amount) public returns (bool) {
        require(amount > 0, "Transfer of 0 coins is not allowed!");
        require(
            msg.sender != receiver,
            "Sending money to the same account is not allowed!"
        );
        require(
            balances[msg.sender] >= amount,
            "Account does not have sufficient balance!"
        );
        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        emit Transfer(msg.sender, receiver, amount);
        return true;
    }

    function balanceOfMe() public view returns (uint256) {
        return balances[msg.sender];
    }

    function balanceOfInEth(address addr) public view returns (uint256) {
        return ConvertLib.convert(balanceOf(addr), 2);
    }

    function balanceOfInEuro(address addr) public view returns (uint256) {
        return ConvertLib.convertToEuro(balanceOf(addr));
    }

    function getStoreAddress() public view returns (address) {
        return storeAddress;
    }

    function changeStoreAddress(address addr) public onlyStoreOrMinter {
        storeAddress = addr;
    }

    function addProduct(
        uint24 id,
        uint24 categoryId,
        string memory categoryName,
        string memory productName,
        uint256 priceInSBC
    ) public onlyMinter {
        require(
            availableProducts[id].id == 0,
            "It cannot have duplicated products!"
        );
        availableProducts[id] = Product({
            id: id,
            categoryId: categoryId,
            categoryName: categoryName,
            productName: productName,
            priceInSBC: priceInSBC
        });
        totalAvailableProducts += 1;
    }

    function removeProduct(uint24 id) public productExists(id) onlyMinter {
        delete availableProducts[id];
        totalAvailableProducts -= 1;
    }

    function getProductById(uint24 id)
        public
        view
        productExists(id)
        returns (
            uint24,
            uint24,
            string memory,
            string memory,
            uint256
        )
    {
        Product memory product = availableProducts[id];
        return (
            product.id,
            product.categoryId,
            product.categoryName,
            product.productName,
            product.priceInSBC
        );
    }

    function getTotalAvailableProducts() public view returns (uint256) {
        return totalAvailableProducts;
    }

    function buyProduct(uint24 id) public productExists(id) {
        Product memory product = availableProducts[id];
        transfer(storeAddress, product.priceInSBC);
        productsOwned[msg.sender].push(product);
    }

    function donateProduct(address receiver, uint24 productIndex) public {
        Product memory product = productsOwned[msg.sender][productIndex];
        delete productsOwned[msg.sender][productIndex];
        productsOwned[receiver].push(product);
    }

    function getTotalOwnedProducts() public view returns (uint256) {
        return productsOwned[msg.sender].length;
    }

    function getOwnedProduct(uint24 productIndex)
        public
        view
        returns (
            uint24,
            uint24,
            string memory,
            string memory,
            uint256
        )
    {
        Product memory product = productsOwned[msg.sender][productIndex];
        return (
            product.id,
            product.categoryId,
            product.categoryName,
            product.productName,
            product.priceInSBC
        );
    }

    function create_products() private {
        addProduct({
            id: 1,
            categoryId: 1,
            categoryName: "Meat",
            productName: "Red meat",
            priceInSBC: 2000
        });
        addProduct({
            id: 2,
            categoryId: 0,
            categoryName: "Fruits",
            productName: "Banana",
            priceInSBC: 300
        });
        addProduct({
            id: 3,
            categoryId: 0,
            categoryName: "Fruits",
            productName: "Guaba",
            priceInSBC: 500
        });
        addProduct({
            id: 4,
            categoryId: 0,
            categoryName: "Fruits",
            productName: "Grapes",
            priceInSBC: 1500
        });
        addProduct({
            id: 5,
            categoryId: 3,
            categoryName: "Fastfood",
            productName: "Double cheeseburguer",
            priceInSBC: 2500
        });
        addProduct({
            id: 6,
            categoryId: 0,
            categoryName: "Fruits",
            productName: "Mango",
            priceInSBC: 1500
        });
        addProduct({
            id: 7,
            categoryId: 0,
            categoryName: "Fruits",
            productName: "Watermelon",
            priceInSBC: 1000
        });
        addProduct({
            id: 8,
            categoryId: 0,
            categoryName: "Fruits",
            productName: "Apple",
            priceInSBC: 1100
        });
        addProduct({
            id: 9,
            categoryId: 0,
            categoryName: "Fruits",
            productName: "Cale owoce",
            priceInSBC: 800
        });
        addProduct({
            id: 10,
            categoryId: 0,
            categoryName: "Fruits",
            productName: "Fried chicken drumsticks",
            priceInSBC: 1000
        });
        addProduct({
            id: 11,
            categoryId: 0,
            categoryName: "Fruits",
            productName: "Orange juice",
            priceInSBC: 400
        });
        addProduct({
            id: 12,
            categoryId: 0,
            categoryName: "Fruits",
            productName: "Mixed fruit pack",
            priceInSBC: 2500
        });
        addProduct({
            id: 13,
            categoryId: 0,
            categoryName: "Fruits",
            productName: "Oranges",
            priceInSBC: 600
        });
        addProduct({
            id: 14,
            categoryId: 2,
            categoryName: "Vegetables",
            productName: "Cabbage",
            priceInSBC: 300
        });
        addProduct({
            id: 15,
            categoryId: 2,
            categoryName: "Vegetables",
            productName: "Bell pepper",
            priceInSBC: 400
        });
        addProduct({
            id: 16,
            categoryId: 0,
            categoryName: "Fruits",
            productName: "Mixed fruit juice",
            priceInSBC: 400
        });
    }
}
