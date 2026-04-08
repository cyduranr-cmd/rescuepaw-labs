const axios = require("axios");

/**
 * Se comunica con el Agente Autónomo para validar registros o alimentaciones.
 * @param {string} fotoUrl - URL de la imagen subida a Discord.
 * @param {object} datosPerro - Metadatos (nombre, raza, distrito, etc).
 * @param {string} contexto - "registro" o "alimentación".
 */
async function consultarAgente(fotoUrl, datosPerro, contexto) {
    const AGENTE_URL = process.env.AGENTE_URL || "http://localhost:5000/validar";

    try {
        console.log(`🧠 Consultando al Agente [Contexto: ${contexto}] para: ${datosPerro.nombre}...`);
        
        const response = await axios.post(AGENTE_URL, {
            url: fotoUrl,
            metadata: datosPerro,
            contexto: contexto // Enviamos el contexto para que la IA sepa qué buscar
        }, { timeout: 15000 }); // 15 segundos porque la IA de visión puede tardar

        return response.data;

    } catch (error) {
        console.error("❌ Error en la comunicación con el Agente:", error.message);
        
        // En el proyecto final, si el agente falla, RECHAZAMOS por seguridad.
        return { 
            decision: "RECHAZAR", 
            confianza: 0, 
            motivo: "El sistema de validación (Agente) se encuentra fuera de línea. Intente más tarde." 
        };
    }
}

module.exports = { consultarAgente };