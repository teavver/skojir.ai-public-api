import { logger, LogType } from "../utils/logger.js"
import mongoose from "mongoose"

const MODULE = "clients :: db"

export async function createDbClient() {
    const dbURL = (process.env.ENV === "DEV") ? process.env.DB_URL_DEV : process.env.DB_URL_PROD
    if (!dbURL) { 
        logger(MODULE, "Missing DB .env", LogType.ERR)
        process.exit(1)
    }
    logger(MODULE, "Connecting to db...")
    try {
        await mongoose.connect(dbURL)
        logger(MODULE, "Connected to db.")
    } catch (err) {
        logger(MODULE, `Err while connecting to db: ${err}`, LogType.ERR)
        process.exit(1)
    }
}
