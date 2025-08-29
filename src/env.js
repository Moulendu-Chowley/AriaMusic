"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const LavalinkNodeSchema = zod_1.z.object({
    id: zod_1.z.string(),
    host: zod_1.z.string(),
    port: zod_1.z.number(),
    authorization: zod_1.z.string(),
    secure: zod_1.z.preprocess((val) => (val === "true" || val === "false" ? val === "true" : val), zod_1.z.boolean().optional()),
    sessionId: zod_1.z.string().optional(),
    regions: zod_1.z.string().array().optional(),
    retryAmount: zod_1.z.number().optional(),
    retryDelay: zod_1.z.number().optional(),
    requestSignalTimeoutMS: zod_1.z.number().optional(),
    closeOnError: zod_1.z.boolean().optional(),
    heartBeatInterval: zod_1.z.number().optional(),
    enablePingOnStatsCheck: zod_1.z.boolean().optional(),
});
const envSchema = zod_1.z.object({
    TOKEN: zod_1.z.string(),
    CLIENT_ID: zod_1.z.string(),
    DEFAULT_LANGUAGE: zod_1.z.string().default("EnglishUS"),
    PREFIX: zod_1.z.string().default("!"),
    OWNER_IDS: zod_1.z.preprocess((val) => (typeof val === "string" ? JSON.parse(val) : val), zod_1.z.string().array().optional()),
    GUILD_ID: zod_1.z.string().optional(),
    TOPGG: zod_1.z.string().optional(),
    KEEP_ALIVE: zod_1.z.preprocess((val) => val === "true", zod_1.z.boolean().default(false)),
    LOG_CHANNEL_ID: zod_1.z.string().optional(),
    LOG_COMMANDS_ID: zod_1.z.string().optional(),
    BOT_STATUS: zod_1.z.preprocess((val) => {
        if (typeof val === "string") {
            return val.toLowerCase();
        }
        return val;
    }, zod_1.z.enum(["online", "idle", "dnd", "invisible"]).default("online")),
    BOT_ACTIVITY: zod_1.z.string().default("Aria music"),
    BOT_ACTIVITY_TYPE: zod_1.z.preprocess((val) => {
        if (typeof val === "string") {
            return Number.parseInt(val, 10);
        }
        return val;
    }, zod_1.z.number().default(0)),
    DATABASE_URL: zod_1.z.string().optional(),
    SEARCH_ENGINE: zod_1.z.preprocess((val) => {
        if (typeof val === "string") {
            return val.toLowerCase();
        }
        return val;
    }, zod_1.z
        .enum([
        "youtube",
        "youtubemusic",
        "soundcloud",
        "spotify",
        "apple",
        "deezer",
        "yandex",
        "jiosaavn",
    ])
        .default("youtube")),
    NODES: zod_1.z.preprocess((val) => (typeof val === "string" ? JSON.parse(val) : val), zod_1.z.array(LavalinkNodeSchema)),
    GENIUS_API: zod_1.z.string().optional(),
});
exports.env = envSchema.parse(process.env);
for (const key in exports.env) {
    if (!(key in exports.env)) {
        throw new Error(`Missing env variable: ${key}. Please check the .env file and try again.`);
    }
}
