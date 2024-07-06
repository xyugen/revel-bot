import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { withMessageHistory } from "../services/groq";

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
        try {
            const query = interaction.options.getString("query") ?? "";
            const user = interaction.user;
            
            if (interaction.user.bot) return;
            
            const config = {
                configurable: {
                    sessionId: interaction.guildId || user.id,
                }
            }

            interaction.deferReply();
            
            await withMessageHistory.invoke(
                {
                    username: user.username,
                    input: query,
                },
                config
            ).then(async (chatCompletion) => {
                const chatContent = chatCompletion || "Sorry, I don't have an answer for that.";

                await interaction.editReply({ content: chatContent });
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply("An error occurred while processing your request.");
        }
    }
}