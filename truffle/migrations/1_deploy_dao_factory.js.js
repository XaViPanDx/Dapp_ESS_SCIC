/*const DaoFactory = artifacts.require("DaoFactory");

module.exports = function (deployer) {

  deployer.deploy(DaoFactory);
  
};*/

const DaoFactory = artifacts.require("DaoFactory");

module.exports = function (deployer) {
  deployer.then(async () => {
    await deployWithDelay(deployer, DaoFactory, 100000);
  });
};

function deployWithDelay(deployer, contract, delay) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      await deployer.deploy(contract);
      resolve();
    }, delay);
  });
}
