import { ActionRowBuilder, AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import instagramGetUrl from "instagram-url-direct";
import { igPattern } from "../utils/patterns";
import { File } from "../structs/File";
import shortenUrl from "../services/urlShortener";

interface IGData {
    results_number: number;
    url_list: string[];
}

const commandData = new SlashCommandBuilder()
    .setName("download-ig")
    .setDescription("Download media from Instagram.")
    .addStringOption(option =>
        option.setName("url")
            .setDescription("The URL to download")
            .setRequired(true)
    );

const execute = async (interaction: ChatInputCommandInteraction, input: string) => {
    const url = interaction.options.getString("url") || input;

    if (!url.match(igPattern)) {
        return interaction.reply({ content: "Invalid Instagram URL.", ephemeral: true });
    }

    await interaction.reply({ content: "⏳ Downloading..." });

    try {
        const links: IGData = await instagramGetUrl(url);

        if (links.results_number === 0) {
            await interaction.editReply({ content: "No results found." });
            return;
        }

        if (links.results_number === 1) {
            await downloadSingleMedia(interaction, links.url_list[0]);
            return;
        }

        await presentOptions(interaction, links.url_list);
    } catch (error) {
        console.error("Error during execution:", error);
        await interaction.editReply({ content: "An error occurred while processing your request." });
    }
};

/**
 * Downloads a single media file from the given link and sends it as a reply to the interaction.
 *
 * @param {ChatInputCommandInteraction} interaction - The Discord interaction object.
 * @param {string} link - The URL of the media file to download.
 * @return {Promise<void>} A promise that resolves when the download and reply are complete.
 */
const downloadSingleMedia = async (interaction: ChatInputCommandInteraction, link: string): Promise<void> => {
    const file = await File.getFileMetadata(link);
    if (file) {
        const attachment = new AttachmentBuilder(file.url)
            .setName(file.fileName)
            .setFile(file.url);

        await interaction.editReply({
            content: `✅ Download complete.`,
            files: [attachment]
        });
    }
};

/**
 * Presents options for downloading media to the user via a Discord interaction.
 *
 * @param {ChatInputCommandInteraction} interaction - The Discord interaction object.
 * @param {string[]} urlList - An array of URLs for the media to download.
 * @return {Promise<void>} A promise that resolves when the options are presented.
 */
const presentOptions = async (interaction: ChatInputCommandInteraction, urlList: string[]): Promise<void> => {
    const optionPromises = urlList.map(async (link, index) => ({
        label: `Media ${index + 1}`,
        value: await shortenUrl(link)
    }));

    const options = await Promise.all(optionPromises);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("media-select")
            .setPlaceholder("Select a media")
            .setMinValues(1)
            .setMaxValues(options.length)
            .addOptions(options)
    );

    const attachments: AttachmentBuilder[] = [];

    const followUp = await interaction.followUp({
        content: "Please select a media to download.",
        components: [row]
    });

    const selectInteraction = await followUp.awaitMessageComponent({
        time: 30000,
    });

    if (selectInteraction instanceof StringSelectMenuInteraction) {
        await handleMediaSelection(interaction, selectInteraction, attachments);
    } else {
        console.error("Unexpected interaction type received.");
    }
};

/**
 * Handles the selection of media by the user in a Discord interaction.
 *
 * @param {ChatInputCommandInteraction} interaction - The Discord interaction object.
 * @param {StringSelectMenuInteraction} selectInteraction - The select menu interaction for selecting media.
 * @param {AttachmentBuilder[]} attachments - An array to store the attachments of selected media.
 */
const handleMediaSelection = async (
    interaction: ChatInputCommandInteraction,
    selectInteraction: StringSelectMenuInteraction,
    attachments: AttachmentBuilder[]
) => {
    selectInteraction.update({ content: "⏳ Loading the selected media...", components: [] });

    const promises = selectInteraction.values.map(async (link) => {
        const file = await File.getFileMetadata(link);
        if (file) {
            const attachment = new AttachmentBuilder(file.url)
                .setName(file.fileName)
                .setFile(file.url);

            attachments.push(attachment);
        }
    });

    await Promise.all(promises);

    if (interaction.replied) {
        await interaction.editReply({
            content: `✅ Download complete. [${attachments.length} files]`,
            files: attachments.map(attachment => attachment)
        });
    } else {
        await interaction.reply({
            content: `✅ Download complete. [${attachments.length} files]`,
            files: attachments.map(attachment => attachment)
        });
    }

    await selectInteraction.deleteReply().catch(console.error);
};

export default {
    data: commandData,
    cooldown: 3,
    permissions: [],
    execute,
};