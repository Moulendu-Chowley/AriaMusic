"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_child_process_1 = require("node:child_process");
const discord_js_1 = require("discord.js");
const index_1 = require("../../structures/index");
class Restart extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "restart",
            description: {
                content: "Restart the bot",
                examples: ["restart"],
                usage: "restart",
            },
            category: "dev",
            aliases: ["reboot"],
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
            .setLabel("Confirm Restart")
            .setCustomId("confirm-restart");
        const row = new discord_js_1.ActionRowBuilder().addComponents(button);
        const restartEmbed = embed
            .setColor(this.client.color.red)
            .setDescription(`**Are you sure you want to restart **\`${client.user?.username}\`?`)
            .setTimestamp();
        const msg = await ctx.sendMessage({
            embeds: [restartEmbed],
            components: [row],
        });
        const filter = (i) => i.customId === "confirm-restart" && i.user.id === ctx.author?.id;
        const collector = msg.createMessageComponentCollector({
            time: 30000,
            filter,
        });
        collector.on("collect", async (i) => {
            await i.deferUpdate();
            await msg.edit({
                content: "Restarting the bot...",
                embeds: [],
                components: [],
            });
            try {
                await client.destroy();
                const child = (0, node_child_process_1.spawn)("npm", ["run", "start"], {
                    detached: true,
                    stdio: "ignore",
                });
                child.unref();
                process.exit(0);
            }
            catch (error) {
                console.error("[RESTART ERROR]:", error);
                await msg.edit({
                    content: "An error occurred while restarting the bot.",
                    components: [],
                });
            }
        });
        collector.on("end", async () => {
            if (collector.collected.size === 0) {
                await msg.edit({
                    content: "Restart cancelled.",
                    components: [],
                });
            }
        });
    }
}
exports.default = Restart;
