import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class Pitch extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'pitch',
            description: {
                content: 'commands.pitch.description',
                examples: ['pitch 1', 'pitch 1.5', 'pitch 1,5'],
                usage: 'pitch <number>',
            },
            category: 'filters',
            aliases: ['ph'],
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
                    name: 'pitch',
                    description: 'commands.pitch.options.pitch',
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

        const pitchString = args[0].replace(",", ".");
        const isValidNumber = /^[0-9]*\.?[0-9]+$/.test(pitchString);
        const pitch = Number.parseFloat(pitchString);

        if (!isValidNumber || Number.isNaN(pitch) || pitch < 0.5 || pitch > 5) {
            await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.pitch.errors.invalid_number"),
                        color: this.client.color.red,
                    },
                ],
            });
            return;
        }

        await player.filterManager.setPitch(pitch);
        return await cnt.sendMessage({
            embeds: [
                {
                    description: cnt.get("commands.pitch.messages.pitch_set", {
                        pitch,
                    }),
                    color: this.client.color.main,
                },
            ],
        });
    }
}
