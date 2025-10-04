import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class Karaoke extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'karaoke',
            description: {
                content: 'commands.karaoke.description',
                examples: ['karaoke'],
                usage: 'karaoke',
            },
            category: 'filters',
            aliases: ['kk'],
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

        const filterEnabled = player.filterManager.filters.karaoke;
        if (filterEnabled) {
            await player.filterManager.toggleKaraoke();
            await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.karaoke.messages.filter_disabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        } else {
            await player.filterManager.toggleKaraoke();
            await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.karaoke.messages.filter_enabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        }
    }
}
