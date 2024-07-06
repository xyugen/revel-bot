import { createClient } from "@deepgram/sdk";
import config from "../utils/config";
import { Readable } from 'stream';

const deepgram = createClient(config.DEEPGRAM_API_KEY);

const getAudio = async (text: string): Promise<Readable> => {
    const response = await deepgram.speak.request(
        {text},
        {
            model: "aura-helios-en",
            encoding: "opus", // "linear16"
            container: "ogg" // "wav"
        }
    );

    const stream = await response.getStream();
    const headers = await response.getHeaders();
    if (headers) {
        console.log("Headers: ", headers);
    }

    const readable = getAudioReadable(stream!);

    return readable!;
}

const getAudioBuffer = async (response: ReadableStream) => {
    const reader = response.getReader();
    const chunks = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
    }

    const dataArray = chunks.reduce(
        (acc, chunk) => Uint8Array.from([...acc, ...chunk]),
        new Uint8Array(0)
    )

    return Buffer.from(dataArray.buffer);
}

// Function to convert a ReadableStream<Uint8Array> to a Node.js Readable stream
async function getAudioReadable(readableStream: ReadableStream<Uint8Array>) {
    const buffer = await getAudioBuffer(readableStream);
    return Readable.from(buffer);
}

export { getAudio };