const axios = require('axios');
/**
 * Este es el "puente" entre el Chatbot y el Agente Autónomo (OpenClaw).
 * Si el agente no responde, el bot usará un modo de emergencia.
 */
async function consultarAgente(fotoUrl, datosPerro) {
    const AGENTE_URL = process.env.AGENTE_URL || "http://localhost:5000/validar";

    try {
        console.log(`🧠 Consultando al Agente Autónomo para: ${datosPerro.nombre}...`);
        
        // Intentamos conectar con el Agente (Fase 4)
        const response = await axios.post(AGENTE_URL, {
            url: fotoUrl,
            metadata: datosPerro
        }, { timeout: 10000 }); // Esperamos máximo 10 segundos

        return response.data;

    } catch (error) {
        // MODO DE EMERGENCIA: Si el agente no está creado o está apagado, 
        // dejamos pasar el registro con confianza 1 para que puedas probar el bot.
        console.warn("⚠️ Agente Autónomo no detectado (Offline). Usando modo de prueba.");
        return { 
            decision: "APROBAR", 
            confianza: 1, 
            motivo: "Modo Desarrollo: Agente no disponible" 
        };
    }
}

module.exports = { consultarAgente };