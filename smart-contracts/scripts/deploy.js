const hre = require("hardhat");
const { Wallet, Provider, ContractFactory } = require("zksync-ethers");

async function main() {
  const url = hre.network.config.url;
  const privateKey = hre.network.config.accounts[0];

  const provider = new Provider(url);
  const wallet = new Wallet(privateKey, provider);

  console.log("🛰️ Red:", hre.network.name);
  console.log("🛰️ Deployer:", wallet.address);

  const artifact = await hre.artifacts.readArtifact("RescuePaw");
  
  console.log("📊 Longitud del Bytecode:", artifact.bytecode.length / 2, "bytes");

  const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet);

  console.log("🚀 Desplegando...");

  try {
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    const address = await contract.getAddress();

    console.log("-----------------------------------------------");
    console.log("✅ ¡CONTRATO DESPLEGADO CON ÉXITO!");
    console.log("📍 Dirección:", address);
    console.log("-----------------------------------------------");

  } catch (error) {
    console.error("❌ Error:");
    console.error(error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});