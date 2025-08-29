"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
class Pause extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "pause",
            description: {
                content: "cmd.pause.description",
                examples: ["pause"],
                usage: "pause",
            },
            category: "music",
            aliases: ["pu"],
            cooldown: 3,
            args: false,
            vote: false,
            player: {
                voice: true,
                dj: false,
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
        const embed = this.client.embed();
        if (player?.paused) {
            return await ctx.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(ctx.locale("player.errors.already_paused")),
                ],
            });
        }
        player?.pause();
        return await ctx.sendMessage({
            embeds: [
                embed
                    .setColor(this.client.color.main)
                    .setDescription(ctx.locale("cmd.pause.successfully_paused")),
            ],
        });
    }
}
exports.default = Pause;
