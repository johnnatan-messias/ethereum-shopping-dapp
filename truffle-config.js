module.exports = {
  // Uncommenting the defaults below 
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  //
  networks: {
    ropsten: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "3",
      from: "0x2c892f27Da5B175B44772E97dBebEC9308ee38E2"
    },
    test: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777"
    }
  }
  //
};
