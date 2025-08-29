"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../structures/index");
class Lyrics extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "lyrics",
            description: {
                content: "cmd.lyrics.description",
                examples: ["lyrics", "lyrics song:Imagine Dragons - Believer"],
                usage: "lyrics [song]",
            },
            category: "music",
            aliases: ["ly"],
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
                    "AttachFiles",
                ],
                user: [],
            },
            slashCommand: true,
            options: [
                {
                    name: "song",
                    description: "cmd.lyrics.options.song.description",
                    type: 3,
                    required: false,
                },
            ],
        });
    }
    async run(client, ctx) {
        let songQuery = "";
        if (ctx.options && typeof ctx.options.get === "function") {
            let songOpt = null;
            try {
                songOpt = ctx.options.get("song");
            }
            catch (e) {
                songOpt = null;
            }
            if (songOpt && typeof songOpt.value === "string") {
                songQuery = songOpt.value;
            }
        }
        if (!songQuery && ctx.args?.[0]) {
            songQuery = ctx.args[0];
        }
        const player = client.manager.getPlayer(ctx.guild.id);
        if (!songQuery && !player) {
            const noMusicContainer = new discord_js_1.ContainerBuilder()
                .setAccentColor(client.color.red)
                .addTextDisplayComponents((textDisplay) => textDisplay.setContent(ctx.locale("event.message.no_music_playing")));
            return ctx.sendMessage({
                components: [noMusicContainer],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
        }
        let trackTitle = "";
        let artistName = "";
        let trackUrl = "";
        let artworkUrl = "";
        let lyricsResult = "";
        if (songQuery) {
            const result = await this.fetchTrackAndLyrics({
                client,
                ctx,
                songQuery,
                player,
            });
            if (!result)
                return;
            lyricsResult = result.lyricsResult;
            trackTitle = result.trackTitle;
            artistName = result.artistName;
            trackUrl = result.trackUrl;
            artworkUrl = result.artworkUrl;
        }
        else if (player && player.queue.current) {
            lyricsResult = await player.getCurrentLyrics(false);
            const track = player.queue.current;
            trackTitle =
                track.info.title
                    ?.replace(/\[.*?]|\(.*?\)|{.*?}/g, "")
                    .trim() || "Unknown Title";
            artistName =
                track.info.author
                    ?.replace(/\[.*?]|\(.*?\)|{.*?}/g, "")
                    .trim() || "Unknown Artist";
            trackUrl = track.info.uri ?? "about:blank";
            artworkUrl = track.info.artworkUrl || "";
        }
        const searchingContainer = new discord_js_1.ContainerBuilder()
            .setAccentColor(client.color.main)
            .addTextDisplayComponents((textDisplay) => textDisplay.setContent(ctx.locale("cmd.lyrics.searching", { trackTitle })));
        await ctx.sendDeferMessage({
            components: [searchingContainer],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        });
        try {
            let lyricsText = null;
            if (lyricsResult &&
                typeof lyricsResult === "object" &&
                Array.isArray(lyricsResult.lines)) {
                lyricsText = lyricsResult
                    .lines.map((l) => l.line)
                    .join("\n");
            }
            else if (typeof lyricsResult === "string") {
                lyricsText = lyricsResult;
            }
            if (!lyricsText || lyricsText.length < 10) {
                const noResultsContainer = new discord_js_1.ContainerBuilder()
                    .setAccentColor(client.color.red)
                    .addTextDisplayComponents((textDisplay) => textDisplay.setContent(ctx.locale("cmd.lyrics.errors.no_results")));
                await ctx.editMessage({
                    components: [noResultsContainer],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
                return;
            }
            const cleanedLyrics = this.cleanLyrics(lyricsText);
            if (cleanedLyrics && cleanedLyrics.length > 0) {
                const lyricsPages = this.paginateLyrics(cleanedLyrics, ctx);
                let currentPage = 0;
                const createLyricsContainer = (pageIndex, finalState = false) => {
                    const currentLyricsPage = lyricsPages[pageIndex] ||
                        ctx.locale("cmd.lyrics.no_lyrics_on_page");
                    let fullContent = ctx.locale("cmd.lyrics.lyrics_for_track", {
                        trackTitle: trackTitle,
                        trackUrl: trackUrl,
                    }) +
                        "\n" +
                        (artistName ? `*${artistName}*\n\n` : "") +
                        `${currentLyricsPage}`;
                    if (!finalState) {
                        fullContent += `\n\n${ctx.locale("cmd.lyrics.page_indicator", {
                            current: pageIndex + 1,
                            total: lyricsPages.length,
                        })}`;
                    }
                    else {
                        fullContent += `\n\n*${ctx.locale("cmd.lyrics.session_expired")}*`;
                    }
                    const mainLyricsSection = new discord_js_1.SectionBuilder().addTextDisplayComponents((textDisplay) => textDisplay.setContent(fullContent));
                    if (artworkUrl && artworkUrl.length > 0) {
                        mainLyricsSection.setThumbnailAccessory((thumbnail) => thumbnail
                            .setURL(artworkUrl)
                            .setDescription(ctx.locale("cmd.lyrics.artwork_description", { trackTitle })));
                    }
                    return new discord_js_1.ContainerBuilder()
                        .setAccentColor(client.color.main)
                        .addSectionComponents(mainLyricsSection);
                };
                const getNavigationRow = (current) => {
                    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                        .setCustomId("prev")
                        .setEmoji(client.emoji.page.back)
                        .setStyle(discord_js_1.ButtonStyle.Secondary)
                        .setDisabled(current === 0), new discord_js_1.ButtonBuilder()
                        .setCustomId("stop")
                        .setEmoji(client.emoji.page.cancel)
                        .setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder()
                        .setCustomId("next")
                        .setEmoji(client.emoji.page.next)
                        .setStyle(discord_js_1.ButtonStyle.Secondary)
                        .setDisabled(current === lyricsPages.length - 1));
                };
                const liveLyricsRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId("lyrics_subscribe")
                    .setLabel(ctx.locale("cmd.lyrics.button_subscribe"))
                    .setStyle(discord_js_1.ButtonStyle.Success), new discord_js_1.ButtonBuilder()
                    .setCustomId("lyrics_unsubscribe")
                    .setLabel(ctx.locale("cmd.lyrics.button_unsubscribe"))
                    .setStyle(discord_js_1.ButtonStyle.Danger));
                await ctx.editMessage({
                    components: [
                        createLyricsContainer(currentPage),
                        getNavigationRow(currentPage),
                        liveLyricsRow,
                    ],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
                const filter = (interaction) => interaction.user.id === ctx.author?.id;
                let collectorActive = true;
                let running = false;
                let lyricsUpdater = null;
                let lastLine = -1;
                let subscriptionActive = false;
                while (collectorActive) {
                    try {
                        const interaction = await ctx.channel.awaitMessageComponent({
                            filter,
                            componentType: discord_js_1.ComponentType.Button,
                            time: 60000,
                        });
                        if (interaction.customId === "lyrics_subscribe") {
                            await interaction.reply({
                                content: ctx.locale("cmd.lyrics.subscribed"),
                                flags: discord_js_1.MessageFlags.Ephemeral,
                            });
                            running = true;
                            subscriptionActive = true;
                            const maxTime = Date.now() + 3 * 60 * 1000;
                            const lyricsLines = lyricsResult.lines;
                            lyricsUpdater = (async () => {
                                while (running && Date.now() < maxTime) {
                                    if (!player || !player.playing)
                                        break;
                                    const position = player.position;
                                    let currentIdx = lyricsLines.findIndex((l) => {
                                        const time = l.startTime ??
                                            l.time ??
                                            l.timestamp;
                                        return typeof time === "number" && time > position;
                                    });
                                    if (currentIdx === -1)
                                        currentIdx = lyricsLines.length - 1;
                                    else if (currentIdx > 0)
                                        currentIdx--;
                                    if (currentIdx !== lastLine) {
                                        lastLine = currentIdx;
                                        const formatted = lyricsLines
                                            .map((l, i) => i === currentIdx ? `**${l.line}**` : l.line)
                                            .join("\n");
                                        const liveLyricsContainer = new discord_js_1.ContainerBuilder()
                                            .setAccentColor(client.color.main)
                                            .addTextDisplayComponents((textDisplay) => textDisplay.setContent(ctx.locale("cmd.lyrics.lyrics_for_track", {
                                            trackTitle,
                                            trackUrl,
                                        }) +
                                            "\n" +
                                            (artistName ? `*${artistName}*\n\n` : "") +
                                            formatted));
                                        await ctx.editMessage({
                                            components: [liveLyricsContainer, liveLyricsRow],
                                            flags: discord_js_1.MessageFlags.IsComponentsV2,
                                        });
                                    }
                                    await new Promise((res) => setTimeout(res, 1000));
                                }
                            })();
                            continue;
                        }
                        if (interaction.customId === "lyrics_unsubscribe") {
                            running = false;
                            subscriptionActive = false;
                            const lyricsLines = lyricsResult.lines;
                            const formatted = lyricsLines.map((l) => l.line).join("\n");
                            const unsubLyricsContainer = new discord_js_1.ContainerBuilder()
                                .setAccentColor(client.color.main)
                                .addTextDisplayComponents((textDisplay) => textDisplay.setContent(ctx.locale("cmd.lyrics.lyrics_for_track", {
                                trackTitle,
                                trackUrl,
                            }) +
                                "\n" +
                                (artistName ? `*${artistName}*\n\n` : "") +
                                formatted +
                                `\n\n*${ctx.locale("cmd.lyrics.unsubscribed")}*`));
                            await interaction.update({
                                components: [
                                    unsubLyricsContainer,
                                    getNavigationRow(currentPage),
                                    liveLyricsRow,
                                ],
                            });
                            await interaction.reply({
                                content: ctx.locale("cmd.lyrics.unsubscribed"),
                                flags: discord_js_1.MessageFlags.Ephemeral,
                            });
                            if (lyricsUpdater)
                                await lyricsUpdater;
                            continue;
                        }
                        if (interaction.customId === "prev") {
                            currentPage--;
                        }
                        else if (interaction.customId === "next") {
                            currentPage++;
                        }
                        else if (interaction.customId === "stop") {
                            collectorActive = false;
                            running = false;
                            await interaction.update({
                                components: [
                                    createLyricsContainer(currentPage, true),
                                    getNavigationRow(currentPage),
                                ],
                            });
                            break;
                        }
                        if (subscriptionActive) {
                            await interaction.update({
                                components: [createLyricsContainer(currentPage), liveLyricsRow],
                            });
                        }
                        else {
                            await interaction.update({
                                components: [
                                    createLyricsContainer(currentPage),
                                    getNavigationRow(currentPage),
                                    liveLyricsRow,
                                ],
                            });
                        }
                    }
                    catch (e) {
                        collectorActive = false;
                    }
                }
                if (ctx.guild?.members.me
                    ?.permissionsIn(ctx.channelId)
                    .has("SendMessages")) {
                    const finalContainer = createLyricsContainer(currentPage, true);
                    const disabledLiveLyricsRow = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                        .setCustomId("lyrics_subscribe")
                        .setLabel(ctx.locale("cmd.lyrics.button_subscribe"))
                        .setStyle(discord_js_1.ButtonStyle.Success)
                        .setDisabled(true), new discord_js_1.ButtonBuilder()
                        .setCustomId("lyrics_unsubscribe")
                        .setLabel(ctx.locale("cmd.lyrics.button_unsubscribe"))
                        .setStyle(discord_js_1.ButtonStyle.Danger)
                        .setDisabled(true));
                    await ctx
                        .editMessage({
                        components: [finalContainer, disabledLiveLyricsRow],
                        flags: discord_js_1.MessageFlags.IsComponentsV2,
                    })
                        .catch((e) => {
                        if (e?.code !== 10008) {
                            client.logger.error("Failed to clear lyrics buttons:", e);
                        }
                    });
                }
            }
            else {
                const noResultsContainer = new discord_js_1.ContainerBuilder()
                    .setAccentColor(client.color.red)
                    .addTextDisplayComponents((textDisplay) => textDisplay.setContent(ctx.locale("cmd.lyrics.errors.no_results")));
                await ctx.editMessage({
                    components: [noResultsContainer],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
        }
        catch (error) {
            client.logger.error(error);
            const errorContainer = new discord_js_1.ContainerBuilder()
                .setAccentColor(client.color.red)
                .addTextDisplayComponents((textDisplay) => textDisplay.setContent(ctx.locale("cmd.lyrics.errors.lyrics_error")));
            await ctx.editMessage({
                components: [errorContainer],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
        }
    }
    async fetchTrackAndLyrics({ client, ctx, songQuery, player, }) {
        let trackTitle = "";
        let artistName = "";
        let trackUrl = "";
        let artworkUrl = "";
        let lyricsResult = "";
        const searchRes = await client.manager.search(songQuery, ctx.author, undefined);
        const track = searchRes.tracks[0];
        if (!track) {
            const noResultsContainer = new discord_js_1.ContainerBuilder()
                .setAccentColor(client.color.red)
                .addTextDisplayComponents((textDisplay) => textDisplay.setContent(ctx.locale("cmd.lyrics.errors.no_results")));
            await ctx.editMessage({
                components: [noResultsContainer],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
            return null;
        }
        try {
            if (!player) {
                const node = client.manager.nodeManager.leastUsedNodes()[0];
                const result = await node.lyrics.get(track, true);
                lyricsResult = result ?? "";
            }
            else {
                lyricsResult = await player.getLyrics(track, true);
            }
        }
        catch (err) {
            if (client.logger && typeof client.logger.error === "function") {
                client.logger.error(`[LYRICS] Error fetching lyrics: ${err}`);
            }
            throw err;
        }
        trackTitle = track.info.title;
        artistName = track.info.author;
        trackUrl = track.info.uri;
        artworkUrl = track.info.artworkUrl || "";
        return { lyricsResult, trackTitle, artistName, trackUrl, artworkUrl };
    }
    paginateLyrics(lyrics, ctx) {
        const lines = lyrics.split("\n");
        const pages = [];
        let currentPage = "";
        const MAX_CHARACTERS_PER_PAGE = 2800;
        for (const line of lines) {
            const lineWithNewline = `${line}\n`;
            if (currentPage.length + lineWithNewline.length >
                MAX_CHARACTERS_PER_PAGE) {
                if (currentPage.trim()) {
                    pages.push(currentPage.trim());
                }
                currentPage = lineWithNewline;
            }
            else {
                currentPage += lineWithNewline;
            }
        }
        if (currentPage.trim()) {
            pages.push(currentPage.trim());
        }
        if (pages.length === 0) {
            pages.push(ctx.locale("cmd.lyrics.no_lyrics_available"));
        }
        return pages;
    }
    cleanLyrics(lyrics) {
        let cleaned = lyrics
            .replace(/^(\d+\s*Contributors.*?Lyrics|.*Contributors.*|Lyrics\s*|.*Lyrics\s*)$/gim, "")
            .replace(/^[\s\n\r]+/, "")
            .replace(/[\s\n\r]+$/, "")
            .replace(/\n{3,}/g, "\n\n");
        return cleaned.trim();
    }
}
exports.default = Lyrics;
