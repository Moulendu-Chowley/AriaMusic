import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Seek extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "seek",
            description: {
                content: "commands.seek.description",
                examples: ["seek 1m, seek 1h 30m", "seek 1h 30m 30s"],
                usage: "seek <duration>",
            },
            category: "music",
            aliases: ["s"],
            cooldown: 3,
            args: true,
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
                    name: "duration",
                    description: "commands.seek.options.duration",
                    type: 3,
                    required: true,
                },
            ],
        });
    }

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Content.js').Content} cnt
     * @param {string[]} args
     */
    async run(client, cnt, args) {
        const player = client.manager.getPlayer(cnt.guild.id);
        if (!player) {
            return await cnt.sendMessage(cnt.get("events.message.no_music_playing"));
        }

        const current = player.queue.current?.info;
        const embed = this.client.embed();
        const durationInput =
            (args.length
                ? args.join(" ")
                : cnt.options?.get("duration")?.value) ?? "";
        const duration = client.utils.parseTime(durationInput);

        if (!duration) {
            return await cnt.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(cnt.get("commands.seek.errors.invalid_format")),
                ],
            });
        }

        if (!current?.isSeekable || current.isStream) {
            return await cnt.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(cnt.get("commands.seek.errors.not_seekable")),
                ],
            });
        }

        if (duration > current.duration) {
            return await cnt.sendMessage({
                embeds: [
                    embed.setColor(this.client.color.red).setDescription(
                        cnt.get("commands.seek.errors.beyond_duration", {
                            length: client.utils.formatTime(current.duration),
                        })
                    ),
                ],
            });
        }

        player?.seek(duration);

        return await cnt.sendMessage({
            embeds: [
                embed.setColor(this.client.color.main).setDescription(
                    cnt.get("commands.seek.messages.seeked_to", {
                        duration: client.utils.formatTime(duration),
                    })
                ),
            ],
        });
    }
}
