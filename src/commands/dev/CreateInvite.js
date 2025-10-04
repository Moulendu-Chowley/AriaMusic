import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class CreateInvite extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'createinvite',
            description: {
                content: 'Create an invite link for a guild',
                examples: ['createinvite 0000000000000000000'],
                usage: 'createinvite <guildId>',
            },
            category: 'dev',
            aliases: ['ci', 'gi', 'ginvite', 'guildinvite'],
            cooldown: 3,
            args: true,
            player: {
                voice: false,
                dj: false,
                active: false,
                djPerm: null,
            },
            permissions: {
                dev: true,
                client: [
                    'SendMessages',
                    'CreateInstantInvite',
                    'ReadMessageHistory',
                    'EmbedLinks',
                    'ViewChannel',
                ],
                user: [],
            },
            slashCommand: false,
            options: [],
        });
    }

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Content.js').Content} cnt
     * @param {string[]} args
     */
    async run(client, cnt, args) {
        const guild = client.guilds.cache.get(args[0]);
        if (!guild) {
            return await cnt.sendMessage({
                embeds: [
                    this.client
                        .embed()
                        .setColor(this.client.color.red)
                        .setDescription('Guild not found'),
                ],
            });
        }

        const textChannel = guild.channels.cache.find(
            (c) =>
                c.type === ChannelType.GuildText &&
                c
                    .permissionsFor(guild.members.me)
                    ?.has(
                        PermissionFlagsBits.CreateInstantInvite |
                            PermissionFlagsBits.SendMessages |
                            PermissionFlagsBits.ViewChannel
                    )
        );

        if (!textChannel) {
            return await cnt.sendMessage({
                embeds: [
                    this.client
                        .embed()
                        .setColor(this.client.color.red)
                        .setDescription('No suitable channel found'),
                ],
            });
        }

        const invite = await textChannel.createInvite({
            maxAge: 3600,
            maxUses: 0,
            reason: `Requested by developer: ${cnt.author?.username}`,
        });

        return await cnt.sendMessage({
            embeds: [
                this.client
                    .embed()
                    .setColor(this.client.color.main)
                    .setDescription(`Invite link for ${guild.name}: [Link](${invite.url})`),
            ],
        });
    }
}
