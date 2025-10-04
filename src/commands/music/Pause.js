import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Pause extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "pause",
            description: {
                content: "commands.pause.description",
                examples: ["pause"],
                usage: "pause",
            },
            category: "music",
            aliases: ["pu"],
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

        if (player?.paused) {
            return await cnt.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(cnt.get("player.errors.already_paused")),
                ],
            });
        }

        player?.pause();

        return await cnt.sendMessage({
            embeds: [
                embed
                    .setColor(this.client.color.main)
                    .setDescription(cnt.get("commands.pause.successfully_paused")),
            ],
        });
    }
}
