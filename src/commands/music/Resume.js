import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Resume extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "resume",
            description: {
                content: "cmd.resume.description",
                examples: ["resume"],
                usage: "resume",
            },
            category: "music",
            aliases: ["r"],
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
     * @param {import('../../structures/Context.js').Context} ctx
     */
    async run(client, ctx) {
        const player = client.manager.getPlayer(ctx.guild.id);
        const embed = this.client.embed();

        if (!player)
            return await ctx.sendMessage(ctx.locale("event.message.no_music_playing"));

        if (!player.paused) {
            return await ctx.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(ctx.locale("cmd.resume.errors.not_paused")),
                ],
            });
        }

        player.resume();

        return await ctx.sendMessage({
            embeds: [
                embed
                    .setColor(this.client.color.main)
                    .setDescription(ctx.locale("cmd.resume.messages.resumed")),
            ],
        });
    }
}