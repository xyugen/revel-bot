import { ChatInputCommandInteraction, SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import { fetchImageBuffer } from "../utils/helper";
import sharp, { FormatEnum } from "sharp";

// Available formats and format mappings
const formatMappings: { [key: string]: keyof FormatEnum } = {
    png: 'jpeg',
    webp: 'jpeg',
    jpg: 'png',
    jpeg: 'png'
}

export default {
    data: new SlashCommandBuilder()
        .setName("convertimg")
        .setDescription("Convert an image format (e.g., JPG to PNG, PNG to JPG)")
        .addAttachmentOption(option =>
            option.setName("image")
                .setDescription("The image to convert")
                .setRequired(true)
        ),
    cooldown: 3,
    async execute(interaction: ChatInputCommandInteraction) {
        const image = interaction.options.getAttachment("image", true);

        if (!image.contentType) {
            return interaction.reply({ content: "Unable to determine image format", ephemeral: true });
        }

        const formatFrom = image.contentType.split("/")[1];
        const imageName = image.name.split(".").slice(0, -1).join(".");

        const formatTo = formatMappings[formatFrom];

        if (!formatTo) {
            return interaction.reply({ content: "Unsupported image format for conversion", ephemeral: true });
        }

        try {
            const imageBuffer = await fetchImageBuffer(image.url);
            const formatType: keyof FormatEnum = formatTo as keyof FormatEnum;
            const buffer = await sharp(imageBuffer).toFormat(formatType).toBuffer();

            const attachment = new AttachmentBuilder(buffer).setName(`${imageName}.${formatTo}`);

            await interaction.reply({
                content: `✅ Converted ${formatFrom.toUpperCase()} to ${formatTo.toUpperCase()}.`,
                files: [attachment]
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: "Failed to convert image", ephemeral: true });
        }
    }
}