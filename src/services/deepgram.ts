import { createClient } from "@deepgram/sdk";
import config from "../utils/config";

const deepgram = createClient(config.DEEPGRAM_API_KEY);

const getAudio = async (text: string) => {
    const response = await deepgram.speak.request(
        {text},
        {
            model: "aura-helios-en",
            encoding: "linear16",
            container: "wav"
        }
    );

    const stream = await response.getStream();
    const headers = await response.getHeaders();
    if (headers) {
        console.log("Headers: ", headers);
    }

    if (stream) {
        const buffer = await getAudioBuffer(stream);
        
        return buffer;
    } else {
        console.error("Error generating audio: ", stream);
    }
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

export { getAudio };