window.addEventListener('load', async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        // Request account access if needed
        await ethereum.enable();
        // Acccounts now exposed
        console.log('accounts', web3.eth.accounts)
        console.log('coinbase', web3.eth.coinbase)
        console.log('net_version', web3.version.network)
        contract = get_deployed_contract()
        console.log('contract', contract)
        load_table()
        //web3.eth.sendTransaction({/* ... */});
      } catch (error) {
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
    var contract = new web3.eth.Contract(contract_abi, contract_address)
    return contract;

}

function load_table() {
    $('#table-accounts').empty();
    $("#accounts-selector").empty();
    var table_body = $("#table-accounts").get(0);
    var selector = $("#accounts-selector").get(0)
    web3.eth.getAccounts().then(e => {
        e.forEach(account => {
            var tr = document.createElement("tr");
            var option = document.createElement('option')
            option.appendChild(document.createTextNode(account));
            selector.appendChild(option)
            contract.methods.getBalance(account).call(function (error, balance) {
                console.log(account, parseFloat(balance))
                var td_account = document.createElement("td")
                td_account.appendChild(document.createTextNode(account))
                var td_balance = document.createElement("td")
                td_balance.appendChild(document.createTextNode(parseFloat(balance)))
                tr.appendChild(td_account)
                tr.appendChild(td_balance)
                table_body.appendChild(tr);
            });
        });
    });
}

$(document).on('click', '#pay-button', function () {
    var table_body = document.getElementById("table-accounts");
    var from_account = $("#accounts-selector option:selected").text()
    var to_account = $("#pay-to-account").text()
    console.log('to-account', to_account)
    console.log("from_account", from_account)
    /*
    contract.methods.sendCoin("0x2c892f27Da5B175B44772E97dBebEC9308ee38E2", 40050).send(
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
        
    load_table()

});

