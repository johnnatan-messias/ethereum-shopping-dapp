const SBCoin = artifacts.require("SBCoin");

contract('SBCoin', (accounts) => {
  it('should put 1000000000000 SBCoin in the first account', async () => {
    const sbCoinInstance = await SBCoin.deployed();
    const balance = await sbCoinInstance.getBalance.call(accounts[0]);

    assert.equal(balance.valueOf(), 1000000000000, "1000000000000 wasn't in the first account");
  });

  it('should call a function that depends on a linked library', async () => {
    const sbCoinInstance = await SBCoin.deployed();
    const sbCoinBalance = (await sbCoinInstance.getBalance.call(accounts[0])).toNumber();
    const sbCoinEthBalance = (await sbCoinInstance.getBalanceInEth.call(accounts[0])).toNumber();

    assert.equal(sbCoinEthBalance, 2 * sbCoinBalance, 'Library function returned unexpected function, linkage may be broken');
  });

  it('should send coin correctly', async () => {
    const sbCoinInstance = await SBCoin.deployed();

    // Setup 2 accounts.
    const accountOne = accounts[0];
    const accountTwo = accounts[1];

    // Get initial balances of first and second account.
    const accountOneStartingBalance = (await sbCoinInstance.getBalance.call(accountOne)).toNumber();
    const accountTwoStartingBalance = (await sbCoinInstance.getBalance.call(accountTwo)).toNumber();

    // Make transaction from first account to second.
    const amount = 1000;
    await sbCoinInstance.sendCoin(accountTwo, amount, { from: accountOne });

    // Get balances of first and second account after the transactions.
    const accountOneEndingBalance = (await sbCoinInstance.getBalance.call(accountOne)).toNumber();
    const accountTwoEndingBalance = (await sbCoinInstance.getBalance.call(accountTwo)).toNumber();

    assert.equal(accountOneEndingBalance, accountOneStartingBalance - amount, "Amount wasn't correctly taken from the sender");
    assert.equal(accountTwoEndingBalance, accountTwoStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
  });
});
