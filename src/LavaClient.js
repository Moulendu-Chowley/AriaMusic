import { GatewayIntentBits } from 'discord.js';
import { env } from './env.js';
import AriaMusic from './structures/AriaMusic.js';

const { GuildMembers, MessageContent, GuildVoiceStates, GuildMessages, Guilds, GuildMessageTyping } = GatewayIntentBits;

const clientOptions = {
    intents: [
        Guilds,
        GuildMessages,
        MessageContent,
        GuildVoiceStates,
        GuildMembers,
        GuildMessageTyping,
    ],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
};

const client = new AriaMusic(clientOptions);

client.start(env.TOKEN);