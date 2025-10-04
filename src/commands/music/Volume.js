import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Volume extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "volume",
            description: {
                content: "commands.volume.description",
                examples: ["volume 100"],
                usage: "volume <number>",
            },
            category: "music",
            aliases: ["v", "vol"],
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
                    description: "commands.volume.options.number",
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
        const number = Number(args[0]);

        if (!player)
            return await cnt.sendMessage(cnt.get("events.message.no_music_playing"));

        if (Number.isNaN(number) || number < 0 || number > 200) {
            let description = "";
            if (Number.isNaN(number))
                description = cnt.get("commands.volume.messages.invalid_number");
            else if (number < 0)
                description = cnt.get("commands.volume.messages.too_low");
            else if (number > 200)
                description = cnt.get("commands.volume.messages.too_high");

            return await cnt.sendMessage({
                embeds: [
                    embed.setColor(this.client.color.red).setDescription(description),
                ],
            });
        }

        await player.setVolume(number);
        const currentVolume = player.volume;

        return await cnt.sendMessage({
            embeds: [
                embed.setColor(this.client.color.main).setDescription(
                    cnt.get("commands.volume.messages.set", {
                        volume: currentVolume,
                    })
                ),
            ],
        });
    }
}
