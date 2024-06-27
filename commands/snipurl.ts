import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import shortenUrl from "../services/urlShortener";
import { isURL } from "../utils/patterns";
import { EmbedBuilder } from "@discordjs/builders";

export default {
    data: new SlashCommandBuilder()
        .setName('snipurl')
        .setDescription('Shorten a URL')
        .addStringOption(option =>
            option
                .setName('url')
                .setDescription('The URL to shorten')
                .setRequired(true)
        ),
    permissions: [],
    cooldown: 3,
    async execute(interaction: ChatInputCommandInteraction) {
        const url = interaction.options.getString('url', true);
        
        if (!url.match(isURL)) {
            await interaction.reply('Invalid URL');
            return;
        }

        await interaction.deferReply();
        const shortUrl = await shortenUrl(url);
        const embed = new EmbedBuilder()
            .setTitle(`Shortened URL: ${shortUrl}`)
            .setColor(0xFF0000);

        await interaction.reply({ embeds: [embed] });
    }
}