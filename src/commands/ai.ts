import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import getGroqChatCompletion from "../services/groq";
import { ChatCompletion } from "groq-sdk/resources/chat/completions";

export default {
    data: new SlashCommandBuilder()
        .setName("ai")
        .setDescription("Ask the AI something")
        .addStringOption(option => option
            .setName("query")
            .setDescription("The question to ask")
            .setRequired(true)
        ),
    permissions: [],
    cooldown: 3,
    execute: async (interaction: ChatInputCommandInteraction, input: string) => {
        const query = interaction.options.getString("query") ?? "";
        const user = interaction.user.username;

        interaction.deferReply();
        const chatCompletion: ChatCompletion = await getGroqChatCompletion(query, user);
        const chatContent = chatCompletion.choices[0].message.content || "";

        const bot = interaction.client.user!;
        const avatar = bot.displayAvatarURL();
        const embed = new EmbedBuilder()
            .setColor('#d16c1f')
            .setAuthor({ name: 'Revel AI Bot', iconURL: avatar, url: 'https://github.com/xyugen/revel-bot' })
            .addFields(
                {
                    name: "Question",
                    value: query,
                    inline: false
                },
                {
                    name: "Response",
                    value: chatContent,
                    inline: false
                }
            )

        await interaction.editReply({ embeds: [embed] });
    }
}