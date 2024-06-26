import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { bot } from "../index";
import { Song } from "../structs/Song";

export default {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Play a song")
        .addStringOption(option => option
            .setName("song")
            .setDescription("The song to play")
            .setRequired(true)
        ),
    cooldown: 3,
    persmissions: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
    async execute(interaction: ChatInputCommandInteraction, input: string) {
        let argSongName = interaction.options.getString("song");
        if (!argSongName) argSongName = input;

        const guildMember = interaction.guild!.members.cache.get(interaction.user.id);
        const { channel } = guildMember!.voice;

        if (!channel)
            return interaction.reply({ content: "You need to be in a voice channel to use this command." });
        
        // TODO: Add support for playlists
        // const queue = bot.queues.get(interaction.guildId!);

        const url = argSongName;

        if (interaction.replied) await interaction.editReply("⏳ Loading...").catch(console.error);

        let song: Song;

        try {
            song = await Song.from(url, url);
        } catch(error: any) {
            console.error(error);

            if (error.name === "NoResults")
                return interaction
                    .reply({ content: `No results for ${url}.`, ephemeral: true })
                    .catch(console.error)
            
            if (error.name == "InvalidURL")
                return interaction
                    .reply({ content: `Invalid url ${url}.`, ephemeral: true })
                    .catch(console.error);

            if (interaction.replied)
                return await interaction.editReply({ content: "Command error" }).catch(console.error);
            else return interaction.reply({ content: "Command error", ephemeral: true }).catch(console.error);
        }

        // TODO: Add the song to queue

        //interaction.deleteReply().catch(console.error);
        // TODO: Play the song in the voice channel
        interaction.editReply(`Playing ${song.title} - ${song.url}`);
    }
}