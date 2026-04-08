require("@nomicfoundation/hardhat-toolbox");
require("@matterlabs/hardhat-zksync-solc");
require("dotenv").config();

module.exports = {
  zksolc: {
    version: "1.5.3", // <--- Actualizamos de 1.3.13 a 1.5.3
    settings: {
      // Agregamos esto para asegurar que el bytecode sea perfecto
      optimizer: {
        enabled: true,
      },
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
      zksync: true, 
    },
  },
};