import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class Rotation extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'rotation',
            description: {
                content: 'commands.rotation.description',
                examples: ['rotation'],
                usage: 'rotation',
            },
            category: 'filters',
            aliases: ['rt'],
            cooldown: 3,
            args: false,
            vote: false,
            player: {
                voice: true,
                dj: true,
                active: true,
                djPerm: null,
            },
            permissions: {
                dev: false,
                client: [
                    'SendMessages',
                    'ReadMessageHistory',
                    'ViewChannel',
                    'EmbedLinks',
                ],
                user: [],
            },
            slashCommand: true,
            options: [],
        });
    }

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Content.js').Content} cnt
     */
    async run(client, cnt) {
        const player = client.manager.getPlayer(cnt.guild.id);
        if (!player)
            return await cnt.sendMessage(cnt.get("events.message.no_music_playing"));

        if (player.filterManager.filters.rotation) {
            player.filterManager.toggleRotation();
            await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.rotation.messages.disabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        } else {
            player.filterManager.toggleRotation();
            await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.rotation.messages.enabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        }
    }
}
