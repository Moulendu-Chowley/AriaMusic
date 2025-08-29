"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
const player_1 = require("../../utils/functions/player");
class FairPlay extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "fairplay",
            description: {
                content: "cmd.fairplay.description",
                examples: ["fairplay"],
                usage: "fairplay",
            },
            category: "music",
            aliases: ["fp"],
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
        if (!player) {
            return await ctx.sendMessage({
                embeds: [
                    {
                        description: ctx.locale("player.errors.no_player"),
                        color: this.client.color.red,
                    },
                ],
            });
        }
        const embed = this.client.embed();
        const fairPlay = player.get("fairplay");
        player.set("fairplay", !fairPlay);
        if (fairPlay) {
            embed
                .setDescription(ctx.locale("cmd.fairplay.messages.disabled"))
                .setColor(this.client.color.main);
        }
        else {
            embed
                .setDescription(ctx.locale("cmd.fairplay.messages.enabled"))
                .setColor(this.client.color.main);
            await (0, player_1.applyFairPlayToQueue)(player);
        }
        await ctx.sendMessage({ embeds: [embed] });
    }
}
exports.default = FairPlay;
