const axios = require("axios");
require("dotenv").config();

async function obtenerRespuestaIA(mensajeUsuario) {
    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "openrouter/free", // O el modelo que prefieras
            messages: [
                { 
                    role: "system", 
                    content: "Eres el Proxy de RescuePaw Labs. Tu misión es ayudar a rescatar perros en zkSYS. Respondes dudas sobre el proyecto y guías a los usuarios para usar /registrar_perro." 
                },
                { role: "user", content: mensajeUsuario }
            ]
        }, {
            headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}` }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error en IA:", error);
        return "🐾 El agente está analizando datos en la blockchain ahora mismo. ¡Pregúntame de nuevo en un momento!";
    }
}

module.exports = { obtenerRespuestaIA };