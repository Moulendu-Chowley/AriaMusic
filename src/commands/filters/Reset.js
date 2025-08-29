"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../structures/index.js");
class Reset extends index_js_1.Command {
    constructor(client) {
        super(client, {
            name: "reset",
            description: {
                content: "cmd.reset.description",
                examples: ["reset"],
                usage: "reset",
            },
            category: "filters",
            aliases: ["rs"],
            cooldown: 3,
            args: false,
            vote: false,
            player: {
                voice: true,
                dj: true,
                active: false,
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
        player.filterManager.resetFilters();
        player.filterManager.clearEQ();
        await ctx.sendMessage({
            embeds: [
                {
                    description: ctx.locale("cmd.reset.messages.filters_reset"),
                    color: this.client.color.main,
                },
            ],
        });
    }
}
exports.default = Reset;
