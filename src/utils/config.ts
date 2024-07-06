import "dotenv/config"
import { Config } from "../interfaces/Config";

// Load config
let config: Config = {
    TOKEN: process.env.TOKEN!,
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    RAPID_API_KEY: process.env.RAPID_API_KEY!,
    GROQ_API_KEY: process.env.GROQ_API_KEY!,
    LANGCHAIN: {
        TRACING_V2: process.env.LANGCHAIN_TRACING_V2 === "true",
        API_KEY: process.env.LANGCHAIN_API_KEY!,
        ENDPOINT: process.env.LANGCHAIN_ENDPOINT! || "https://api.smith.langchain.com",
        PROJECT: process.env.LANGCHAIN_PROJECT!,
    }
}

export default config