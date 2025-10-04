import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Join extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: "join",
            description: {
                content: "commands.join.description",
                examples: ["join"],
                usage: "join",
            },
            category: "music",
            aliases: ["come", "j"],
            cooldown: 3,
            args: false,
            vote: false,
            player: {
                voice: true,
                dj: false,
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
                    "Connect",
                    "Speak",
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
        const embed = this.client.embed();
        let player = client.manager.getPlayer(cnt.guild.id);

        if (player) {
            return await cnt.sendMessage({
                embeds: [
                    embed.setColor(this.client.color.main).setDescription(
                        cnt.get("commands.join.already_connected", {
                            channelId: player.voiceChannelId,
                        })
                    ),
                ],
            });
        }

        const memberVoiceChannel = cnt.member.voice.channel;
        if (!memberVoiceChannel) {
            return await cnt.sendMessage({
                embeds: [
                    embed
                        .setColor(this.client.color.red)
                        .setDescription(cnt.get("commands.join.no_voice_channel")),
                ],
            });
        }

        player = client.manager.createPlayer({
            guildId: cnt.guild.id,
            voiceChannelId: memberVoiceChannel.id,
            textChannelId: cnt.channel.id,
            selfMute: false,
            selfDeaf: true,
            vcRegion: memberVoiceChannel.rtcRegion ?? undefined,
        });

        if (!player.connected) await player.connect();

        return await cnt.sendMessage({
            embeds: [
                embed.setColor(this.client.color.main).setDescription(
                    cnt.get("commands.join.joined", {
                        channelId: player.voiceChannelId,
                    })
                ),
            ],
        });
    }
}
