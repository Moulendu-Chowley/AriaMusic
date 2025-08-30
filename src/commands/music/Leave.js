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
                content: "cmd.leave.description",
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
     * @param {import('../../structures/Context.js').Context} ctx
     */
    async run(client, ctx) {
        const player = client.manager.getPlayer(ctx.guild.id);
        const embed = this.client.embed();

        if (player) {
            const channelId = player.voiceChannelId;
            player.destroy();
            return await ctx.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.main)
                        .setDescription(ctx.locale("cmd.leave.left", { channelId })),
                ],
            });
        }

        return await ctx.sendMessage({
            embeds: [
                embed
                    .setColor(this.client.color.red)
                    .setDescription(ctx.locale("cmd.leave.not_in_channel")),
            ],
        });
    }
}