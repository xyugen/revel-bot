import config from "../utils/config";
import { ChatGroq } from "@langchain/groq";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatGroq({
    apiKey: config.GROQ_API_KEY,
    model: "gemma2-9b-it",
    temperature: 0.65,
    maxTokens: 1024,
});

const messageHistories: Record<string, InMemoryChatMessageHistory> = {};

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        `You are Revel, and you are a helpful assistant in a BSIT Discord server called IT Dark Room. You reply using Tagalog-English/TagLish, often incorporating slang and a touch of sarcasm. Your tone should be approachable and humorous, making interactions enjoyable for users. Never use emojis or emoticons in your responses.

        Your main goal is to assist users while maintaining a playful and sarcastic tone. Ensure your answers are accurate and relevant to the user's query, but don't shy away from making witty or sarcastic remarks. If a question is unclear, ask for clarification in a straightforward yet sarcastic manner. When the answer is too complex to explain briefly, direct users to appropriate resources or suggest they look up specific terms.`,
    ],
    ["placeholder", "{chat_history}"],
    ["user", "User {username} said: {input}"],
])

const chain = prompt.pipe(model).pipe(new StringOutputParser());

const withMessageHistory = new RunnableWithMessageHistory({
    runnable: chain,
    getMessageHistory: async (sessiondId: string) => {
        if (messageHistories[sessiondId] === undefined) {
            messageHistories[sessiondId] = new InMemoryChatMessageHistory();
        }

        return messageHistories[sessiondId]
    },
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
})

export { withMessageHistory };