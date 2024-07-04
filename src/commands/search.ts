import { ActionRowBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import YouTube, { Video } from "youtube-sr";
import { bot } from "..";

export default {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Search a song")
        .addStringOption(option => option
            .setName("query")
            .setDescription("The song to search for")
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("action")
            .setDescription("Choose whether to play or download the audio")
            .setRequired(false)
            .addChoices(
                { name: "play", value: "play" },
                { name: "download", value: "download" }
            )
        ),
    cooldown: 3,
    persmissions: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
    async execute(interaction: ChatInputCommandInteraction, input: string) {
        let query = interaction.options.getString("query", true);
        let action = interaction.options.getString("action");
        const member = interaction.guild!.members.cache.get(interaction.user.id);

        if (!action) action = "play";

        if (action.toLowerCase() == "play" && !member?.voice.channel) 
            return interaction.reply({ content: "You must be in a voice channel to use this command.", ephemeral: true }).catch(console.error);

        const search = query;

        await interaction.reply("⏳ Loading...").catch(console.error);

        let results: Video[] = [];

        // Search for the song
        try {
            results = await YouTube.search(search, { limit: 10, type: "video" });
        } catch (error) {
            console.error(error);
            interaction.editReply({ content: "An error occurred while searching for the song." }).catch(console.error);
            return;
        }

        // If there are no results
        if (!results || !results) {
            interaction.editReply({ content: "No results found." }).catch(console.error);
            return;
        }

        // Send the search results
        const options = results!.map((video) => {
            return {
                label: video.title ?? "",
                value: video.url
            };
        });

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("search-select")
                .setPlaceholder("Nothing selected")
                .setMinValues(1)
                .setMaxValues(10)
                .addOptions(options)
        )

        const followUp = await interaction.followUp({
            content: "Select the song you want to play",
            components: [row]
        })

        followUp
            .awaitMessageComponent({
                time: 30000,
            })
            .then((selectInteraction) => {
                if (!(selectInteraction instanceof StringSelectMenuInteraction)) return;

                selectInteraction.update({ content: "⏳ Loading the selected songs...", components: [] });

                if (action == "download") {
                    // TODO: Make the bot download the selected song
                    bot.slashCommandsMap
                        .get("download")!
                        .execute(interaction, selectInteraction.values[0])
                } else {
                    // TODO: Make the bot play the selected song
                    bot.slashCommandsMap
                        .get("play")!
                        .execute(interaction, selectInteraction.values[0])
                }
                selectInteraction.deleteReply().catch(console.error);
            })
            .catch(console.error);
    }
}