"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../structures/index");
class Ping extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "ping",
            description: {
                content: "cmd.ping.description",
                examples: ["ping"],
                usage: "ping",
            },
            category: "general",
            aliases: ["pong"],
            cooldown: 3,
            args: false,
            vote: false,
            player: {
                voice: false,
                dj: false,
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
        const startTime = Date.now();
        await ctx.sendDeferMessage(ctx.locale("cmd.ping.content"));
        const botLatency = Date.now() - startTime;
        const apiLatency = Math.round(ctx.client.ws.ping);
        const embed = this.client
            .embed()
            .setAuthor({
            name: "Pong!",
            iconURL: client.user?.displayAvatarURL(),
        })
            .setColor(this.client.color.main)
            .addFields([
            {
                name: ctx.locale("cmd.ping.bot_latency"),
                value: `\
\
+ ${botLatency}ms\
\
`,
                inline: true,
            },
            {
                name: ctx.locale("cmd.ping.api_latency"),
                value: `\
\
+ ${apiLatency}ms\
\
`,
                inline: true,
            },
        ])
            .setFooter({
            text: ctx.locale("cmd.ping.requested_by", { author: ctx.author?.tag }),
            iconURL: ctx.author?.displayAvatarURL({}),
        })
            .setTimestamp();
        return await ctx.editMessage({ content: "", embeds: [embed] });
    }
}
exports.default = Ping;
