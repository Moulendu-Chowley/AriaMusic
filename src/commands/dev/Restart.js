import { spawn } from 'node:child_process';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class Restart extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'restart',
            description: {
                content: 'Restart the bot',
                examples: ['restart'],
                usage: 'restart',
            },
            category: 'dev',
            aliases: ['reboot'],
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
     * @param {import('../../structures/Context.js').Context} ctx
     */
    async run(client, ctx) {
        const embed = this.client.embed();
        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel('Confirm Restart')
            .setCustomId('confirm-restart');

        const row = new ActionRowBuilder().addComponents(button);

        const restartEmbed = embed
            .setColor(this.client.color.red)
            .setDescription(
                `**Are you sure you want to restart **\`${client.user?.username}\`?`
            )
            .setTimestamp();

        const msg = await ctx.sendMessage({
            embeds: [restartEmbed],
            components: [row],
        });

        const filter = (i) =>
            i.customId === 'confirm-restart' && i.user.id === ctx.author?.id;
        const collector = msg.createMessageComponentCollector({
            time: 30000,
            filter,
        });

        collector.on('collect', async (i) => {
            await i.deferUpdate();
            await msg.edit({
                content: 'Restarting the bot...', 
                embeds: [],
                components: [],
            });
            try {
                await client.destroy();
                const child = spawn('npm', ['run', 'start'], {
                    detached: true,
                    stdio: 'ignore',
                });
                child.unref();
                process.exit(0);
            } catch (error) {
                console.error('[RESTART ERROR]:', error);
                await msg.edit({
                    content: 'An error occurred while restarting the bot.',
                    components: [],
                });
            }
        });

        collector.on('end', async () => {
            if (collector.collected.size === 0) {
                await msg.edit({
                    content: 'Restart cancelled.',
                    components: [],
                });
            }
        });
    }
}