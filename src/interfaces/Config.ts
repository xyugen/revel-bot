import { LangchainConfig } from "./LangchainConfig"

export interface Config {
    TOKEN: string
    PORT: number 
    RAPID_API_KEY: string
    GROQ_API_KEY: string  
    LANGCHAIN: LangchainConfig
}