import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class LowPass extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'lowpass',
            description: {
                content: 'commands.lowpass.description',
                examples: ['lowpass'],
                usage: 'lowpass',
            },
            category: 'filters',
            aliases: ['lp'],
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

        const filterEnabled = player.filterManager.filters.lowPass;
        if (filterEnabled) {
            await player.filterManager.toggleLowPass();
            await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.lowpass.messages.filter_disabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        } else {
            await player.filterManager.toggleLowPass(20);
            await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.lowpass.messages.filter_enabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        }
    }
}
