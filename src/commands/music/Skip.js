import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Skip extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "skip",
            description: {
                content: "cmd.skip.description",
                examples: ["skip"],
                usage: "skip",
            },
            category: "music",
            aliases: ["sk"],
            cooldown: 3,
            args: false,
            vote: true,
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

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Context.js').Context} ctx
     */
    async run(client, ctx) {
        const player = client.manager.getPlayer(ctx.guild.id);
        const embed = this.client.embed();

        if (!player)
            return await ctx.sendMessage(ctx.locale("event.message.no_music_playing"));

        const autoplay = player.get("autoplay");
        if (!autoplay && player.queue.tracks.length === 0) {
            return await ctx.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(ctx.locale("player.errors.no_song")),
                ],
            });
        }

        const currentTrack = player.queue.current?.info;
        player.skip(0, !autoplay);

        if (ctx.isInteraction) {
            return await ctx.sendMessage({
                embeds: [
                    embed.setColor(this.client.color.main).setDescription(
                        ctx.locale("cmd.skip.messages.skipped", {
                            title: currentTrack?.title,
                            uri: currentTrack?.uri,
                        })
                    ),
                ],
            });
        }

        ctx.message?.react("👍");
    }
}