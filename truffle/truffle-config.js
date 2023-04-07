const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  
  contracts_build_directory: "../client/src/contracts",
  networks: {
      development: {
        host: "127.0.0.1",     
        port: 8545,            
        network_id: "*",       
       },

       mumbai :{
        provider : function(){
          return new HDWalletProvider({mnemonic:{phrase:`${process.env.MNEMONIC}`}, providerOrUrl:`https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`})},
        network_id: 80001,
       },

       goerli :{
        provider : function(){
          return new HDWalletProvider({mnemonic:{phrase:`${process.env.MNEMONIC}`}, providerOrUrl:`https://goerli.infura.io/v3/${process.env.INFURA_ID}`})},
        network_id: 5,
       },
  },

  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions : { 
      gasPrice:1,
      token:'ETH',
      showTimeSpent: true,
    }
  },

  compilers: {
    solc: {
      version: "0.8.18",  
      settings: {          
        optimizer: {
          enabled: true,
          runs: 100
        }, 
        
      },
    },
  }, 

};