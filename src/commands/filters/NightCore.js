import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class NightCore extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'nightcore',
            description: {
                content: 'commands.nightcore.description',
                examples: ['nightcore'],
                usage: 'nightcore',
            },
            category: 'filters',
            aliases: ['nc'],
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

        const filterEnabled = player.filterManager.filters.nightcore;
        if (filterEnabled) {
            await player.filterManager.toggleNightcore();
            await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.nightcore.messages.filter_disabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        } else {
            await player.filterManager.toggleNightcore();
            await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.nightcore.messages.filter_enabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        }
    }
}
