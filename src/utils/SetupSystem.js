"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupStart = setupStart;
exports.trackStart = trackStart;
exports.buttonReply = buttonReply;
exports.updateSetup = updateSetup;
exports.oops = oops;
const discord_js_1 = require("discord.js");
const I18n_1 = require("../structures/I18n");
const Buttons_1 = require("./Buttons");
function neb(embed, player, client, locale) {
    if (!player?.queue.current?.info)
        return embed;
    const iconUrl = client.config.icons[player.queue.current.info.sourceName] ||
        client.user.displayAvatarURL({ extension: "png" });
    const icon = player.queue.current.info.artworkUrl || client.config.links.img;
    const description = (0, I18n_1.T)(locale, "player.setupStart.description", {
        title: player.queue.current.info.title,
        uri: player.queue.current.info.uri,
        author: player.queue.current.info.author,
        length: client.utils.formatTime(player.queue.current.info.duration),
        requester: player.queue.current.requester.id,
    });
    return embed
        .setAuthor({
        name: (0, I18n_1.T)(locale, "player.setupStart.now_playing"),
        iconURL: iconUrl,
    })
        .setDescription(description)
        .setImage(icon)
        .setColor(client.color.main);
}
async function setupStart(client, query, player, message) {
    let m;
    const embed = client.embed();
    const n = client.embed().setColor(client.color.main);
    const data = await client.db.getSetup(message.guild.id);
    const locale = await client.db.getLanguage(message.guildId);
    try {
        if (data)
            m = await message.channel.messages.fetch({
                message: data.messageId,
                cache: true,
            });
    }
    catch (error) {
        client.logger.error(error);
    }
    if (m) {
        try {
            if (message.inGuild()) {
                const res = await player.search(query, message.author);
                switch (res.loadType) {
                    case "empty":
                    case "error":
                        await message.channel
                            .send({
                            embeds: [
                                embed
                                    .setColor(client.color.red)
                                    .setDescription((0, I18n_1.T)(locale, "player.setupStart.error_searching")),
                            ],
                        })
                            .then((msg) => setTimeout(() => msg.delete(), 5000));
                        break;
                    case "search":
                    case "track": {
                        player.queue.add(res.tracks[0]);
                        await message.channel
                            .send({
                            embeds: [
                                embed.setColor(client.color.main).setDescription((0, I18n_1.T)(locale, "player.setupStart.added_to_queue", {
                                    title: res.tracks[0].info.title,
                                    uri: res.tracks[0].info.uri,
                                })),
                            ],
                        })
                            .then((msg) => setTimeout(() => msg.delete(), 5000));
                        neb(n, player, client, locale);
                        await m.edit({ embeds: [n] }).catch(() => {
                            null;
                        });
                        break;
                    }
                    case "playlist": {
                        player.queue.add(res.tracks);
                        await message.channel
                            .send({
                            embeds: [
                                embed.setColor(client.color.main).setDescription((0, I18n_1.T)(locale, "player.setupStart.added_playlist_to_queue", {
                                    length: res.tracks.length,
                                })),
                            ],
                        })
                            .then((msg) => setTimeout(() => msg.delete(), 5000));
                        neb(n, player, client, locale);
                        await m.edit({ embeds: [n] }).catch(() => {
                            null;
                        });
                        break;
                    }
                }
                if (!player.playing && player.queue.tracks.length > 0)
                    await player.play();
            }
        }
        catch (error) {
            client.logger.error(error);
        }
    }
}
async function trackStart(msgId, channel, player, track, client, locale) {
    const icon = player.queue.current
        ? player.queue.current.info.artworkUrl
        : client.config.links.img;
    let m;
    try {
        m = await channel.messages.fetch({ message: msgId, cache: true });
    }
    catch (error) {
        client.logger.error(error);
    }
    const iconUrl = client.config.icons[player.queue.current.info.sourceName] ||
        client.user.displayAvatarURL({ extension: "png" });
    const description = (0, I18n_1.T)(locale, "player.setupStart.description", {
        title: track.info.title,
        uri: track.info.uri,
        author: track.info.author,
        length: client.utils.formatTime(track.info.duration),
        requester: player.queue.current.requester.id,
    });
    const embed = client
        .embed()
        .setAuthor({
        name: (0, I18n_1.T)(locale, "player.setupStart.now_playing"),
        iconURL: iconUrl,
    })
        .setColor(client.color.main)
        .setDescription(description)
        .setImage(icon);
    if (m) {
        await m
            .edit({
            embeds: [embed],
            components: (0, Buttons_1.getButtons)(player, client).map((b) => {
                b.components.forEach((c) => c.setDisabled(!player?.queue.current));
                return b;
            }),
        })
            .catch(() => {
            null;
        });
    }
    else {
        await channel
            .send({
            embeds: [embed],
            components: (0, Buttons_1.getButtons)(player, client).map((b) => {
                b.components.forEach((c) => c.setDisabled(!player?.queue.current));
                return b;
            }),
        })
            .then((msg) => {
            client.db.setSetup(msg.guild.id, msg.id, msg.channel.id);
        })
            .catch(() => {
            null;
        });
    }
}
async function updateSetup(client, guild, locale) {
    const setup = await client.db.getSetup(guild.id);
    let m;
    if (setup?.textId) {
        const textChannel = guild.channels.cache.get(setup.textId);
        if (!textChannel)
            return;
        try {
            m = await textChannel.messages.fetch({
                message: setup.messageId,
                cache: true,
            });
        }
        catch (error) {
            client.logger.error(error);
        }
    }
    if (m) {
        const player = client.manager.getPlayer(guild.id);
        if (player?.queue.current) {
            const iconUrl = client.config.icons[player.queue.current.info.sourceName] ||
                client.user.displayAvatarURL({ extension: "png" });
            const description = (0, I18n_1.T)(locale, "player.setupStart.description", {
                title: player.queue.current.info.title,
                uri: player.queue.current.info.uri,
                author: player.queue.current.info.author,
                length: client.utils.formatTime(player.queue.current.info.duration),
                requester: player.queue.current.requester.id,
            });
            const embed = client
                .embed()
                .setAuthor({
                name: (0, I18n_1.T)(locale, "player.setupStart.now_playing"),
                iconURL: iconUrl,
            })
                .setColor(client.color.main)
                .setDescription(description)
                .setImage(player.queue.current.info.artworkUrl);
            await m
                .edit({
                embeds: [embed],
                components: (0, Buttons_1.getButtons)(player, client).map((b) => {
                    b.components.forEach((c) => c.setDisabled(!player?.queue.current));
                    return b;
                }),
            })
                .catch(() => {
                null;
            });
        }
        else {
            const embed = client
                .embed()
                .setColor(client.color.main)
                .setAuthor({
                name: client.user.username,
                iconURL: client.user.displayAvatarURL({ extension: "png" }),
            })
                .setDescription((0, I18n_1.T)(locale, "player.setupStart.nothing_playing"))
                .setImage(client.config.links.img);
            await m
                .edit({
                embeds: [embed],
                components: (0, Buttons_1.getButtons)(player, client).map((b) => {
                    b.components.forEach((c) => c.setDisabled(true));
                    return b;
                }),
            })
                .catch(() => {
                null;
            });
        }
    }
}
async function buttonReply(int, args, color) {
    const embed = new discord_js_1.EmbedBuilder();
    let m;
    if (int.replied) {
        m = await int
            .editReply({ embeds: [embed.setColor(color).setDescription(args)] })
            .catch(() => {
            null;
        });
    }
    else {
        m = await int
            .followUp({ embeds: [embed.setColor(color).setDescription(args)] })
            .catch(() => {
            null;
        });
    }
    setTimeout(async () => {
        if (int && !int.flags?.has(discord_js_1.MessageFlags.Ephemeral)) {
            await m.delete().catch(() => {
                null;
            });
        }
    }, 2000);
}
async function oops(channel, args) {
    try {
        const embed1 = new discord_js_1.EmbedBuilder().setColor("Red").setDescription(`${args}`);
        const m = await channel.send({
            embeds: [embed1],
        });
        setTimeout(async () => await m.delete().catch(() => {
            null;
        }), 12000);
    }
    catch (e) {
        return console.error(e);
    }
}
