require("@nomicfoundation/hardhat-toolbox");
require("@matterlabs/hardhat-zksync-solc");
require("@matterlabs/hardhat-zksync-deploy");
require("@matterlabs/hardhat-zksync-verify");
require("dotenv").config();

module.exports = {
  paths: {
    artifacts: "./artifacts-zk",
    cache: "./cache-zk",
  },
  zksolc: {
    version: "1.5.3", 
    settings: {
      optimizer: { enabled: true },
    },
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { 
        enabled: true, 
        runs: 200 
      },      
    },
  },
  networks: {
    zksys: {
      url: "https://rpc-zk.tanenbaum.io/",
      chainId: 57057,
      accounts: [process.env.PRIVATE_KEY],
      zksync: true,
      ethNetwork: "sepolia",
      verifyURL: "https://explorer-zk.tanenbaum.io/api" 
    },
  },
};