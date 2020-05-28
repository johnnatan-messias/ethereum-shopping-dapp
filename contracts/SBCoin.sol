pragma solidity >=0.4.25 <0.7.0;

import "./ConvertLib.sol";


// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

contract SBCoin {
    // Balances are in cent unit
    mapping(address => uint256) private balances;
    address private minter;
    uint256 private _totalSupply;

    /// Access modifier for minter-only functionality
    modifier onlyMinter() {
        require(
            msg.sender == minter,
            "Only the minter can access this functionality"
        );
        _;
    }
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor() public {
        minter = msg.sender;
        // 1 SB-coin = 100 cents
        // There are 10 billion SB-coins in total
        _totalSupply = 1000000000000;
        balances[msg.sender] = _totalSupply;
    }

    function mintCoin(address receiver, uint256 amount) public onlyMinter {
        require(amount != 0, "Cannot mint 0 coins!");
        balances[receiver] += amount;
    }

    function sendCoin(address receiver, uint256 amount) public {
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

    function getBalanceInEth(address addr) public view returns (uint256) {
        return ConvertLib.convert(getBalance(addr), 2);
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
}
