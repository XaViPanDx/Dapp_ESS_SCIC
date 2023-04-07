/*const DaoFactory = artifacts.require("DaoFactory");
const NewDao = artifacts.require("NewDao");

module.exports = async function (deployer) {
  
  const daoFactory = await DaoFactory.deployed();
  await deployer.deploy(NewDao, daoFactory.address, "MyNewDao");
  
};*/

const DaoFactory = artifacts.require("DaoFactory");
const NewDao = artifacts.require("NewDao");

module.exports = function (deployer) {
  deployer.then(async () => {
    const daoFactory = await DaoFactory.deployed();
    await deployWithDelay(deployer, () => deployer.deploy(NewDao, daoFactory.address, "MyNewDao"), 100000);
  });
};

function deployWithDelay(deployer, deployFn, delay) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      await deployFn();
      resolve();
    }, delay);
  });
}

