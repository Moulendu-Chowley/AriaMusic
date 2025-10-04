import { ApplicationCommandOptionType } from 'discord.js';
import { EQList } from 'lavalink-client';
import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class BassBoost extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'bassboost',
            description: {
                content: 'commands.bassboost.description',
                examples: [
                    'bassboost high',
                    'bassboost medium',
                    'bassboost low',
                    'bassboost off',
                ],
                usage: 'bassboost [level]',
            },
            category: 'filters',
            aliases: ['bb'],
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
                    name: 'level',
                    description: 'commands.bassboost.options.level',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: 'high', value: 'high' },
                        { name: 'medium', value: 'medium' },
                        { name: 'low', value: 'low' },
                        { name: 'off', value: 'off' },
                    ],
                },
            ],
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

        switch (cnt.args[0]?.toLowerCase()) {
            case 'high': {
                await player.filterManager.setEQ(EQList.BassboostHigh);
                await cnt.sendMessage({
                    embeds: [
                        {
                            description: cnt.get("commands.bassboost.messages.high"),
                            color: this.client.color.main,
                        },
                    ],
                });
                break;
            }
            case 'medium': {
                await player.filterManager.setEQ(EQList.BassboostMedium);
                await cnt.sendMessage({
                    embeds: [
                        {
                            description: cnt.get("commands.bassboost.messages.medium"),
                            color: this.client.color.main,
                        },
                    ],
                });
                break;
            }
            case 'low': {
                await player.filterManager.setEQ(EQList.BassboostLow);
                await cnt.sendMessage({
                    embeds: [
                        {
                            description: cnt.get("commands.bassboost.messages.low"),
                            color: this.client.color.main,
                        },
                    ],
                });
                break;
            }
            case 'off': {
                await player.filterManager.clearEQ();
                await cnt.sendMessage({
                    embeds: [
                        {
                            description: cnt.get("commands.bassboost.messages.off"),
                            color: this.client.color.main,
                        },
                    ],
                });
                break;
            }
            default: {
                await cnt.sendMessage(
                    cnt.get("commands.bassboost.messages.invalid_level", {
                        level: cnt.args[0] ?? 'undefined',
                    })
                );
                break;
            }
        }
    }
}
