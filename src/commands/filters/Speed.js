import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class Speed extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'speed',
            description: {
                content: 'commands.speed.description',
                examples: ['speed 1.5', 'speed 1,5'],
                usage: 'speed <number>',
            },
            category: 'filters',
            aliases: ['spd'],
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
                    name: 'speed',
                    description: 'commands.speed.options.speed',
                    type: 3,
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

        const speedString = args[0].replace(",", ".");
        const isValidNumber = /^[0-9]*\.?[0-9]+$/.test(speedString);
        const speed = Number.parseFloat(speedString);

        if (!isValidNumber || Number.isNaN(speed) || speed < 0.5 || speed > 5) {
            await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.speed.messages.invalid_number"),
                        color: this.client.color.red,
                    },
                ],
            });
            return;
        }

        player.filterManager.setSpeed(speed);
        await cnt.sendMessage({
            embeds: [
                {
                    description: cnt.get("commands.speed.messages.set_speed", {
                        speed,
                    }),
                    color: this.client.color.main,
                },
            ],
        });
    }
}
