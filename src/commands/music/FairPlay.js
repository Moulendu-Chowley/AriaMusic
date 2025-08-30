import { Command } from "../../structures/index.js";
import { applyFairPlayToQueue } from "../../utils/functions/player.js";

/**
 * @extends Command
 */
export default class FairPlay extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "fairplay",
            description: {
                content: "cmd.fairplay.description",
                examples: ["fairplay"],
                usage: "fairplay",
            },
            category: "music",
            aliases: ["fp"],
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
        if (!player) {
            return await ctx.sendMessage({
                embeds: [
                    {
                        description: ctx.locale("player.errors.no_player"),
                        color: this.client.color.red,
                    },
                ],
            });
        }

        const embed = this.client.embed();
        const fairPlay = player.get("fairplay");
        player.set("fairplay", !fairPlay);

        if (fairPlay) {
            embed
                .setDescription(ctx.locale("cmd.fairplay.messages.disabled"))
                .setColor(this.client.color.main);
        } else {
            embed
                .setDescription(ctx.locale("cmd.fairplay.messages.enabled"))
                .setColor(this.client.color.main);
            await applyFairPlayToQueue(player);
        }

        await ctx.sendMessage({ embeds: [embed] });
    }
}