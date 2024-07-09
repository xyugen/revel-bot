import { ChatInputCommandInteraction, GuildMember, PermissionsBitField, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute or unmute a user")
        .addStringOption((option) => option
            .setName("action")
            .setDescription("The action to perform")
            .setRequired(true)
            .addChoices(
                { name: "mute", value: "mute" },
                { name: "unmute", value: "unmute" }
            )
        )
        .addUserOption((option) => option
            .setName("user")
            .setDescription("The user to perform the action on")
            .setRequired(true)
        ),
    permissions: [PermissionsBitField.Flags.ModerateMembers, PermissionsBitField.Flags.MuteMembers],
    cooldown: 3,
    async execute (interaction: ChatInputCommandInteraction, input: string) {
        const action = interaction.options.getString("action", true);
        const targetUser = interaction.options.getMember("user") as GuildMember;

        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ModerateMembers && PermissionsBitField.Flags.MuteMembers)) {
            return await interaction.reply({ content: 'You do not have permission to mute/unmute members.', ephemeral: true });
        }

        if (!targetUser.voice) {
            return await interaction.reply({ content: 'That user is not in a voice channel.', ephemeral: true });
        }

        try {
            if (action === "mute") {
                targetUser.voice.setMute(true, 'Muted by command');
                await targetUser.voice.setMute(true, 'Muted by command');
                await interaction.reply({ content: `${targetUser.user.tag} has been muted in voice channels.` });
            } else if (action === "unmute") {
                await targetUser.voice.setMute(false, 'Unmuted by command');
                await interaction.reply({ content: `${targetUser.user.tag} has been unmuted in voice channels.` });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'An error occurred while performing the action.', ephemeral: true });
        }
    }
}