import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Leave extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "leave",
            description: {
                content: "commands.leave.description",
                examples: ["leave"],
                usage: "leave",
            },
            category: "music",
            aliases: ["l"],
            cooldown: 3,
            args: false,
            vote: false,
            player: {
                voice: true,
                dj: true,
                active: false,
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

        if (player) {
            const channelId = player.voiceChannelId;
            player.destroy();
            return await cnt.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.main)
                        .setDescription(cnt.get("commands.leave.left", { channelId })),
                ],
            });
        }

        return await cnt.sendMessage({
            embeds: [
                embed
                    .setColor(this.client.color.red)
                    .setDescription(cnt.get("commands.leave.not_in_channel")),
            ],
        });
    }
}
