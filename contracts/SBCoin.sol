pragma solidity >=0.4.25 <0.7.0;

import "./ConvertLib.sol";


contract SBCoin {
    struct Product {
        uint24 id;
        uint24 categoryId;
        string categoryName;
        string name;
        uint256 priceInSBC;
    }

    // Store wallet address. It is necessary to receive the payment for the products
    address storeAddress = 0x2c892f27Da5B175B44772E97dBebEC9308ee38E2;

    // Balances are in cent unit
    mapping(address => uint256) private balances;

    address private minter;
    uint256 private _totalSupply = 1000000000000;

    //Product[] private availableProducts;
    mapping(uint24 => Product) private availableProducts;
    mapping(address => Product[]) private productsOwned;
    uint256 private totalAvailableProducts;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    /// Access modifier for minter-only functionality
    modifier onlyMinter() {
        require(
            msg.sender == minter,
            "Only the minter can access this functionality"
        );
        _;
    }

    modifier productExists(uint24 id) {
        require(availableProducts[id].id != 0, "Product does not exist!");
        _;
    }

    constructor() public {
        minter = msg.sender;
        // 100 SB-coin = 1 Euro
        // There are 10 billion Euro worth in SB-coins in total
        balances[msg.sender] = _totalSupply;
        create_products();
    }

    /*
    function mintCoin(address receiver, uint256 amount) public onlyMinter {
        require(amount != 0, "Cannot mint 0 coins!");
        balances[receiver] += amount;
        _totalSupply += amount;
    }
    */

    function sendCoin(address receiver, uint256 amount) public {
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
    }

    function getBalance(address addr) public view returns (uint256) {
        return balances[addr];
    }

    function getMyBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    function getBalanceInEth(address addr) public view returns (uint256) {
        return ConvertLib.convert(getBalance(addr), 2);
    }

    function getBalanceInEuro(address addr) public view returns (uint256) {
        return ConvertLib.convertToEuro(getBalance(addr));
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function addProduct(
        uint24 id,
        uint24 categoryId,
        string memory categoryName,
        string memory name,
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
            name: name,
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
            product.name,
            product.priceInSBC
        );
    }

    function getTotalAvailableProducts() public view returns (uint256) {
        return totalAvailableProducts;
    }

    //To test
    function buyProduct(uint24 id) public productExists(id) {
        Product memory product = availableProducts[id];
        sendCoin(storeAddress, product.priceInSBC);
        productsOwned[msg.sender].push(product);
    }

    //To test -- implement testing whether this person has the product
    function donateProduct(address receiver, uint24 productIndex) public {
        Product memory product = productsOwned[msg.sender][productIndex];
        delete productsOwned[msg.sender][productIndex];
        productsOwned[receiver].push(product);
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
            product.name,
            product.priceInSBC
        );
    }

    function create_products() private {
        addProduct({
            id: 1,
            categoryId: 1,
            categoryName: "Meat",
            name: "Red meat",
            priceInSBC: 2000
        });
        addProduct({
            id: 2,
            categoryId: 0,
            categoryName: "Fruits",
            name: "Banana",
            priceInSBC: 300
        });
        addProduct({
            id: 3,
            categoryId: 0,
            categoryName: "Fruits",
            name: "Guaba",
            priceInSBC: 500
        });
        addProduct({
            id: 4,
            categoryId: 0,
            categoryName: "Fruits",
            name: "Grapes",
            priceInSBC: 1500
        });
        addProduct({
            id: 5,
            categoryId: 3,
            categoryName: "Fastfood",
            name: "Double cheeseburguer",
            priceInSBC: 2500
        });
        addProduct({
            id: 6,
            categoryId: 0,
            categoryName: "Fruits",
            name: "Mango",
            priceInSBC: 1500
        });
        addProduct({
            id: 7,
            categoryId: 0,
            categoryName: "Fruits",
            name: "Watermelon",
            priceInSBC: 1000
        });
        addProduct({
            id: 8,
            categoryId: 0,
            categoryName: "Fruits",
            name: "Apple",
            priceInSBC: 1100
        });
        addProduct({
            id: 9,
            categoryId: 0,
            categoryName: "Fruits",
            name: "Cale owoce",
            priceInSBC: 800
        });
        addProduct({
            id: 10,
            categoryId: 0,
            categoryName: "Fruits",
            name: "Fried chicken drumsticks",
            priceInSBC: 1000
        });
        addProduct({
            id: 11,
            categoryId: 0,
            categoryName: "Fruits",
            name: "Orange juice",
            priceInSBC: 400
        });
        addProduct({
            id: 12,
            categoryId: 0,
            categoryName: "Fruits",
            name: "Mixed fruit pack",
            priceInSBC: 2500
        });
        addProduct({
            id: 13,
            categoryId: 0,
            categoryName: "Fruits",
            name: "Oranges",
            priceInSBC: 600
        });
        addProduct({
            id: 14,
            categoryId: 2,
            categoryName: "Vegetables",
            name: "Cabbage",
            priceInSBC: 300
        });
        addProduct({
            id: 15,
            categoryId: 2,
            categoryName: "Vegetables",
            name: "Bell pepper",
            priceInSBC: 400
        });
        addProduct({
            id: 16,
            categoryId: 0,
            categoryName: "Fruits",
            name: "Mixed fruit juice",
            priceInSBC: 400
        });
    }
}
