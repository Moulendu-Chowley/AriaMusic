"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../../structures/index.js");
class Speed extends index_js_1.Command {
    constructor(client) {
        super(client, {
            name: "speed",
            description: {
                content: "cmd.speed.description",
                examples: ["speed 1.5", "speed 1,5"],
                usage: "speed <number>",
            },
            category: "filters",
            aliases: ["spd"],
            cooldown: 3,
            args: true,
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
            options: [
                {
                    name: "speed",
                    description: "cmd.speed.options.speed",
                    type: 3,
                    required: true,
                },
            ],
        });
    }
    async run(client, ctx, args) {
        const player = client.manager.getPlayer(ctx.guild.id);
        if (!player)
            return await ctx.sendMessage(ctx.locale("event.message.no_music_playing"));
        const speedString = args[0].replace(",", ".");
        const isValidNumber = /^[0-9]*\.?[0-9]+$/.test(speedString);
        const speed = Number.parseFloat(speedString);
        if (!isValidNumber || Number.isNaN(speed) || speed < 0.5 || speed > 5) {
            await ctx.sendMessage({
                embeds: [
                    {
                        description: ctx.locale("cmd.speed.messages.invalid_number"),
                        color: this.client.color.red,
                    },
                ],
            });
            return;
        }
        player.filterManager.setSpeed(speed);
        await ctx.sendMessage({
            embeds: [
                {
                    description: ctx.locale("cmd.speed.messages.set_speed", {
                        speed,
                    }),
                    color: this.client.color.main,
                },
            ],
        });
    }
}
exports.default = Speed;
