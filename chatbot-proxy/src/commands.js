const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
require('dotenv').config();

const commands = [
    // COMANDO PARA REGISTRAR PERRO (Llamada al Proxy -> Agente -> Blockchain)
    new SlashCommandBuilder()
        .setName('registrar_perro')
        .setDescription('Registra un perrito rescatado (El Bot paga el gas del registro)')
        .addStringOption(option => option.setName('nombre').setDescription('Nombre del perro').setRequired(true))
        .addStringOption(option => option.setName('raza').setDescription('Raza o mezcla').setRequired(true))
        .addStringOption(option => option.setName('color').setDescription('Color principal').setRequired(true))
        .addStringOption(option => option.setName('tamano').setDescription('Tamaño (Pequeño, Mediano, Grande)').setRequired(true))
        .addStringOption(option => option.setName('distrito').setDescription('Distrito del hallazgo').setRequired(true))
        .addStringOption(option => option.setName('zona').setDescription('Referencia de la zona').setRequired(true))
        .addStringOption(option => option.setName('wallet_padrino').setDescription('Dirección de tu Pali Wallet (0x...)').setRequired(true))
        .addAttachmentOption(option => option.setName('foto').setDescription('Foto del perro para validación del Agente').setRequired(true)),

    // COMANDO PARA DONAR (Modo Híbrido: Instrucciones para usar Pali Wallet)
    new SlashCommandBuilder()
        .setName('donar')
        .setDescription('Obtén los datos para donar TSYS reales desde tu Pali Wallet')
        .addIntegerOption(option => option.setName('id').setDescription('ID del perro en la blockchain').setRequired(true)),

    // COMANDO PARA VER ESTADO
    new SlashCommandBuilder()
        .setName('ver_perro')
        .setDescription('Consulta los datos de un perro registrado')
        .addIntegerOption(option => option.setName('id').setDescription('ID del perro').setRequired(true)),
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {
    try {
        console.log('Refreshing slash commands...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID), // Necesitas el Client ID de tu Bot
            { body: commands },
        );
        console.log('Successfully reloaded slash commands.');
    } catch (error) {
        console.error(error);
    }
}

module.exports = { deployCommands };