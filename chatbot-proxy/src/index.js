require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require("discord.js");
const { obtenerRespuestaIA } = require("./ai");

// ✅ CORRECCIÓN: Importamos las TRES funciones necesarias de blockchain.js
const { registrarEnBlockchain, obtenerDatosPerro, registrarVerificacionEnBlockchain } = require("./blockchain"); 

const { consultarAgente } = require("./agent-client");
const { deployCommands } = require("./commands");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent 
    ]
});

client.once("ready", async () => {
    console.log(`🤖 Proxy AI Online: ${client.user.tag}`);
    try {
        console.log("🚀 Registrando comandos en Discord...");
        await deployCommands(); 
        console.log("✅ ¡Comandos registrados y listos!");
    } catch (error) {
        console.error("❌ Error al registrar comandos:", error);
    }
    client.user.setActivity("zkSYS Testnet 🐾", { type: ActivityType.Watching });
});

// --- ESCUCHADOR DE MENCIONES (@bot) ---
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (message.mentions.has(client.user)) {
        const prompt = message.content.replace(`<@${client.user.id}>`, "").trim();
        if (!prompt) return message.reply("¡Hola! Soy el Proxy de RescuePaw. ¿En qué puedo ayudarte hoy? 🐕");

        await message.channel.sendTyping();
        const respuesta = await obtenerRespuestaIA(prompt);
        await message.reply(respuesta);
    }
});

// --- ESCUCHADOR DE COMANDOS ---
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // --- COMANDO: REGISTRAR ---
    if (interaction.commandName === "registrar_perro") {
        await interaction.deferReply();
        try {
            const datos = {
                nombre: interaction.options.getString("nombre"),
                raza: interaction.options.getString("raza"),
                color: interaction.options.getString("color"),
                tamano: interaction.options.getString("tamano"),
                distrito: interaction.options.getString("distrito"),
                zona: interaction.options.getString("zona"),
                padrino: interaction.options.getString("wallet_padrino")
            };
            
            const foto = interaction.options.getAttachment("foto");
            if (!foto) return interaction.editReply("❌ Debes incluir una foto.");
    
            const veredicto = await consultarAgente(foto.url, datos, "registro"); 
            if (veredicto.decision === "RECHAZAR") {
                return interaction.editReply(`❌ Bloqueado por seguridad: ${veredicto.motivo}`);
            }
    
            const tx = await registrarEnBlockchain(datos, foto.url, veredicto.confianza);
            await interaction.editReply(`✅ ¡Perro en Blockchain! \n🔗 **Hash:** \`${tx.hash}\` \n🐾 **Nombre:** ${datos.nombre}`);
    
        } catch (error) {
            console.error("❌ Error en el proceso:", error);
            await interaction.editReply(`❌ Hubo un error: ${error.message}`);
        }
    }

    // --- COMANDO: VER PERRO ---
    if (interaction.commandName === "ver_perro") {
        await interaction.deferReply();
        const id = interaction.options.getInteger("id");
        try {
            const datos = await obtenerDatosPerro(id);
            const embed = new EmbedBuilder()
                .setTitle(`🐾 Ficha de Rescate: ${datos.nombre}`)
                .setColor(datos.confianza >= 2 ? 0x2ecc71 : 0xf1c40f)
                .setThumbnail(datos.fotoUrl)
                .addFields(
                    { name: "🆔 ID", value: id.toString(), inline: true },
                    { name: "🐕 Raza", value: datos.raza, inline: true },
                    { name: "📍 Distrito", value: datos.distrito, inline: true },
                    { name: "🦴 Verificaciones", value: `${datos.verificaciones}/3`, inline: true },
                    { name: "💰 Fondos", value: `${datos.fondos} TSYS`, inline: true },
                    { name: "👤 Padrino", value: `\`${datos.padrino.substring(0, 6)}...${datos.padrino.substring(38)}\``, inline: true }
                )
                .setImage(datos.fotoUrl)
                .setFooter({ text: "Datos validados por Agente IA en zkSYS" })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply(`❌ No se encontró el perro con ID **${id}**.`);
        }
    }

    // --- COMANDO: DONAR ---
    if (interaction.commandName === "donar") {
        const id = interaction.options.getInteger("id");
        const embedDonar = new EmbedBuilder()
            .setTitle("🙌 ¡Ayuda a un Rescatado!")
            .setColor(0x3498db)
            .setDescription(`Estás consultando cómo donar al perrito con **ID: ${id}**`)
            .addFields(
                { name: "🔑 Dirección del Contrato", value: `\`${process.env.CONTRACT_ADDRESS}\`` },
                { name: "🪙 Moneda", value: "TSYS (Syscoin Testnet)", inline: true },
                { name: "📝 Nota", value: `Incluye el ID ${id} en tu transferencia.` }
            )
            .setFooter({ text: "Las donaciones van directo al Smart Contract" });

        await interaction.reply({ embeds: [embedDonar] });
    }

    // --- COMANDO: ALIMENTAR ---
    if (interaction.commandName === "alimentar") {
        await interaction.deferReply();
        const id = interaction.options.getInteger("id");
        const foto = interaction.options.getAttachment("foto");
        
        try {
            const datosBlockchain = await obtenerDatosPerro(id);
            const veredicto = await consultarAgente(foto.url, datosBlockchain, "alimentación");
    
            if (veredicto.decision === "RECHAZAR") {
                return interaction.editReply(`❌ **Rechazado:** ${veredicto.motivo}`);
            }
    
            const tx = await registrarVerificacionEnBlockchain(id);
    
            const embedExito = new EmbedBuilder()
                .setTitle("🦴 Alimentación Validada")
                .setColor(0x2ecc71)
                .setDescription(`El Agente validó la prueba para **${datosBlockchain.nombre}**.`)
                .addFields(
                    { name: "✅ Verificaciones", value: `${parseInt(datosBlockchain.verificaciones) + 1}/3`, inline: true },
                    { name: "🔗 Hash", value: `\`${tx.hash.substring(0, 20)}...\``, inline: true }
                )
                .setImage(foto.url);

            await interaction.editReply({ embeds: [embedExito] });
        
        } catch (error) {
            await interaction.editReply(`❌ Error: ${error.message}`);
        }
    }

    // --- COMANDO: RETIRAR FONDOS ---
    if (interaction.commandName === "retirar_fondos") {
        await interaction.deferReply();
        const id = interaction.options.getInteger("id");
        try {
            const datos = await obtenerDatosPerro(id);
            const listo = datos.verificaciones >= 3;

            const embedRetiro = new EmbedBuilder()
                .setTitle(`🏦 Retiro de Fondos: ${datos.nombre}`)
                .setColor(listo ? 0x2ecc71 : 0xe74c3c)
                .setDescription(listo 
                    ? "✅ **¡Condiciones cumplidas!** El padrino ya puede retirar los fondos desde su Pali Wallet." 
                    : `❌ **Aún no disponible.** Se requieren 3 verificaciones (tienes ${datos.verificaciones}).`)
                .addFields(
                    { name: "💰 Saldo", value: `${datos.fondos} TSYS`, inline: true },
                    { name: "👤 Padrino", value: `\`${datos.padrino}\`` }
                );

            await interaction.editReply({ embeds: [embedRetiro] });
        } catch (error) {
            await interaction.editReply("❌ Error al consultar fondos.");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);