import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Grab extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "grab",
            description: {
                content: "cmd.grab.description",
                examples: ["grab"],
                usage: "grab",
            },
            category: "music",
            aliases: ["gr"],
            cooldown: 3,
            args: false,
            vote: false,
            player: {
                voice: false,
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
            options: [],
        });
    }

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Context.js').Context} ctx
     */
    async run(client, ctx) {
        const player = client.manager.getPlayer(ctx.guild.id);
        await ctx.sendDeferMessage(ctx.locale("cmd.grab.loading"));

        if (!player?.queue.current) {
            return await ctx.sendMessage({
                embeds: [
                    this.client
                        .embed()
                        .setColor(this.client.color.red)
                        .setDescription(ctx.locale("player.errors.no_song")),
                ],
            });
        }

        const song = player.queue.current;
        const songInfo = ctx.locale("cmd.grab.content", {
            title: song.info.title,
            uri: song.info.uri,
            artworkUrl: song.info.artworkUrl,
            length: song.info.isStream
                ? "LIVE"
                : client.utils.formatTime(song.info.duration),
            requester: song.requester.id,
        });

        try {
            await ctx.author?.send({
                embeds: [
                    this.client
                        .embed()
                        .setTitle(`**${song.info.title}**`)
                        .setURL(song.info.uri)
                        .setThumbnail(song.info.artworkUrl)
                        .setDescription(songInfo)
                        .setColor(this.client.color.main),
                ],
            });

            return await ctx.editMessage({
                embeds: [
                    this.client
                        .embed()
                        .setDescription(ctx.locale("cmd.grab.check_dm"))
                        .setColor(this.client.color.green),
                ],
            });
        } catch (_e) {
            return await ctx.editMessage({
                embeds: [
                    this.client
                        .embed()
                        .setDescription(ctx.locale("cmd.grab.dm_failed"))
                        .setColor(this.client.color.red),
                ],
            });
        }
    }
}