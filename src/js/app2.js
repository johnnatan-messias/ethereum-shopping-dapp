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
    var contract_address = "0x6626f2422096E6C05a9513446e3C5D94cdE79A36";
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
    contract_instance.getBalance.call(
        web3.eth.accounts[0], function (err, result) {
            if (err)
                console.log(err);
            var balance = parseInt(result)
            $('span#wallet-balance').text('€ ' + sbc_to_eur(balance))
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

$(document).on('click', '#pay-for-product', function () {
    var from_account = web3.eth.accounts[0];
    var to_account = "0x2c892f27Da5B175B44772E97dBebEC9308ee38E2";
    console.log('to-account', to_account);
    console.log("from_account", from_account);
    var value = $(this).attr("value");
    var value_sbc = eur_to_sbc(value);

    contract_instance.sendCoin.sendTransaction.call({ from: from_account }, to_account, value_sbc,
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
});


function sbc_to_eur(sbc) {
    return (sbc / 100).toFixed(2);
}

function eur_to_sbc(eur) {
    return parseInt(eur * 100)
}
