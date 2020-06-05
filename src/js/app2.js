window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            await ethereum.enable();
            // Acccounts now exposed
            console.log('web3', web3);
            console.log('ethereum', ethereum);
            console.log('accounts', web3.eth.accounts);
            console.log('coinbase', web3.eth.coinbase);
            console.log('net_version', web3.version.network);
            contract_instance = get_deployed_contract();
            update_balance();
            getAvailableProducts();
            getOwnedProducts();
            window.ethereum.on('accountsChanged', function (accounts) {
                location.reload();
            });
            //web3.eth.sendTransaction({/* ... */});
        } catch (error) {
            alert(error);
            // User denied account access...
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
        // Acccounts always exposed
        //web3.eth.sendTransaction({/* ... */});
    }
    // Non-dapp browsers...
    else {
        alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
});

function connect_to_blockchain2() {
    var web3;
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        // set the provider you want from Web3.providers
        web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
    }
    return web3;

}

function get_deployed_contract() {
    var contract_address = "0x4560F4e9c3183F1cB7d719815E04894130EC7028";
    //var contract_address = "0x6626f2422096E6C05a9513446e3C5D94cdE79A36";
    //var Contract = web3.eth.contract(contract_abi);
    //var contract_instance = Contract.at(contract_address);
    //console.log('contract', contract_instance);

    var Contract = web3.eth.contract(contract_abi);
    // initiate contract for an address
    var contract_instance = Contract.at(contract_address);
    console.log(contract_instance);

    return contract_instance;
}

function update_balance() {
    contract_instance.balanceOf.call(
        web3.eth.accounts[0], function (error, result) {
            if (error)
                console.log(error);
            else {
                var balance = parseInt(result)
                $('span#wallet-balance').text('€ ' + sbc_to_eur(balance));
            }
        });
}

function getAvailableProducts() {
    contract_instance.getTotalAvailableProducts.call(function (error, result) {
        if (error)
            console.log(error);
        else {
            var totalAvailableProducts = parseInt(result);
            console.log('totalAvailableProducts', totalAvailableProducts)
            for (i = 0; i < totalAvailableProducts; i++) {
                var productId = i + 1;
                contract_instance.getProductById.call(productId, function (error, product) {
                    if (error) {
                        console.log(productId, error);
                    }
                    else {
                        console.log('Available:', 'productId=' + parseInt(product[0]) + '\tcategoryId=' + parseInt(product[1]) + '\tcategoryName=' + product[2] + '\tproductName=' + product[3] + '\tpriceInSBC=' + parseInt(product[4]));
                        $(".featured__filter").append(
                            '<div class="col-lg-3 col-md-4 col-sm-6 mix ' + product[2].toLowerCase() + '"><div class="featured__item"><div class="featured__item__pic set-bg" data-setbg="img/product/product-' + parseInt(product[0]) + '.jpg" style="background-image: url(&quot;img/product/product-' + parseInt(product[0]) + '.jpg&quot;);"><ul class="featured__item__pic__hover"><li><a href="#"><i class="fa fa-shopping-cart" id="buy-product" value="' + parseInt(product[0]) + '"></i></a></li></ul></div><div class="featured__item__text"><h6><a href="#">' + product[3] + '</a></h6><h5>€ ' + sbc_to_eur(parseInt(product[4])) + '</h5></div></div></div>'
                        )
                    }
                });
            }
        }
    });
}

