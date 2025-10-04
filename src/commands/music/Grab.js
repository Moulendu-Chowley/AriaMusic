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
                content: "commands.grab.description",
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
     * @param {import('../../structures/Content.js').Content} cnt
     */
    async run(client, cnt) {
        const player = client.manager.getPlayer(cnt.guild.id);
        await cnt.sendDeferMessage(cnt.get("commands.grab.loading"));

        if (!player?.queue.current) {
            return await cnt.sendMessage({
                embeds: [
                    this.client
                        .embed()
                        .setColor(this.client.color.red)
                        .setDescription(cnt.get("player.errors.no_song")),
                ],
            });
        }

        const song = player.queue.current;
        const songInfo = cnt.get("commands.grab.content", {
            title: song.info.title,
            uri: song.info.uri,
            artworkUrl: song.info.artworkUrl,
            length: song.info.isStream
                ? "LIVE"
                : client.utils.formatTime(song.info.duration),
            requester: song.requester.id,
        });

        try {
            await cnt.author?.send({
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

            return await cnt.editMessage({
                embeds: [
                    this.client
                        .embed()
                        .setDescription(cnt.get("commands.grab.check_dm"))
                        .setColor(this.client.color.green),
                ],
            });
        } catch (_e) {
            return await cnt.editMessage({
                embeds: [
                    this.client
                        .embed()
                        .setDescription(cnt.get("commands.grab.dm_failed"))
                        .setColor(this.client.color.red),
                ],
            });
        }
    }
}
