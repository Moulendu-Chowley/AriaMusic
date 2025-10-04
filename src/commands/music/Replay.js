import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Replay extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "replay",
            description: {
                content: "commands.replay.description",
                examples: ["replay"],
                usage: "replay",
            },
            category: "music",
            aliases: ["rp"],
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

        if (!player.queue.current?.info.isSeekable) {
            return await cnt.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(cnt.get("commands.replay.errors.not_seekable")),
                ],
            });
        }

        player.seek(0);

        return await cnt.sendMessage({
            embeds: [
                embed
                    .setColor(this.client.color.main)
                    .setDescription(cnt.get("commands.replay.messages.replaying")),
            ],
        });
    }
}
