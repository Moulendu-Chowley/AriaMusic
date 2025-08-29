"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../structures/index");
class GuildLeave extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "guildleave",
            description: {
                content: "Leave a guild",
                examples: ["guildleave <guildId>"],
                usage: "guildleave <guildId>",
            },
            category: "dev",
            aliases: ["gl"],
            cooldown: 3,
            args: true,
            player: {
                voice: false,
                dj: false,
                active: false,
                djPerm: null,
            },
            permissions: {
                dev: true,
                client: [
                    "SendMessages",
                    "ReadMessageHistory",
                    "ViewChannel",
                    "EmbedLinks",
                ],
                user: [],
            },
            slashCommand: false,
            options: [],
        });
    }
    async run(client, ctx, args) {
        const guildId = args[0];
        const guild = await client.shard
            ?.broadcastEval((c, { guildId }) => {
            const guild = c.guilds.cache.get(guildId);
            return guild ? { id: guild.id, name: guild.name } : null;
        }, { context: { guildId } })
            .then((results) => results.find((g) => g !== null));
        if (!guild) {
            return await ctx.sendMessage("Guild not found.");
        }
        try {
            await client.shard?.broadcastEval(async (c, { guildId }) => {
                const guild = c.guilds.cache.get(guildId);
                if (guild) {
                    await guild.leave();
                }
            }, { context: { guildId } });
            await ctx.sendMessage(`Left guild ${guild.name}`);
        }
        catch {
            await ctx.sendMessage(`Failed to leave guild ${guild.name}`);
        }
        const logChannelId = process.env.LOG_CHANNEL_ID;
        if (logChannelId) {
            const logChannel = client.channels.cache.get(logChannelId);
            if (logChannel && logChannel.type === discord_js_1.ChannelType.GuildText) {
                await logChannel.send(`Bot has left guild: ${guild.name} (ID: ${guild.id})`);
            }
        }
    }
}
exports.default = GuildLeave;
