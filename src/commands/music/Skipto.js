import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Skipto extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "skipto",
            description: {
                content: "commands.skipto.description",
                examples: ["skipto 3"],
                usage: "skipto <number>",
            },
            category: "music",
            aliases: ["skt"],
            cooldown: 3,
            args: true,
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
            options: [
                {
                    name: "number",
                    description: "commands.skipto.options.number",
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
        const num = Number(args[0]);

        if (!player)
            return await cnt.sendMessage(cnt.get("events.message.no_music_playing"));

        if (
            player.queue.tracks.length === 0 ||
            Number.isNaN(num) ||
            num > player.queue.tracks.length ||
            num < 1
        ) {
            return await cnt.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(cnt.get("commands.skipto.errors.invalid_number")),
                ],
            });
        }

        player.skip(num);

        return await cnt.sendMessage({
            embeds: [
                embed.setColor(this.client.color.main).setDescription(
                    cnt.get("commands.skipto.messages.skipped_to", {
                        number: num,
                    })
                ),
            ],
        });
    }
}
