import { Client, GatewayIntentBits, IntentsBitField } from "discord.js";
import { Bot } from "./structs/Bot";

export const bot = new Bot(new Client({
    intents: [
        GatewayIntentBits.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessageReactions
    ],
}))