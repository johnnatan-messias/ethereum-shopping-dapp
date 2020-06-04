pragma solidity >=0.4.25 <0.7.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SBCoin.sol";


contract TestSBCoin {
    function testInitialBalanceUsingDeployedContract() public {
        SBCoin sbCoin = SBCoin(DeployedAddresses.SBCoin());

        uint256 expected = 1000000000000;

        Assert.equal(
            sbCoin.balanceOf(msg.sender),
            expected,
            "Owner should have 1000000000000 SBCoin initially"
        );
    }
/*
    function testInitialBalanceWithNewSBCoin() public {
        SBCoin sbCoin = new SBCoin();

        uint256 expected = 1000000000000;
        Assert.equal(
            sbCoin.getBalance(msg.sender),
            expected,
            "Owner should have 1000000000000 SBCoin initially"
        );
    }
*/
}
