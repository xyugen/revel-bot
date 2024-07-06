import config from "../utils/config";
import { ChatGroq } from "@langchain/groq";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatGroq({
    apiKey: config.GROQ_API_KEY,
    model: "llama3-8b-8192",
    temperature: 0.6,
    maxTokens: 1000,
});

const messageHistories: Record<string, InMemoryChatMessageHistory> = {};

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        "You are Revel, and you are a helpful assistant in a BSIT Discord server called IT Dark Room. You reply with very short answers."
    ],
    ["placeholder", "{chat_history}"],
    ["user", "{username}: {input}"],
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