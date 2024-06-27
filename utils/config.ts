import "dotenv/config"
import { Config } from "../interfaces/Config";

// Load config
let config: Config = {
    TOKEN: process.env.TOKEN!,
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    RAPID_API_KEY: process.env.RAPID_API_KEY!
}

export default config