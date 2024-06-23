import { ActionRowBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js";
import YouTube, { Video } from "youtube-sr";

export default {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Search a song")
        .addStringOption(option => option
            .setName("query")
            .setDescription("The song to search for")
            .setRequired(true)
        ),
    cooldown: 3,
    persmissions: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
    async execute(interaction: ChatInputCommandInteraction, input: string) {
        let query = interaction.options.getString("query", true);
        const member = interaction.guild!.members.cache.get(interaction.user.id);

        if (!member?.voice.channel) 
            interaction.editReply({ content: "You must be in a voice channel to use this command." }).catch(console.error);

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
                if (!(selectInteraction instanceof StringSelectMenuBuilder)) return;

                selectInteraction.update({ content: "⏳ Loading the selected songs...", components: [] });

                // TODO: Make the bot play the selected song
            })
            .catch(console.error);
    }
}