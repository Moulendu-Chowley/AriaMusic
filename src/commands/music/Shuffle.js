import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Shuffle extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "shuffle",
            description: {
                content: "cmd.shuffle.description",
                examples: ["shuffle"],
                usage: "shuffle",
            },
            category: "music",
            aliases: ["sh"],
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

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Context.js').Context} ctx
     */
    async run(client, ctx) {
        const player = client.manager.getPlayer(ctx.guild.id);
        const embed = this.client.embed();

        if (!player)
            return await ctx.sendMessage(ctx.locale("event.message.no_music_playing"));

        if (player.queue.tracks.length === 0) {
            return await ctx.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(ctx.locale("player.errors.no_song")),
                ],
            });
        }

        const fairPlay = player.get("fairplay");
        if (fairPlay) {
            return await ctx.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(ctx.locale("cmd.shuffle.errors.fairplay")),
                ],
            });
        }

        player.queue.shuffle();

        return await ctx.sendMessage({
            embeds: [
                embed
                    .setColor(this.client.color.main)
                    .setDescription(ctx.locale("cmd.shuffle.messages.shuffled")),
            ],
        });
    }
}