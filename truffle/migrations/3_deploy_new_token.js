/*const DaoFactory = artifacts.require("DaoFactory");
const NewDao = artifacts.require("NewDao");
const NewToken = artifacts.require("NewToken");

module.exports = async function (deployer, network, accounts) {

  const daoFactory = await DaoFactory.deployed();
  await deployer.deploy(NewDao, daoFactory.address, "MyNewDao");
  const tokenName = "NewToken";
  const tokenSymbol = "NTK";
  const adminAddress = accounts[1]; // Constructor // Owner = DaoAdmin ou 1?
  
  await deployer.deploy(NewToken, adminAddress, tokenName, tokenSymbol);
  
};*/

const DaoFactory = artifacts.require("DaoFactory");
const NewDao = artifacts.require("NewDao");
const NewToken = artifacts.require("NewToken");

module.exports = function (deployer, network, accounts) {
  deployer.then(async () => {
    const daoFactory = await DaoFactory.deployed();
    await deployWithDelay(deployer, () => deployer.deploy(NewDao, daoFactory.address, "MyNewDao"), 100000);

    const tokenName = "NewToken";
    const tokenSymbol = "NTK";
    const adminAddress = accounts[1];
    
    await deployWithDelay(deployer, () => deployer.deploy(NewToken, adminAddress, tokenName, tokenSymbol), 100000);
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










