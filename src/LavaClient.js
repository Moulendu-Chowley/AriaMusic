"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const env_1 = require("./env");
const AriaMusic_1 = tslib_1.__importDefault(require("./structures/AriaMusic"));
const { GuildMembers, MessageContent, GuildVoiceStates, GuildMessages, Guilds, GuildMessageTyping, } = discord_js_1.GatewayIntentBits;
const clientOptions = {
    intents: [
        Guilds,
        GuildMessages,
        MessageContent,
        GuildVoiceStates,
        GuildMembers,
        GuildMessageTyping,
    ],
    allowedMentions: { parse: ["users", "roles"], repliedUser: false },
};
const client = new AriaMusic_1.default(clientOptions);
client.start(env_1.env.TOKEN);
