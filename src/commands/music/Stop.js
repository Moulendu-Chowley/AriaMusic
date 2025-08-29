"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
class Stop extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "stop",
            description: {
                content: "cmd.stop.description",
                examples: ["stop"],
                usage: "stop",
            },
            category: "music",
            aliases: ["sp"],
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
        const embed = this.client.embed();
        if (!player)
            return await ctx.sendMessage(ctx.locale("event.message.no_music_playing"));
        player.stopPlaying(true, false);
        return await ctx.sendMessage({
            embeds: [
                embed
                    .setColor(this.client.color.main)
                    .setDescription(ctx.locale("cmd.stop.messages.stopped")),
            ],
        });
    }
}
exports.default = Stop;
