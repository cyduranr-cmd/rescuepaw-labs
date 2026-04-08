require("@nomicfoundation/hardhat-toolbox");
require("@matterlabs/hardhat-zksync-solc");
require("@matterlabs/hardhat-zksync-deploy"); // Agregamos este para el deploy en zk
require("dotenv").config();

module.exports = {
  zksolc: {
    version: "1.5.3", 
    settings: {
      optimizer: { enabled: true },
    },
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris", 
    },
  },
  networks: {
    zksys: {
      url: "https://rpc-zk.tanenbaum.io/",
      chainId: 57057,
      accounts: [process.env.PRIVATE_KEY],
      zksync: true, // Esto es vital para que Hardhat use el compilador zksolc
      ethNetwork: "sepolia", // Indica que zkSYS es una L2 de prueba
      verifyURL: "https://explorer-zk.tanenbaum.io/contract_verification"
    },
  },
};