import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class Shutdown extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'shutdown',
            description: {
                content: 'Shutdown the bot',
                examples: ['shutdown'],
                usage: 'shutdown',
            },
            category: 'dev',
            aliases: ['turnoff'],
            cooldown: 3,
            args: false,
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
                    'ReadMessageHistory',
                    'ViewChannel',
                    'EmbedLinks',
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
     */
    async run(client, cnt) {
        const embed = this.client.embed();
        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel('Confirm Shutdown')
            .setCustomId('confirm-shutdown');

        const row = new ActionRowBuilder().addComponents(button);

        const shutdownEmbed = embed
            .setColor(this.client.color.red)
            .setDescription(
                `**Are you sure you want to shutdown the bot ${client.user?.username}?**`
            )
            .setTimestamp();

        const msg = await cnt.sendMessage({
            embeds: [shutdownEmbed],
            components: [row],
        });

        const filter = (i) =>
            i.customId === 'confirm-shutdown' && i.user.id === cnt.author?.id;
        const collector = msg.createMessageComponentCollector({
            time: 30000,
            filter,
        });

        collector.on('collect', async (i) => {
            await i.deferUpdate();
            await msg.edit({
                content: 'Shutting down the bot...', 
                embeds: [],
                components: [],
            });
            await client.destroy();
            process.exit(0);
        });

        collector.on('end', async () => {
            if (collector.collected.size === 0) {
                await msg.edit({
                    content: 'Shutdown cancelled.',
                    components: [],
                });
            }
        });
    }
}
