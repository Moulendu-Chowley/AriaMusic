import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class Tremolo extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'tremolo',
            description: {
                content: 'commands.tremolo.description',
                examples: ['tremolo'],
                usage: 'tremolo',
            },
            category: 'filters',
            aliases: ['tr'],
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

        const tremoloEnabled = player.filterManager.filters.tremolo;
        if (tremoloEnabled) {
            player.filterManager.toggleTremolo();
            await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.tremolo.messages.disabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        } else {
            player.filterManager.toggleTremolo();
            await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.tremolo.messages.enabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        }
    }
}
