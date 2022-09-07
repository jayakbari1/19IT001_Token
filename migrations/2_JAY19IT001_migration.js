const JAY19IT001 = artifacts.require("./JAY19IT001.sol");
const JAY19IT001TokenSale = artifacts.require("./JAY19IT001TokenSale.sol");
const tokenPrice = 1000000000000000; // in wei
module.exports = function(deployer) {
    deployer.deploy(JAY19IT001, 1000000).then(() => {
        return deployer.deploy(JAY19IT001TokenSale, JAY19IT001.address, tokenPrice);
    });
};