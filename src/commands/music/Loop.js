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
                content: "commands.loop.description",
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
     * @param {import('../../structures/Content.js').Content} cnt
     */
    async run(client, cnt) {
        const embed = this.client.embed().setColor(this.client.color.main);
        const player = client.manager.getPlayer(cnt.guild.id);
        let loopMessage = "";
        const args = cnt.args ? cnt.args[0]?.toLowerCase() : "";
        let mode = undefined;

        try {
            mode = cnt.options?.get("mode")?.value;
        } catch {
            mode = undefined;
        }

        const argument = mode || args;

        if (!player) {
            return await cnt.sendMessage({
                embeds: [embed.setDescription(cnt.get("player.errors.no_player"))],
            });
        }

        if (argument) {
            if (argument === "song" || argument === "track" || argument === "s") {
                player?.setRepeatMode("track");
                loopMessage = cnt.get("commands.loop.looping_song");
            } else if (argument === "queue" || argument === "q") {
                player?.setRepeatMode("queue");
                loopMessage = cnt.get("commands.loop.looping_queue");
            } else if (argument === "off" || argument === "o") {
                player?.setRepeatMode("off");
                loopMessage = cnt.get("commands.loop.looping_off");
            } else {
                loopMessage = cnt.get("commands.loop.invalid_mode");
            }
        } else {
            switch (player?.repeatMode) {
                case "off": {
                    player.setRepeatMode("track");
                    loopMessage = cnt.get("commands.loop.looping_song");
                    break;
                }
                case "track": {
                    player.setRepeatMode("queue");
                    loopMessage = cnt.get("commands.loop.looping_queue");
                    break;
                }
                case "queue": {
                    player.setRepeatMode("off");
                    loopMessage = cnt.get("commands.loop.looping_off");
                    break;
                }
            }
        }

        return await cnt.sendMessage({
            embeds: [embed.setDescription(loopMessage)],
        });
    }
}
