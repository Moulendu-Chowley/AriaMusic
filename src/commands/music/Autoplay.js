"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
class Autoplay extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "autoplay",
            description: {
                content: "cmd.autoplay.description",
                examples: ["autoplay"],
                usage: "autoplay",
            },
            category: "music",
            aliases: ["ap"],
            cooldown: 3,
            args: false,
            vote: true,
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
        const autoplay = player.get("autoplay");
        player.set("autoplay", !autoplay);
        if (autoplay) {
            embed
                .setDescription(ctx.locale("cmd.autoplay.messages.disabled"))
                .setColor(this.client.color.main);
        }
        else {
            embed
                .setDescription(ctx.locale("cmd.autoplay.messages.enabled"))
                .setColor(this.client.color.main);
        }
        await ctx.sendMessage({ embeds: [embed] });
    }
}
exports.default = Autoplay;
