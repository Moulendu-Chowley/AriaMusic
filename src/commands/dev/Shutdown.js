"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../structures/index");
class Shutdown extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "shutdown",
            description: {
                content: "Shutdown the bot",
                examples: ["shutdown"],
                usage: "shutdown",
            },
            category: "dev",
            aliases: ["turnoff"],
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
    async run(client, ctx) {
        const embed = this.client.embed();
        const button = new discord_js_1.ButtonBuilder()
            .setStyle(discord_js_1.ButtonStyle.Danger)
            .setLabel("Confirm Shutdown")
            .setCustomId("confirm-shutdown");
        const row = new discord_js_1.ActionRowBuilder().addComponents(button);
        const shutdownEmbed = embed
            .setColor(this.client.color.red)
            .setDescription(`**Are you sure you want to shutdown the bot **\`${client.user?.username}\`?`)
            .setTimestamp();
        const msg = await ctx.sendMessage({
            embeds: [shutdownEmbed],
            components: [row],
        });
        const filter = (i) => i.customId === "confirm-shutdown" && i.user.id === ctx.author?.id;
        const collector = msg.createMessageComponentCollector({
            time: 30000,
            filter,
        });
        collector.on("collect", async (i) => {
            await i.deferUpdate();
            await msg.edit({
                content: "Shutting down the bot...",
                embeds: [],
                components: [],
            });
            await client.destroy();
            process.exit(0);
        });
        collector.on("end", async () => {
            if (collector.collected.size === 0) {
                await msg.edit({
                    content: "Shutdown cancelled.",
                    components: [],
                });
            }
        });
    }
}
exports.default = Shutdown;
