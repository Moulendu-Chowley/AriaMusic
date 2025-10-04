import { ChannelType } from 'discord.js';
import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class GuildLeave extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'guildleave',
            description: {
                content: 'Leave a guild',
                examples: ['guildleave <guildId>'],
                usage: 'guildleave <guildId>',
            },
            category: 'dev',
            aliases: ['gl'],
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
                    'SendMessages',
                    'ReadMessageHistory',
                    'ViewChannel',
                    'EmbedLinks',
                ],
                user: [],
            },
            slashCommand: false,
            options: [],
        });
    }

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Content.js').Content} cnt
     * @param {string[]} args
     */
    async run(client, cnt, args) {
        const guildId = args[0];
        const guild = await client.shard
            ?.broadcastEval(
                (c, { guildId }) => {
                    const guild = c.guilds.cache.get(guildId);
                    return guild ? { id: guild.id, name: guild.name } : null;
                },
                { context: { guildId } }
            )
            .then((results) => results.find((g) => g !== null));

        if (!guild) {
            return await cnt.sendMessage('Guild not found.');
        }

        try {
            await client.shard?.broadcastEval(
                async (c, { guildId }) => {
                    const guild = c.guilds.cache.get(guildId);
                    if (guild) {
                        await guild.leave();
                    }
                },
                { context: { guildId } }
            );
            await cnt.sendMessage(`Left guild ${guild.name}`);
        } catch {
            await cnt.sendMessage(`Failed to leave guild ${guild.name}`);
        }

        const logChannelId = process.env.LOG_CHANNEL_ID;
        if (logChannelId) {
            const logChannel = client.channels.cache.get(logChannelId);
            if (logChannel && logChannel.type === ChannelType.GuildText) {
                await logChannel.send(
                    `Bot has left guild: ${guild.name} (ID: ${guild.id})`
                );
            }
        }
    }
}
