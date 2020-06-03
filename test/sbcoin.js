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

  it('should call the function convertToEuro on a linked library correctly', async () => {
    const sbCoinInstance = await SBCoin.deployed();
    const sbCoinBalance = (await sbCoinInstance.getBalance.call(accounts[0])).toNumber();
    const sbCoinInEuro = (await sbCoinInstance.getBalanceInEuro.call(accounts[0])).toNumber();
    assert.equal(sbCoinInEuro, sbCoinBalance / 100), 'Function returned unexpected value in Euro';
  });

  it('should return 1000000000000 as the total coin supply', async () => {
    const sbCoinInstance = await SBCoin.deployed();
    const totalSupply = (await sbCoinInstance.totalSupply.call()).toNumber();
    assert.equal(totalSupply, 1000000000000, 'The expected total supply does not match.');
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

  it('should add 16 products to the available products at the beginning', async () => {
    const sbCoinInstance = await SBCoin.deployed();
    const totalAvailableProducts = (await sbCoinInstance.getTotalAvailableProducts.call()).toNumber();
    assert.equal(totalAvailableProducts, 16, 'The amount of available products does not match.')
  });

  it('should add a new product to the list of available products', async () => {
    const sbCoinInstance = await SBCoin.deployed();
    const totalAvailableProducts = (await sbCoinInstance.getTotalAvailableProducts.call()).toNumber();
    await sbCoinInstance.addProduct(21, 1, "Fruits", "Pear", 50000);
    const newTotalAvailableProducts = (await sbCoinInstance.getTotalAvailableProducts.call()).toNumber();
    assert.equal(newTotalAvailableProducts, totalAvailableProducts + 1, 'The amount of available products does not match.')
  });

  it('should remove a product from the list of available products', async () => {
    const sbCoinInstance = await SBCoin.deployed();
    const totalAvailableProducts = (await sbCoinInstance.getTotalAvailableProducts.call()).toNumber();
    await sbCoinInstance.removeProduct(21);
    const newTotalAvailableProducts = (await sbCoinInstance.getTotalAvailableProducts.call()).toNumber();
    assert.equal(newTotalAvailableProducts, totalAvailableProducts - 1, 'The amount of available products does not match.');
  });

  it('should add a product with ID=21; categoryId=1; categoryName=Fruits; name=Pear; priceInSBC=50000', async () => {
    const sbCoinInstance = await SBCoin.deployed();
    await sbCoinInstance.addProduct(21, 1, "Fruits", "Pear", 50000);
    const product = await sbCoinInstance.getProductById(21);
    const flag = product[0].toNumber() === 21 && product[1].toNumber() === 1 && product[2] === "Fruits" && product[3] === "Pear" && product[4].toNumber() === 50000;
    assert(flag, 'Product registered differs from the one we are expecting.');

  })

  it('should buy the product with a productId=1', async () => {
    const sbCoinInstance = await SBCoin.deployed();
    await sbCoinInstance.buyProduct(1);
    const product = await sbCoinInstance.getOwnedProduct(0);
    const flag = product[0].toNumber() === 1 && product[1].toNumber() === 1 && product[2] === "Meat" && product[3] === "Red meat" && product[4].toNumber() === 2000;
    assert(flag, 'The product bought differs from what we are expecting.');
  });

  it('should buy a product and decrease its value from the user account balance', async () => {
    const sbCoinInstance = await SBCoin.deployed();
    const accountBalanceBefore = (await sbCoinInstance.getMyBalance()).toNumber();
    await sbCoinInstance.buyProduct(1);
    const accountBalanceAfter = (await sbCoinInstance.getMyBalance()).toNumber();
    const product = await sbCoinInstance.getOwnedProduct(0);
    //console.log(product[0].toNumber(), product[1].toNumber(), product[2], product[3], product[4].toNumber());
    //console.log(accountBalanceAfter, accountBalanceBefore, product[4].toNumber());
    assert.equal(accountBalanceAfter, accountBalanceBefore - product[4].toNumber(), 'The account balance is not correct.');
  });

});
