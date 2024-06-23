import { ApplicationCommandDataResolvable, ChatInputCommandInteraction, Client, Collection, Events, Interaction, REST, Routes } from "discord.js";
import config from "../utils/config";
import keepAlive from "../utils/KeepAlive";
import { readdirSync } from "fs";
import { join } from "path";
import { Command } from "../interfaces/Command";

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

        this.client.on("warn", (info) => console.log(info));
        this.client.on("error", console.error);
    }

    private async registerSlashCommands() {
        // await this.client.application?.commands.set([]);
        const rest = new REST({ version: "10" }).setToken(config.TOKEN);
        
        const commandFiles = readdirSync(join(__dirname, "..", "commands")).filter(file => file.endsWith(".ts"));

        for (const file of commandFiles) {
            const command = await import(join(__dirname, "..", "commands", file));

            this.slashCommands.push(command.default.data);
            this.slashCommandsMap.set(command.default.data.name, command.default);
        }
    
        await rest.put(
            Routes.applicationCommands(this.client.user!.id), {body: this.slashCommands }
        )
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