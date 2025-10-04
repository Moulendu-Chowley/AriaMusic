import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Remove extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "remove",
            description: {
                content: "commands.remove.description",
                examples: ["remove 1"],
                usage: "remove <song number>",
            },
            category: "music",
            aliases: ["rm"],
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
                    name: "song",
                    description: "commands.remove.options.song",
                    type: 4,
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
        const embed = this.client.embed();

        if (!player)
            return await cnt.sendMessage(cnt.get("events.message.no_music_playing"));

        if (player.queue.tracks.length === 0)
            return await cnt.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(cnt.get("commands.remove.errors.no_songs")),
                ],
            });

        const songNumber = Number(args[0]);
        if (
            Number.isNaN(songNumber) ||
            songNumber <= 0 ||
            songNumber > player.queue.tracks.length
        )
            return await cnt.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(cnt.get("commands.remove.errors.invalid_number")),
                ],
            });

        player.queue.remove(songNumber - 1);

        return await cnt.sendMessage({
            embeds: [
                embed.setColor(this.client.color.main).setDescription(
                    cnt.get("commands.remove.messages.removed", {
                        songNumber,
                    })
                ),
            ],
        });
    }
}
