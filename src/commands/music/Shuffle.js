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
                content: "commands.shuffle.description",
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
     * @param {import('../../structures/Content.js').Content} cnt
     */
    async run(client, cnt) {
        const player = client.manager.getPlayer(cnt.guild.id);
        const embed = this.client.embed();

        if (!player)
            return await cnt.sendMessage(cnt.get("events.message.no_music_playing"));

        if (player.queue.tracks.length === 0) {
            return await cnt.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(cnt.get("player.errors.no_song")),
                ],
            });
        }

        const fairPlay = player.get("fairplay");
        if (fairPlay) {
            return await cnt.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(cnt.get("commands.shuffle.errors.fairplay")),
                ],
            });
        }

        player.queue.shuffle();

        return await cnt.sendMessage({
            embeds: [
                embed
                    .setColor(this.client.color.main)
                    .setDescription(cnt.get("commands.shuffle.messages.shuffled")),
            ],
        });
    }
}
