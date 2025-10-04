import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class Rate extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'rate',
            description: {
                content: 'commands.rate.description',
                examples: ['rate 1', 'rate 1.5', 'rate 1,5'],
                usage: 'rate <number>',
            },
            category: 'filters',
            aliases: ['rt'],
            cooldown: 3,
            args: true,
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
            options: [
                {
                    name: 'rate',
                    description: 'commands.rate.options.rate',
                    type: 10,
                    required: true,
                },
            ],
        });
    }

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Content.js').Content} cnt
     * @param {string[]} args
     */
    async run(client, cnt, args) {
        const player = client.manager.getPlayer(cnt.guild.id);
        if (!player)
            return await cnt.sendMessage(cnt.get("events.message.no_music_playing"));

        const rateString = String(args[0]).replace(",", ".");
        const isValidNumber = /^[0-9]*\.?[0-9]+$/.test(rateString);
        const rate = Number.parseFloat(rateString);

        if (!isValidNumber || Number.isNaN(rate) || rate < 0.5 || rate > 5) {
            await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.rate.errors.invalid_number"),
                        color: this.client.color.red,
                    },
                ],
            });
            return;
        }

        await player.filterManager.setRate(rate);
        await cnt.sendMessage({
            embeds: [
                {
                    description: cnt.get("commands.rate.messages.rate_set", {
                        rate,
                    }),
                    color: this.client.color.main,
                },
            ],
        });
    }
}
