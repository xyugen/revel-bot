import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    AttachmentBuilder,
} from "discord.js";
import ytdl from "ytdl-core";
import { formatTimestamp } from "../utils/helper";

interface VideoMetadata {
    url: string;
    title: string;
    durationInSec: number;
    author: string;
    timestamp: string;
}

export default {
    data: new SlashCommandBuilder()
        .setName("download")
        .setDescription("Download an audio from YouTube")
        .addStringOption((option) =>
            option
                .setName("url")
                .setDescription("The URL to download")
                .setRequired(true)
        ),
    cooldown: 3,
    permissions: [],
    async execute(interaction: ChatInputCommandInteraction, input: string) {
        const argSongName = interaction.options.getString("url") || input;

        if (!ytdl.validateURL(argSongName)) {
            return interaction.reply({ content: "Invalid URL", ephemeral: true });
        }

        try {
            const metadata = await fetchVideoMetadata(argSongName);

            if (interaction.replied)
                await interaction.editReply(
                    `⏳ Downloading ${metadata.title} - ${metadata.author} (${metadata.timestamp})...`
                );
            else
                await interaction.reply(
                    `⏳ Downloading ${metadata.title} - ${metadata.author} (${metadata.timestamp})...`
                );

            const buffer = await downloadAudio(argSongName);
            const attachment = new AttachmentBuilder(buffer).setName(
                `${metadata.title} - ${metadata.author}.mp3`
            );

            await interaction.editReply("✅ Download complete.");
            await interaction.channel!.send({
                content: "🎵 Here is your audio:",
                files: [attachment],
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "An error occurred while downloading the audio.",
                ephemeral: true,
            });
        }
    },
};

async function fetchVideoMetadata(url: string): Promise<VideoMetadata> {
    const info = await ytdl.getBasicInfo(url);

    const videoDetails = info.videoDetails;
    const title = videoDetails.title;
    let author = videoDetails.author.name;
    const durationInSec = Math.floor(parseInt(videoDetails.lengthSeconds));
    const timestamp = formatTimestamp(durationInSec);

    if (author.includes("- Topic")) {
        author = author.replace("- Topic", "").trim();
    }

    return {
        url: videoDetails.video_url,
        title,
        author,
        durationInSec,
        timestamp,
    };
}

function downloadAudio(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const stream = ytdl(url, { filter: "audioonly" });
        const chunks: Uint8Array[] = [];

        stream.on("data", (chunk) => {
            chunks.push(chunk);
        });

        stream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });

        stream.on("error", (err) => {
            reject(err);
        });
    });
}