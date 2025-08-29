"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const I18n_1 = require("../../structures/I18n");
const index_1 = require("../../structures/index");
const Buttons_1 = require("../../utils/Buttons");
const SetupSystem_1 = require("../../utils/SetupSystem");
const TrackStart_1 = require("../player/TrackStart");
class SetupButtons extends index_1.Event {
    constructor(client, file) {
        super(client, file, {
            name: "setupButtons",
        });
    }
    async run(interaction) {
        const locale = await this.client.db.getLanguage(interaction.guildId);
        if (!interaction.replied)
            await interaction.deferReply().catch(() => {
                null;
            });
        if (!interaction.member.voice.channel) {
            return await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.no_voice_channel_button"), this.client.color.red);
        }
        const clientMember = interaction.guild.members.cache.get(this.client.user?.id);
        if (clientMember.voice.channel &&
            clientMember.voice.channelId !== interaction.member.voice.channelId) {
            return await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.different_voice_channel_button", {
                channel: clientMember.voice.channel,
            }), this.client.color.red);
        }
        const player = this.client.manager.getPlayer(interaction.guildId);
        if (!player)
            return await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.no_music_playing"), this.client.color.red);
        if (!player.queue)
            return await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.no_music_playing"), this.client.color.red);
        if (!player.queue.current)
            return await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.no_music_playing"), this.client.color.red);
        const data = await this.client.db.getSetup(interaction.guildId);
        const { title, uri, duration, artworkUrl, sourceName, isStream } = player.queue.current.info;
        let message;
        try {
            message = await interaction.channel.messages.fetch(data?.messageId, {
                cache: true,
            });
        }
        catch (_e) {
            null;
        }
        const iconUrl = this.client.config.icons[sourceName] ||
            this.client.user?.displayAvatarURL({ extension: "png" });
        const embed = this.client
            .embed()
            .setAuthor({
            name: (0, I18n_1.T)(locale, "event.setupButton.now_playing"),
            iconURL: iconUrl,
        })
            .setColor(this.client.color.main)
            .setDescription(`[${title}](${uri}) - ${isStream ? (0, I18n_1.T)(locale, "event.setupButton.live") : this.client.utils.formatTime(duration)} - ${(0, I18n_1.T)(locale, "event.setupButton.requested_by", { requester: player.queue.current.requester.id })}`)
            .setImage(artworkUrl || this.client.user?.displayAvatarURL({ extension: "png" }));
        if (!interaction.isButton())
            return;
        if (!(await (0, TrackStart_1.checkDj)(this.client, interaction))) {
            return await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.no_dj_permission"), this.client.color.red);
        }
        if (message) {
            const handleVolumeChange = async (change) => {
                const vol = player.volume + change;
                player.setVolume(vol);
                await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.volume_set", { vol }), this.client.color.main);
                await message.edit({
                    embeds: [
                        embed.setFooter({
                            text: (0, I18n_1.T)(locale, "event.setupButton.volume_footer", {
                                vol,
                                displayName: interaction.member.displayName,
                            }),
                            iconURL: interaction.member.displayAvatarURL({}),
                        }),
                    ],
                });
            };
            switch (interaction.customId) {
                case "PREV_BUT": {
                    if (!player.queue.previous) {
                        return await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.no_previous_track"), this.client.color.main);
                    }
                    player.play({
                        track: player.queue.previous[0],
                    });
                    await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.playing_previous"), this.client.color.main);
                    await message.edit({
                        embeds: [
                            embed.setFooter({
                                text: (0, I18n_1.T)(locale, "event.setupButton.previous_footer", {
                                    displayName: interaction.member.displayName,
                                }),
                                iconURL: interaction.member.displayAvatarURL({}),
                            }),
                        ],
                    });
                    break;
                }
                case "REWIND_BUT": {
                    const time = player.position - 10000;
                    if (time < 0) {
                        player.seek(0);
                    }
                    else {
                        player.seek(time);
                    }
                    await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.rewinded"), this.client.color.main);
                    await message.edit({
                        embeds: [
                            embed.setFooter({
                                text: (0, I18n_1.T)(locale, "event.setupButton.rewind_footer", {
                                    displayName: interaction.member.displayName,
                                }),
                                iconURL: interaction.member.displayAvatarURL({}),
                            }),
                        ],
                    });
                    break;
                }
                case "PAUSE_BUT": {
                    const name = player.paused
                        ? (0, I18n_1.T)(locale, "event.setupButton.resumed")
                        : (0, I18n_1.T)(locale, "event.setupButton.paused");
                    if (player.paused) {
                        player.resume();
                    }
                    else {
                        player.pause();
                    }
                    await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.pause_resume", { name }), this.client.color.main);
                    await message.edit({
                        embeds: [
                            embed.setFooter({
                                text: (0, I18n_1.T)(locale, "event.setupButton.pause_resume_footer", {
                                    name,
                                    displayName: interaction.member.displayName,
                                }),
                                iconURL: interaction.member.displayAvatarURL({}),
                            }),
                        ],
                        components: (0, Buttons_1.getButtons)(player, this.client),
                    });
                    break;
                }
                case "FORWARD_BUT": {
                    const time = player.position + 10000;
                    if (time > player.queue.current.info.duration) {
                        return await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.forward_limit"), this.client.color.main);
                    }
                    player.seek(time);
                    await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.forwarded"), this.client.color.main);
                    await message.edit({
                        embeds: [
                            embed.setFooter({
                                text: (0, I18n_1.T)(locale, "event.setupButton.forward_footer", {
                                    displayName: interaction.member.displayName,
                                }),
                                iconURL: interaction.member.displayAvatarURL({}),
                            }),
                        ],
                    });
                    break;
                }
                case "SKIP_BUT": {
                    if (player.queue.tracks.length === 0) {
                        return await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.no_music_to_skip"), this.client.color.main);
                    }
                    player.skip();
                    await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.skipped"), this.client.color.main);
                    const newTrack = player.queue.current?.info;
                    const newEmbed = this.client
                        .embed()
                        .setAuthor({
                        name: (0, I18n_1.T)(locale, "event.setupButton.now_playing"),
                        iconURL: this.client.config.icons[newTrack?.sourceName || ""] ||
                            this.client.user?.displayAvatarURL({ extension: "png" }),
                    })
                        .setColor(this.client.color.main)
                        .setDescription(`[${newTrack?.title}](${newTrack?.uri}) - ${newTrack?.isStream ? (0, I18n_1.T)(locale, "event.setupButton.live") : this.client.utils.formatTime(newTrack?.duration)} - ${(0, I18n_1.T)(locale, "event.setupButton.requested_by", { requester: (player.queue.current?.requester).id })}`)
                        .setImage(newTrack?.artworkUrl ||
                        this.client.user?.displayAvatarURL({ extension: "png" }));
                    if (message) {
                        await message.edit({
                            embeds: [newEmbed],
                            components: (0, Buttons_1.getButtons)(player, this.client),
                        });
                    }
                    break;
                }
                case "LOW_VOL_BUT":
                    await handleVolumeChange(-10);
                    break;
                case "LOOP_BUT": {
                    const loopOptions = [
                        "off",
                        "queue",
                        "track",
                    ];
                    const newLoop = loopOptions[(loopOptions.indexOf(player.repeatMode) + 1) % loopOptions.length];
                    player.setRepeatMode(newLoop);
                    await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.loop_set", {
                        loop: newLoop,
                    }), this.client.color.main);
                    await message.edit({
                        embeds: [
                            embed.setFooter({
                                text: (0, I18n_1.T)(locale, "event.setupButton.loop_footer", {
                                    loop: newLoop,
                                    displayName: interaction.member.displayName,
                                }),
                                iconURL: interaction.member.displayAvatarURL({}),
                            }),
                        ],
                    });
                    break;
                }
                case "STOP_BUT": {
                    player.stopPlaying(true, false);
                    await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.stopped"), this.client.color.main);
                    await message.edit({
                        embeds: [
                            embed
                                .setFooter({
                                text: (0, I18n_1.T)(locale, "event.setupButton.stopped_footer", {
                                    displayName: interaction.member.displayName,
                                }),
                                iconURL: interaction.member.displayAvatarURL({}),
                            })
                                .setDescription((0, I18n_1.T)(locale, "event.setupButton.nothing_playing"))
                                .setImage(this.client.config.links.img)
                                .setAuthor({
                                name: this.client.user?.username,
                                iconURL: this.client.user?.displayAvatarURL({
                                    extension: "png",
                                }),
                            }),
                        ],
                    });
                    break;
                }
                case "SHUFFLE_BUT": {
                    player.queue.shuffle();
                    await (0, SetupSystem_1.buttonReply)(interaction, (0, I18n_1.T)(locale, "event.setupButton.shuffled"), this.client.color.main);
                    break;
                }
                case "HIGH_VOL_BUT":
                    await handleVolumeChange(10);
                    break;
            }
        }
    }
}
exports.default = SetupButtons;
