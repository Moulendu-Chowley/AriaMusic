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
                content: 'cmd.karaoke.description',
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
     * @param {import('../../structures/Context.js').Context} ctx
     */
    async run(client, ctx) {
        const player = client.manager.getPlayer(ctx.guild.id);
        if (!player)
            return await ctx.sendMessage(ctx.locale("event.message.no_music_playing"));

        const filterEnabled = player.filterManager.filters.karaoke;
        if (filterEnabled) {
            await player.filterManager.toggleKaraoke();
            await ctx.sendMessage({
                embeds: [
                    {
                        description: ctx.locale("cmd.karaoke.messages.filter_disabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        } else {
            await player.filterManager.toggleKaraoke();
            await ctx.sendMessage({
                embeds: [
                    {
                        description: ctx.locale("cmd.karaoke.messages.filter_enabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        }
    }
}