function getOwnedProducts() {
    contract_instance.getTotalOwnedProducts.call(function (error, result) {
        if (error)
            console.log(error);
        else {
            var totalOwnedProducts = parseInt(result);
            console.log('totalOwnedProducts', totalOwnedProducts)
            for (productIndex = 0; productIndex < totalOwnedProducts; productIndex++) {
                contract_instance.getOwnedProduct.call(productIndex, function (error, product) {
                    if (error) {
                        console.log(productIndex, error);
                    }
                    else {
                        console.log('Owned:', 'productId=' + parseInt(product[0]) + '\tcategoryId=' + parseInt(product[1]) + '\tcategoryName=' + product[2] + '\tproductName=' + product[3] + '\tpriceInSBC=' + parseInt(product[4]));
                        $(".owned-products-list").append(
                            '<div class="col-lg-3 col-md-4 col-sm-6"><div class="owned__item"><div class="owned__item__pic set-bg" data-setbg="img/product/product-' + parseInt(product[0]) + '.jpg" style="background-image: url(&quot;img/product/product-' + parseInt(product[0]) + '.jpg&quot;);"></div><div class="owned__item__text"><h6><a href="#">' + product[3] + '</a></h6><h5>€ ' + sbc_to_eur(parseInt(product[4])) + '</h5></div></div></div>'
                        )
                    }
                });
            }
        }
    });
}


function waitForReceipt(hash, cb) {
    web3.eth.getTransactionReceipt(hash, function (err, receipt) {
        if (err) {
            error(err);
        }

        if (receipt !== null) {
            // Transaction went through
            update_balance();
            if (cb) {
                cb(receipt);
            }
        } else {
            // Try again in 1 second
            window.setTimeout(function () {
                waitForReceipt(hash, cb);
            }, 1000);
        }
    });
}

$(document).on('click', '#buy-product', function () {
    var customerAccount = web3.eth.accounts[0];
    console.log("customerAccount", customerAccount);

    var productId = $(this).attr("value");
    console.log('productId', productId);

    contract_instance.getStoreAddress.call(function (error, storeAccount) {
        if (error)
            console.log(error);
        else {
            console.log('storeAccount', storeAccount);
            contract_instance.buyProduct.sendTransaction.call({ from: customerAccount, to: storeAccount }, productId,
                function (error, txid) {
                    if (error) {
                        console.log('error', error);
                        alert("Transaction error");
                    }
                    else {
                        console.log('txid', txid)
                        alert("Transaction ID: " + txid)
                        waitForReceipt(txid, function (receipt) {
                            console.log('Receipt', receipt);
                            alert("Transaction confirmed and included in block " + receipt.blockNumber);
                            contract_instance.getProductById.call(productId, function (error, product) {
                                if (error) {
                                    console.log(productId, error);
                                }
                                else {
                                    console.log('Owned:', 'productId=' + parseInt(product[0]) + '\tcategoryId=' + parseInt(product[1]) + '\tcategoryName=' + product[2] + '\tproductName=' + product[3] + '\tpriceInSBC=' + parseInt(product[4]));
                                    $(".owned-products-list").append(
                                        '<div class="col-lg-3 col-md-4 col-sm-6"><div class="owned__item"><div class="owned__item__pic set-bg" data-setbg="img/product/product-' + parseInt(product[0]) + '.jpg" style="background-image: url(&quot;img/product/product-' + parseInt(product[0]) + '.jpg&quot;);"></div><div class="owned__item__text"><h6><a href="#">' + product[3] + '</a></h6><h5>€ ' + sbc_to_eur(parseInt(product[4])) + '</h5></div></div></div>'
                                    )
                                }
                            });
                        });
                    }
                });
        }
    });

    /*
        contract_instance.transfer.sendTransaction.call({ from: from_account }, to_account, value_sbc,
            function (error, txid) {
                if (error) {
                    console.log('error', error);
                    alert("Transaction error");
                }
                else {
                    console.log('txid', txid)
                    alert("Transaction ID: " + txid)
                    waitForReceipt(txid, function (receipt) {
                        console.log('Receipt', receipt);
                        alert("Transaction confirmed and included in block " + receipt.blockNumber)
                    });
                }
            });
            */

});


function sbc_to_eur(sbc) {
    return (sbc / 100).toFixed(2);
}

function eur_to_sbc(eur) {
    return parseInt(eur * 100)
}
