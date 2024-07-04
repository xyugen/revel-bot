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

        await interaction.deferReply();
        if (!url.match(isURL)) {
            await interaction.reply('Invalid URL');
            return;
        }

        const shortUrl = await shortenUrl(url);
        const embed = new EmbedBuilder()
            .setTitle(`Shortened URL: ${shortUrl}`)
            .setColor(0xFF0000);

        await interaction.editReply({ embeds: [embed] });
    }
}