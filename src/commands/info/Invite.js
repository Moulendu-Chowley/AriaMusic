import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class Invite extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'invite',
            description: {
                content: 'cmd.invite.description',
                examples: ['invite'],
                usage: 'invite',
            },
            category: 'info',
            aliases: ['iv'],
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
        const embed = this.client.embed();
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel(ctx.locale("buttons.invite"))
                .setStyle(ButtonStyle.Link)
                .setURL(
                    `https://discord.com/api/oauth2/authorize?client_id=${client.env.CLIENT_ID}&permissions=66448720&scope=bot%20applications.commands`
                ),
            new ButtonBuilder()
                .setLabel(ctx.locale("buttons.support"))
                .setStyle(ButtonStyle.Link)
                .setURL("https://discord.gg/3puJWDNzzA")
        );

        return await ctx.sendMessage({
            embeds: [
                embed
                    .setColor(this.client.color.main)
                    .setDescription(ctx.locale("cmd.invite.content")),
            ],
            components: [row],
        });
    }
}