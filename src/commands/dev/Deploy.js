import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags, } from 'discord.js';
import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class Deploy extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'deploy',
            description: {
                content: 'Deploy commands',
                examples: ['deploy'],
                usage: 'deploy',
            },
            category: 'dev',
            aliases: ['deploy-commands'],
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
     * @param {string[]} _args
     */
    async run(client, ctx, _args) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('deploy-global')
                .setLabel('Global')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('deploy-guild')
                .setLabel('Guild')
                .setStyle(ButtonStyle.Secondary)
        );

        let msg;
        try {
            msg = await ctx.sendMessage({
                content: 'Where do you want to deploy the commands?',
                components: [row],
            });
        } catch (error) {
            client.logger.error('Failed to send the initial message:', error);
            return;
        }

        const filter = (interaction) => {
            if (interaction.user.id !== ctx.author?.id) {
                interaction
                    .reply({
                        content: "You can't interact with this message",
                        flags: MessageFlags.Ephemeral,
                    })
                    .catch(client.logger.error);
                return false;
            }
            return true;
        };

        const collector = msg.createMessageComponentCollector({
            filter: (interaction) => {
                if (interaction.message.id !== msg.id) return false;
                return filter(interaction);
            },
            componentType: ComponentType.Button,
            time: 30000,
        });

        collector.on('collect', async (interaction) => {
            try {
                if (interaction.customId === 'deploy-global') {
                    await interaction.deferUpdate();
                    await client.deployCommands();
                    await ctx.editMessage({
                        content: 'Commands deployed globally.',
                        components: [],
                    });
                } else if (interaction.customId === 'deploy-guild') {
                    await interaction.deferUpdate();
                    await client.deployCommands(interaction.guild.id);
                    await ctx.editMessage({
                        content: 'Commands deployed in this guild.',
                        components: [],
                    });
                }
            } catch (error) {
                client.logger.error('Failed to handle interaction:', error);
            }
        });

        collector.on('end', async (_collected, reason) => {
            if (reason === 'time' && msg) {
                try {
                    await msg.delete();
                } catch (error) {
                    client.logger.error('Failed to delete the message:', error);
                }
            }
        });
    }
}