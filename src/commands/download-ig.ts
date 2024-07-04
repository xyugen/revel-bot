import { AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import instagramGetUrl from "instagram-url-direct";
import { igPattern } from "../utils/patterns"
import { File } from "../structs/File";
import { FileMetadata } from "../interfaces/FileMetadata";

interface IGData {
    results_number: number,
    url_list: string[]
}

export default {
    data: new SlashCommandBuilder()
        .setName("download-ig")
        .setDescription("Download media from Instagram.")
        .addStringOption((option) => option
            .setName("url")
            .setDescription("The URL to download")
            .setRequired(true)
        ),
    cooldown: 3,
    permissions: [],
    async execute(interaction: ChatInputCommandInteraction, input: string) {
        const url = interaction.options.getString("url") || input;

        if (!url.match(igPattern))
            return interaction.reply({ content: "Invalid Instagram URL.", ephemeral: true });

        await interaction.deferReply();

        const links: IGData = await instagramGetUrl(url);
        const file: File | null = await File.getFileMetadata(links.url_list[0]);

        if (file) {
            const attachment = new AttachmentBuilder(file!.url)
                .setName(file.fileName)
                .setFile(file.url);

            await interaction.editReply({
                content: `✅ Download complete. ${file.contentLength} bytes.`,
                files: [attachment]
            });
        } else {
            await interaction.editReply({ content: "An error occurred while downloading the media." });
        }
    }
}