import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class DestroyInvites extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'destroyinvites',
            description: {
                content: 'Destroy all invite links created by the bot in a guild',
                examples: ['destroyinvites 0000000000000000000'],
                usage: 'destroyinvites <guildId>',
            },
            category: 'dev',
            aliases: ['di'],
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
                    'ManageGuild',
                    'ReadMessageHistory',
                    'ViewChannel',
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
        const guild = client.guilds.cache.get(args[0]);
        if (!guild) {
            return await cnt.sendMessage('Guild not found.');
        }

        try {
            const botInvites = (await guild.invites.fetch()).filter(
                (invite) => invite.inviter?.id === client.user?.id
            );
            await Promise.all(botInvites.map((invite) => invite.delete()));
            return await cnt.sendMessage(
                `Destroyed ${botInvites.size} invite(s) created by the bot.`
            );
        } catch {
            return await cnt.sendMessage('Failed to destroy invites.');
        }
    }
}
