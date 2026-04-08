const { ethers } = require("ethers");
const { abi } = require("./abi.json"); 

async function registrarEnBlockchain(datos, fotoUrl, nivelConfianza) {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contrato = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

            console.log(`📡 Enviando transacción a zkSYS para: ${datos.nombre}...`);

            const tx = await contrato.registrarPerro(
                datos.nombre,           // 1. string nombre
                datos.raza || "Mix",    // 2. string raza
                datos.color || "Mix",   // 3. string color
                datos.tamano || "M",    // 4. string tamano
                datos.distrito,         // 5. string distrito
                datos.zona || "Centro", // 6. string zonaReferencia
                fotoUrl,                // 7. string imageHash (LA FOTO VA AQUÍ)
                nivelConfianza,         // 8. uint nivelConfianza (EL NÚMERO VA AQUÍ)
                datos.padrino           // 9. address padrino (LA WALLET VA AL FINAL)
            );

            console.log("⏳ Esperando confirmación de la red...");
        await tx.wait(); // Esperamos a que se mine el bloque
        
        return tx;
    } catch (error) {
        console.error("❌ Error detallado en Blockchain:", error);
        throw error;
    }
}

module.exports = { registrarEnBlockchain };

async function obtenerDatosPerro(id) {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const contrato = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, provider);

        // Llamamos a la función "view" del contrato inteligente
        const perro = await contrato.verPerro(id);
        
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
            fondos: ethers.formatEther(perro.fondos) // Convierte de Wei a SYS
        };
    } catch (error) {
        console.error("❌ Error al leer blockchain:", error);
        throw new Error("No encontré ese ID o hay un error de red.");
    }
}

module.exports = { registrarEnBlockchain, obtenerDatosPerro };