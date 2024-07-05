import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
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

        interaction.reply("⏳ Generating response...");
        const chatCompletion: ChatCompletion = await getGroqChatCompletion(query, user);
        const chatContent = chatCompletion.choices[0].message.content || "";

        interaction.editReply({ content: chatContent });
    }
}