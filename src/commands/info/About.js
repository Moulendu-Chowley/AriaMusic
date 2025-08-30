import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class About extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'about',
            description: {
                content: 'cmd.about.description',
                examples: ['about'],
                usage: 'about',
            },
            category: 'info',
            aliases: ['ab'],
            cooldown: 3,
            args: false,
            vote: false,
            player: {
                voice: false,
                dj: false,
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
     * @param {import('../../structures/Context.js').Context} ctx
     */
    async run(client, ctx) {
        const inviteButton = new ButtonBuilder()
            .setLabel(ctx.locale("buttons.invite"))
            .setStyle(ButtonStyle.Link)
            .setURL(
                `https://discord.com/api/oauth2/authorize?client_id=${client.env.CLIENT_ID}&permissions=274881431873&scope=bot%20applications.commands`
            );

        const supportButton = new ButtonBuilder()
            .setLabel(ctx.locale("buttons.support"))
            .setStyle(ButtonStyle.Link)
            .setURL("https://discord.gg/3puJWDNzzA");

        const row = new ActionRowBuilder().addComponents(inviteButton, supportButton);

        const embed = this.client
            .embed()
            .setAuthor({
                name: 'Aria Music',
                iconURL:
                    'https://media.discordapp.net/attachments/876035356460462090/888434725235097610/20210820_124325.png',
            })
            .setThumbnail(
                'https://media.discordapp.net/attachments/876035356460462090/888434725235097610/20210820_124325.png'
            )
            .setColor(this.client.color.main)
            .addFields(
                {
                    name: ctx.locale("cmd.about.fields.creator"),
                    value: 'Moulendu Chowley',
                    inline: true,
                },
                {
                    name: ctx.locale("cmd.about.fields.repository"),
                    value: '[Here](https://github.com/Moulendu-Chowley/AriaMusic)',
                    inline: true,
                },
                {
                    name: ctx.locale("cmd.about.fields.support"),
                    value: '[Here](https://discord.gg/3puJWDNzzA)',
                    inline: true,
                },
                {
                    name: '\u200b',
                    value: ctx.locale("cmd.about.fields.description"),
                    inline: true,
                }
            );

        await ctx.sendMessage({
            content: '',
            embeds: [embed],
            components: [row],
        });
    }
}