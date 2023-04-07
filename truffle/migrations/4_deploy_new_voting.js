/*const DaoFactory = artifacts.require("DaoFactory");
const NewDao = artifacts.require("NewDao");
const NewToken = artifacts.require("NewToken");
const NewVoting = artifacts.require("NewVoting");

module.exports = async function (deployer, network, accounts) {
  
  const daoFactory = await DaoFactory.deployed();
  await deployer.deploy(NewDao, daoFactory.address, "MyNewDao");
  const tokenName = "NewToken";
  const tokenSymbol = "NTK";
  const adminAddress = accounts[1]; // Constructor // Owner = DaoAdmin ou 1?

  await deployer.deploy(NewToken, adminAddress, tokenName, tokenSymbol);
  const newTokenInstance = await NewToken.deployed();

  await deployer.deploy(NewVoting, adminAddress, newTokenInstance.address); //, 
  
};*/

const DaoFactory = artifacts.require("DaoFactory");
const NewDao = artifacts.require("NewDao");
const NewToken = artifacts.require("NewToken");
const NewVoting = artifacts.require("NewVoting");

module.exports = function (deployer, network, accounts) {
  deployer.then(async () => {
    const daoFactory = await DaoFactory.deployed();
    await deployWithDelay(deployer, () => deployer.deploy(NewDao, daoFactory.address, "MyNewDao"),150000);

    const tokenName = "NewToken";
    const tokenSymbol = "NTK";
    const adminAddress = accounts[1];
    
    await deployWithDelay(deployer, () => deployer.deploy(NewToken, adminAddress, tokenName, tokenSymbol), 150000);
    const newTokenInstance = await NewToken.deployed();

    await deployWithDelay(deployer, () => deployer.deploy(NewVoting, adminAddress, newTokenInstance.address), 150000);
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

