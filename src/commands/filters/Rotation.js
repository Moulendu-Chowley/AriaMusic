"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../structures/index.js");
class Rotation extends index_js_1.Command {
    constructor(client) {
        super(client, {
            name: "rotation",
            description: {
                content: "cmd.rotation.description",
                examples: ["rotation"],
                usage: "rotation",
            },
            category: "filters",
            aliases: ["rt"],
            cooldown: 3,
            args: false,
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
                    "SendMessages",
                    "ReadMessageHistory",
                    "ViewChannel",
                    "EmbedLinks",
                ],
                user: [],
            },
            slashCommand: true,
            options: [],
        });
    }
    async run(client, ctx) {
        const player = client.manager.getPlayer(ctx.guild.id);
        if (!player)
            return await ctx.sendMessage(ctx.locale("event.message.no_music_playing"));
        if (player.filterManager.filters.rotation) {
            player.filterManager.toggleRotation();
            await ctx.sendMessage({
                embeds: [
                    {
                        description: ctx.locale("cmd.rotation.messages.disabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        }
        else {
            player.filterManager.toggleRotation();
            await ctx.sendMessage({
                embeds: [
                    {
                        description: ctx.locale("cmd.rotation.messages.enabled"),
                        color: this.client.color.main,
                    },
                ],
            });
        }
    }
}
exports.default = Rotation;
