import { ApplicationCommandDataResolvable, ChatInputCommandInteraction, Client, Collection, Events, Interaction, Message, REST, Routes } from "discord.js";
import config from "../utils/config";
import keepAlive from "../utils/KeepAlive";
import { readdirSync } from "fs";
import { join } from "path";
import { Command } from "../interfaces/Command";
import { withMessageHistory } from "../services/groq";

export class Bot {
    public commands = new Collection<string, Command>();
    public slashCommands = new Array<ApplicationCommandDataResolvable>();
    public slashCommandsMap = new Collection<string, Command>();

    public constructor(public readonly client: Client) {
        this.client.login(config.TOKEN);

        this.client.on("ready", (c) => {
            console.log(`Ready! Logged in as ${c.user?.tag}`);

            keepAlive({ port: config.PORT });
            this.registerSlashCommands();
        })

        this.client.on("messageCreate", (message) => {
            this.onMessageCreate(message);
        })

        this.client.on("guildMemberAdd", (member) => {
            member.guild.systemChannel?.send(`Welcome to the server, ${member}!`).catch(console.error);
        })

        this.client.on("warn", (info) => console.log(info));
        this.client.on("error", console.error);

        this.onInteractionCreate();
    }

    private async registerSlashCommands() {
        const rest = new REST({ version: "10" }).setToken(config.TOKEN);
        
        const commandFiles = readdirSync(join(__dirname, "..", "commands")).filter(file => file.endsWith(".ts"));

        for (const file of commandFiles) {
            const command = await import(join(__dirname, "..", "commands", file));

            this.slashCommands.push(command.default.data);
            this.slashCommandsMap.set(command.default.data.name, command.default);
        }
    
        try {
            console.log("Registering slash commands...");
            await rest.put(
                Routes.applicationCommands(this.client.user!.id), { body: this.slashCommands }
            );
            console.log("Slash commands registered!");
        } catch(error: any) {
            console.error(error);
        }
    }

    private async onMessageCreate(message: Message): Promise<void> {
        if (message.author.bot) return;
        const sessionId = message.guildId ?? message.author.id;
        
        // If the message is a mention
        if (message.mentions.users.has(this.client.user!.id)) {
            const chatCompletion = await withMessageHistory.invoke(
                { username: message.author.username, input: message.content },
                { configurable: { sessionId } }
            );

            message.reply(chatCompletion).catch(console.error);
            return;
        }

        // If the message is a reply
        if (!message.reference) return;

        const originalMessage = await message.channel.messages.fetch(message.reference.messageId!).catch(() => null);
        if (!originalMessage || originalMessage.author.id !== this.client.user!.id) return;
        const chatCompletionForReply = await withMessageHistory.invoke(
            { username: message.author.username, input: originalMessage.content },
            { configurable: { sessionId } }
        );

        message.reply("Reply: " + chatCompletionForReply).catch(console.error);
    }

    private async onInteractionCreate() {
        this.client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<any> => {
            if (!interaction.isChatInputCommand()) return;

            const command = this.slashCommandsMap.get(interaction.commandName)

            if (!command) return;

            try {
                command.execute(interaction as ChatInputCommandInteraction);
            } catch (error: any) {
                console.error(error);
            }
        })
    }
}