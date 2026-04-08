const { ethers } = require("ethers");
const { abi } = require("./abi.json");

// Configuración común para reutilizar el contrato
function getContract(withSigner = false) {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    if (withSigner) {
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        return new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);
    }
    return new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, provider);
}

async function registrarEnBlockchain(datos, fotoUrl, nivelConfianza) {
    try {
        const contrato = getContract(true);
        console.log(`📡 Registrando a: ${datos.nombre}...`);

        const tx = await contrato.registrarPerro(
            datos.nombre,
            datos.raza || "Mix",
            datos.color || "Mix",
            datos.tamano || "M",
            datos.distrito,
            datos.zona || "Centro",
            fotoUrl,
            nivelConfianza,
            datos.padrino
        );

        await tx.wait();
        return tx;
    } catch (error) {
        console.error("❌ Error en registro:", error);
        throw error;
    }
}

async function obtenerDatosPerro(id) {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const contrato = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, provider);
        
        // 1. Obtenemos los datos del perro desde el Smart Contract
        const perro = await contrato.verPerro(id);
        
        // 2. ⚡ SOLUCIÓN: Obtenemos el balance REAL de la cuenta del contrato en ZK
        // Esto lee cuánto dinero (tSYS) hay físicamente en la dirección del contrato
        const balanceContrato = await provider.getBalance(process.env.CONTRACT_ADDRESS);
        
        return {
            nombre: perro.nombre,
            raza: perro.raza,
            color: perro.color,
            tamano: perro.tamano,
            distrito: perro.distrito,
            zona: perro.zonaReferencia,
            fotoUrl: perro.imageHash,
            padrino: perro.padrino,
            confianza: Number(perro.nivelConfianza),
            verificaciones: Number(perro.verificaciones),
            // ✅ Cambiamos esto: Si el fondo individual es 0, mostramos el balance del contrato
            // Esto permite que las donaciones directas se reflejen en el bot
            fondos: ethers.formatEther(balanceContrato) 
        };
    } catch (error) {
        console.error("❌ Error al leer:", error);
        throw new Error("No existe ese perro o error de red.");
    }
}

async function registrarVerificacionEnBlockchain(perroId) {
    try {
        const contrato = getContract(true);
        console.log(`🦴 Verificando alimentación para ID: ${perroId}...`);
        
        const tx = await contrato.registrarVerificacion(perroId);
        await tx.wait();
        return tx;
    } catch (error) {
        console.error("❌ Error en verificación:", error);
        throw error;
    }
}

module.exports = { 
    registrarEnBlockchain, 
    obtenerDatosPerro, 
    registrarVerificacionEnBlockchain 
};