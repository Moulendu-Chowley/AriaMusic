import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Loop extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "loop",
            description: {
                content: "cmd.loop.description",
                examples: ["loop off", "loop queue", "loop song"],
                usage: "loop",
            },
            category: "general",
            aliases: ["loop"],
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
            options: [
                {
                    name: "mode",
                    description: "The loop mode you want to set",
                    type: 3,
                    required: false,
                    choices: [
                        {
                            name: "Off",
                            value: "off",
                        },
                        {
                            name: "Song",
                            value: "song",
                        },
                        {
                            name: "Queue",
                            value: "queue",
                        },
                    ],
                },
            ],
        });
    }

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Context.js').Context} ctx
     */
    async run(client, ctx) {
        const embed = this.client.embed().setColor(this.client.color.main);
        const player = client.manager.getPlayer(ctx.guild.id);
        let loopMessage = "";
        const args = ctx.args ? ctx.args[0]?.toLowerCase() : "";
        let mode = undefined;

        try {
            mode = ctx.options?.get("mode")?.value;
        } catch {
            mode = undefined;
        }

        const argument = mode || args;

        if (!player) {
            return await ctx.sendMessage({
                embeds: [embed.setDescription(ctx.locale("player.errors.no_player"))],
            });
        }

        if (argument) {
            if (argument === "song" || argument === "track" || argument === "s") {
                player?.setRepeatMode("track");
                loopMessage = ctx.locale("cmd.loop.looping_song");
            } else if (argument === "queue" || argument === "q") {
                player?.setRepeatMode("queue");
                loopMessage = ctx.locale("cmd.loop.looping_queue");
            } else if (argument === "off" || argument === "o") {
                player?.setRepeatMode("off");
                loopMessage = ctx.locale("cmd.loop.looping_off");
            } else {
                loopMessage = ctx.locale("cmd.loop.invalid_mode");
            }
        } else {
            switch (player?.repeatMode) {
                case "off": {
                    player.setRepeatMode("track");
                    loopMessage = ctx.locale("cmd.loop.looping_song");
                    break;
                }
                case "track": {
                    player.setRepeatMode("queue");
                    loopMessage = ctx.locale("cmd.loop.looping_queue");
                    break;
                }
                case "queue": {
                    player.setRepeatMode("off");
                    loopMessage = ctx.locale("cmd.loop.looping_off");
                    break;
                }
            }
        }

        return await ctx.sendMessage({
            embeds: [embed.setDescription(loopMessage)],
        });
    }
}