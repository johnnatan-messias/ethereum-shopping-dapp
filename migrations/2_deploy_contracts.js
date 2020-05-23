const ConvertLib = artifacts.require("ConvertLib");
const SBCoin = artifacts.require("SBCoin");

module.exports = function (deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, SBCoin);
  deployer.deploy(SBCoin);
};
