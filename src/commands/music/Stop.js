import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Stop extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "stop",
            description: {
                content: "commands.stop.description",
                examples: ["stop"],
                usage: "stop",
            },
            category: "music",
            aliases: ["sp"],
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

        player.stopPlaying(true, false);

        return await cnt.sendMessage({
            embeds: [
                embed
                    .setColor(this.client.color.main)
                    .setDescription(cnt.get("commands.stop.messages.stopped")),
            ],
        });
    }
}
