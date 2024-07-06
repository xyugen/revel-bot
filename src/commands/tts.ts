import { ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { bot } from "../";
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel, NoSubscriberBehavior, VoiceConnectionStatus } from "@discordjs/voice";
import { replaceIdToName } from "../utils/helper";
import { getAudio } from "../services/deepgram";

export default {
    data: new SlashCommandBuilder()
        .setName("tts")
        .setDescription("Convert text to speech")
        .addChannelOption(option => option
            .setName("text-channel")
            .setDescription("The text channel to convert the message in")
            .setRequired(false)
        ),
        // Voice permissions
    permissions: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak],
    cooldown: 3,
    async execute(interaction: ChatInputCommandInteraction, input: string) {
        const channel = interaction.options.getChannel("text-channel", false) || interaction.channel;

        const guildMember = interaction.guild!.members.cache.get(interaction.user.id);
        const { channel: voiceChannel } = guildMember!.voice;

        if (!voiceChannel) {
            return interaction.reply({ content: "You need to be in a voice channel to use this command.", ephemeral: true });
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        await interaction.reply({ content: "Connected to voice channel!\nUse `r!disconnect` to disconnect." }).catch(console.error);

        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Stop,
            }
        });

        connection.on(VoiceConnectionStatus.Disconnected, (state) => {
            interaction.channel?.send("Disconnected from voice channel");
            player.stop();
            connection.destroy();
            return;
        });

        bot.client.on("messageCreate", async (message) => {
            if (message.author.bot) return;
            if (message.content.trim() === "r!disconnect") {
                player.stop();
                connection.destroy();
            }

            let replacedContent = message.content;
            if (message.channelId === channel!.id) {
                for (const user of message.mentions.users.values()) {
                    replacedContent = replaceIdToName(message.content, user);
                }

                // Text to speech
                const resource = createAudioResource(
                    await getAudio(replacedContent),
                )

                getVoiceConnection(voiceChannel.guild.id)?.subscribe(player);
                player.play(resource);

                //TODO: allow the bot to receive multiple messages
            }
        });
    }
}