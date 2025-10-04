import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class _8d extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: '8d',
            description: {
                content: 'commands.8d.description',
                examples: ['8d'],
                usage: '8d',
            },
            category: 'filters',
            aliases: ['3d'],
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

        const filterEnabled = player.filterManager.filters.rotation;
        if (filterEnabled) {
            await player.filterManager.toggleRotation();
            await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.8d.messages.filter_disabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        } else {
            await player.filterManager.toggleRotation(0.2);
            await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.8d.messages.filter_enabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        }
    }
}
