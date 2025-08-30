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
                content: "cmd.seek.description",
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
                    description: "cmd.seek.options.duration",
                    type: 3,
                    required: true,
                },
            ],
        });
    }

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Context.js').Context} ctx
     * @param {string[]} args
     */
    async run(client, ctx, args) {
        const player = client.manager.getPlayer(ctx.guild.id);
        if (!player) {
            return await ctx.sendMessage(ctx.locale("event.message.no_music_playing"));
        }

        const current = player.queue.current?.info;
        const embed = this.client.embed();
        const durationInput =
            (args.length
                ? args.join(" ")
                : ctx.options?.get("duration")?.value) ?? "";
        const duration = client.utils.parseTime(durationInput);

        if (!duration) {
            return await ctx.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(ctx.locale("cmd.seek.errors.invalid_format")),
                ],
            });
        }

        if (!current?.isSeekable || current.isStream) {
            return await ctx.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(ctx.locale("cmd.seek.errors.not_seekable")),
                ],
            });
        }

        if (duration > current.duration) {
            return await ctx.sendMessage({
                embeds: [
                    embed.setColor(this.client.color.red).setDescription(
                        ctx.locale("cmd.seek.errors.beyond_duration", {
                            length: client.utils.formatTime(current.duration),
                        })
                    ),
                ],
            });
        }

        player?.seek(duration);

        return await ctx.sendMessage({
            embeds: [
                embed.setColor(this.client.color.main).setDescription(
                    ctx.locale("cmd.seek.messages.seeked_to", {
                        duration: client.utils.formatTime(duration),
                    })
                ),
            ],
        });
    }
}