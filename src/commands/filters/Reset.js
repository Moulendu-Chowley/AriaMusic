import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class Reset extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'reset',
            description: {
                content: 'commands.reset.description',
                examples: ['reset'],
                usage: 'reset',
            },
            category: 'filters',
            aliases: ['rs'],
            cooldown: 3,
            args: false,
            vote: false,
            player: {
                voice: true,
                dj: true,
                active: false,
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

        player.filterManager.resetFilters();
        player.filterManager.clearEQ();

        await cnt.sendMessage({
            embeds: [
                {
                    description: cnt.get("commands.reset.messages.filters_reset"),
                    color: this.client.color.main,
                },
            ],
        });
    }
}
