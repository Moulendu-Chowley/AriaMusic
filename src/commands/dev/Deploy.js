"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../structures/index");
class Deploy extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "deploy",
            description: {
                content: "Deploy commands",
                examples: ["deploy"],
                usage: "deploy",
            },
            category: "dev",
            aliases: ["deploy-commands"],
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
                    "SendMessages",
                    "ReadMessageHistory",
                    "ViewChannel",
                    "EmbedLinks",
                ],
                user: [],
            },
            slashCommand: false,
            options: [],
        });
    }
    async run(client, ctx, _args) {
        const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId("deploy-global")
            .setLabel("Global")
            .setStyle(discord_js_1.ButtonStyle.Secondary), new discord_js_1.ButtonBuilder()
            .setCustomId("deploy-guild")
            .setLabel("Guild")
            .setStyle(discord_js_1.ButtonStyle.Secondary));
        let msg;
        try {
            msg = await ctx.sendMessage({
                content: "Where do you want to deploy the commands?",
                components: [row],
            });
        }
        catch (error) {
            client.logger.error("Failed to send the initial message:", error);
            return;
        }
        const filter = (interaction) => {
            if (interaction.user.id !== ctx.author?.id) {
                interaction
                    .reply({
                    content: "You can't interact with this message",
                    flags: discord_js_1.MessageFlags.Ephemeral,
                })
                    .catch(client.logger.error);
                return false;
            }
            return true;
        };
        const collector = msg.createMessageComponentCollector({
            filter: (interaction) => {
                if (interaction.message.id !== msg.id)
                    return false;
                return filter(interaction);
            },
            componentType: discord_js_1.ComponentType.Button,
            time: 30000,
        });
        collector.on("collect", async (interaction) => {
            try {
                if (interaction.customId === "deploy-global") {
                    await interaction.deferUpdate();
                    await client.deployCommands();
                    await ctx.editMessage({
                        content: "Commands deployed globally.",
                        components: [],
                    });
                }
                else if (interaction.customId === "deploy-guild") {
                    await interaction.deferUpdate();
                    await client.deployCommands(interaction.guild.id);
                    await ctx.editMessage({
                        content: "Commands deployed in this guild.",
                        components: [],
                    });
                }
            }
            catch (error) {
                client.logger.error("Failed to handle interaction:", error);
            }
        });
        collector.on("end", async (_collected, reason) => {
            if (reason === "time" && msg) {
                try {
                    await msg.delete();
                }
                catch (error) {
                    client.logger.error("Failed to delete the message:", error);
                }
            }
        });
    }
}
exports.default = Deploy;
