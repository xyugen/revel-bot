import Groq from "groq-sdk";
import config from "../utils/config";
import { ChatCompletion, ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

const groq = new Groq({ apiKey: config.GROQ_API_KEY });

const getGroqChatCompletion = async (query: string, username: string = ""): Promise<ChatCompletion> => {
    const systemPrompt: ChatCompletionMessageParam = {
        role: "system",
        content: "Your name is Revel, and you are a helpful assistant in a BSIT Discord server called IT Dark Room. You reply with very short answers."
    }

    const result: ChatCompletion = await groq.chat.completions.create({
        messages: [
            systemPrompt,
            {
                name: username,
                role: "user",
                content: query
            }
        ],
        model: "llama3-8b-8192",
        temperature: 0.5,
        max_tokens: 1024,
        stream: false
    })

    return result;
}

export default getGroqChatCompletion;