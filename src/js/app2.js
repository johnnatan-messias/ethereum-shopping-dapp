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

$(document).on('click', '#pay-for-product', function () {
    var from_account = web3.eth.accounts[0];
    var to_account = "0x2c892f27Da5B175B44772E97dBebEC9308ee38E2";
    console.log('to-account', to_account);
    console.log("from_account", from_account);
    var value = $(this).attr("value");
    var value_sbc = eur_to_sbc(value);
    console.log(value_sbc);
    console.log(contract_instance.sendCoin)
    contract_instance.sendCoin.sendTransaction.call({ from: from_account }, to_account, value_sbc,
        function (error, result) {
            if (error)
                console.log('err', err);
            console.log('result', result)
            alert("Transaction ID: " + result)
        });

    /*
    contract_instance.sendCoin(to_account, value_sbc).send(
        { from: from_account }
    )
        .on('transactionHash', function (hash) {
            console.log("transactionHash", hash)
        })
        .on('receipt', function (receipt) {
            console.log("receipt", receipt)
        })
        .on('confirmation', function (confirmationNumber, receipt) {
            console.log("confirmation", confirmationNumber, receipt)
        })
        .on('error', function (error, receipt) {
            console.log("error", error)
        });
    */
    update_balance();
});


function sbc_to_eur(sbc) {
    return (sbc / 100).toFixed(2);
}

function eur_to_sbc(eur) {
    return parseInt(eur * 100)
}
