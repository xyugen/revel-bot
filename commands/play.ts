import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { bot } from "../index";

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

        if (interaction.replied) await interaction.reply("⏳ Loading...").catch(console.error);

        let song;

        // try {
        //     // song: Song = await song.from(url);
        // }
    }
}