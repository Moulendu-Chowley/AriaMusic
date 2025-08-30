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
                content: 'cmd.tremolo.description',
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
     * @param {import('../../structures/Context.js').Context} ctx
     */
    async run(client, ctx) {
        const player = client.manager.getPlayer(ctx.guild.id);
        if (!player)
            return await ctx.sendMessage(ctx.locale("event.message.no_music_playing"));

        const tremoloEnabled = player.filterManager.filters.tremolo;
        if (tremoloEnabled) {
            player.filterManager.toggleTremolo();
            await ctx.sendMessage({
                embeds: [
                    {
                        description: ctx.locale("cmd.tremolo.messages.disabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        } else {
            player.filterManager.toggleTremolo();
            await ctx.sendMessage({
                embeds: [
                    {
                        description: ctx.locale("cmd.tremolo.messages.enabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        }
    }
}