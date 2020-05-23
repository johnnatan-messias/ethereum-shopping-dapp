pragma solidity >=0.4.25 <0.7.0;


contract Migrations {
    address public owner;
    uint256 public last_completed_migration;

    modifier restricted() {
        require(
            msg.sender == owner,
            "Only the owner can access this functionality!"
        );
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function setCompleted(uint256 completed) public restricted {
        last_completed_migration = completed;
    }
}
