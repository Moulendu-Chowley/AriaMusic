"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../structures/index");
const TRACKS_PER_PAGE = 5;
class Search extends index_1.Command {
    constructor(client) {
        super(client, {
            name: "search",
            description: {
                content: "cmd.search.description",
                examples: ["search example"],
                usage: "search <song>",
            },
            category: "music",
            aliases: ["sc"],
            cooldown: 3,
            args: true,
            vote: true,
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
                    description: "cmd.search.options.song",
                    type: 3,
                    required: true,
                },
            ],
        });
    }
    formatTrackDisplay(track, index, client) {
        return (`**${index + 1}. [${track.info.title}](${track.info.uri})**\n` +
            `*${track.info.author || "Unknown Artist"}*\n` +
            `\`${track.info.duration ? client.utils.formatTime(track.info.duration) : "N/A"}\``);
    }
    generatePageComponents(client, ctx, tracks, currentPage, maxPages, isDisabled = false) {
        const startIndex = currentPage * TRACKS_PER_PAGE;
        const endIndex = startIndex + TRACKS_PER_PAGE;
        const tracksOnPage = tracks.slice(startIndex, Math.min(endIndex, tracks.length));
        const resultsContainer = new discord_js_1.ContainerBuilder()
            .setAccentColor(client.color.main)
            .addTextDisplayComponents((textDisplay) => textDisplay.setContent(`**${ctx.locale("cmd.search.messages.results_found", {
            count: tracks.length,
        })}**\n*${ctx.locale("cmd.search.messages.select_prompt")}*` +
            `\n\n**${ctx.locale("cmd.search.messages.page_info", {
                currentPage: currentPage + 1,
                maxPages: maxPages,
            })}**`));
        tracksOnPage.forEach((track, index) => {
            const globalIndex = startIndex + index;
            const section = new discord_js_1.SectionBuilder().addTextDisplayComponents((textDisplay) => textDisplay.setContent(this.formatTrackDisplay(track, globalIndex, client)));
            if (track.info.artworkUrl) {
                section.setThumbnailAccessory((thumbnail) => thumbnail
                    .setURL(track.info.artworkUrl)
                    .setDescription(`Artwork for ${track.info.title}`));
            }
            resultsContainer.addSectionComponents(section);
        });
        if (tracksOnPage.length > 0) {
            resultsContainer.addSeparatorComponents(new discord_js_1.SeparatorBuilder());
        }
        const selectMenu = new discord_js_1.StringSelectMenuBuilder()
            .setCustomId("select-track")
            .setPlaceholder(ctx.locale("cmd.search.select"))
            .addOptions(tracksOnPage.map((track, index) => ({
            label: `${startIndex + index + 1}. ${track.info.title.slice(0, 50)}${track.info.title.length > 50 ? "..." : ""}`,
            description: (track.info.author || "Unknown Artist").slice(0, 100),
            value: (startIndex + index).toString(),
        })))
            .setDisabled(isDisabled);
        const selectRow = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
        const previousButton = new discord_js_1.ButtonBuilder()
            .setCustomId("previous-page")
            .setLabel(ctx.locale("buttons.previous"))
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setDisabled(currentPage === 0 || isDisabled);
        const nextButton = new discord_js_1.ButtonBuilder()
            .setCustomId("next-page")
            .setLabel(ctx.locale("buttons.next"))
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setDisabled(currentPage === maxPages - 1 || isDisabled);
        const buttonRow = new discord_js_1.ActionRowBuilder().addComponents(previousButton, nextButton);
        return {
            components: [resultsContainer, selectRow, buttonRow],
            flags: discord_js_1.MessageFlags.IsComponentsV2,
        };
    }
    async run(client, ctx, args) {
        const query = args.join(" ");
        const memberVoiceChannel = ctx.member.voice
            .channel;
        let player = client.manager.getPlayer(ctx.guild.id);
        if (!player) {
            player = client.manager.createPlayer({
                guildId: ctx.guild.id,
                voiceChannelId: memberVoiceChannel.id,
                textChannelId: ctx.channel.id,
                selfMute: false,
                selfDeaf: true,
                vcRegion: memberVoiceChannel.rtcRegion,
            });
        }
        if (!player.connected) {
            try {
                await player.connect();
            }
            catch (error) {
                console.error("Failed to connect to voice channel:", error);
                await player.destroy();
                const connectErrorContainer = new discord_js_1.ContainerBuilder()
                    .setAccentColor(this.client.color.red)
                    .addTextDisplayComponents((textDisplay) => textDisplay.setContent(`**${ctx.locale("cmd.search.errors.vc_connect_fail_title")}**\n${ctx.locale("cmd.search.errors.vc_connect_fail_description")}`));
                return await ctx.sendMessage({
                    components: [connectErrorContainer],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                });
            }
        }
        const response = (await player.search({ query: query }, ctx.author));
        if (!response || response.tracks?.length === 0) {
            const noResultsContainer = new discord_js_1.ContainerBuilder()
                .setAccentColor(this.client.color.red)
                .addTextDisplayComponents((textDisplay) => textDisplay.setContent(`**${ctx.locale("cmd.search.errors.no_results_title")}**\n\n${ctx.locale("cmd.search.errors.no_results_description")}`));
            return await ctx.sendMessage({
                components: [noResultsContainer],
                flags: discord_js_1.MessageFlags.IsComponentsV2,
            });
        }
        let currentPage = 0;
        const maxPages = Math.ceil(response.tracks.length / TRACKS_PER_PAGE);
        const initialComponents = this.generatePageComponents(client, ctx, response.tracks, currentPage, maxPages);
        const sentMessage = await ctx.sendMessage(initialComponents);
        const collector = sentMessage.createMessageComponentCollector({
            filter: (f) => f.user.id === ctx.author?.id,
            time: 120000,
            idle: 60000,
        });
        collector.on("collect", async (int) => {
            if (int.customId === "select-track") {
                const selectedIndex = Number.parseInt(int.values[0]);
                const track = response.tracks[selectedIndex];
                await int.deferUpdate();
                if (!track) {
                    const errorContainer = new discord_js_1.ContainerBuilder()
                        .setAccentColor(this.client.color.red)
                        .addTextDisplayComponents((textDisplay) => textDisplay.setContent(`**${ctx.locale("cmd.search.errors.invalid_selection_title")}**\n${ctx.locale("cmd.search.errors.invalid_selection_description")}`));
                    return await int.sendMessage({
                        components: [errorContainer],
                        flags: discord_js_1.MessageFlags.IsComponentsV2 | discord_js_1.MessageFlags.Ephemeral,
                    });
                }
                player.queue.add(track);
                if (!player.playing && player.queue.tracks.length > 0)
                    await player.play({ paused: false });
                const confirmationContainer = new discord_js_1.ContainerBuilder()
                    .setAccentColor(this.client.color.green)
                    .addTextDisplayComponents((textDisplay) => textDisplay.setContent(ctx.locale("cmd.search.messages.added_to_queue", {
                    title: track.info.title,
                    uri: track.info.uri,
                })));
                const disabledComponents = this.generatePageComponents(client, ctx, response.tracks, currentPage, maxPages, true);
                await ctx.editMessage(filterFlagsForEditMessage({
                    components: [
                        confirmationContainer,
                        ...disabledComponents.components.slice(1),
                    ],
                    flags: discord_js_1.MessageFlags.IsComponentsV2,
                }));
                collector.stop("trackSelected");
            }
            else if (int.customId === "previous-page") {
                if (currentPage > 0) {
                    currentPage--;
                    await int.deferUpdate();
                    const newComponents = this.generatePageComponents(client, ctx, response.tracks, currentPage, maxPages);
                    await ctx.editMessage(filterFlagsForEditMessage(newComponents));
                }
                else {
                    await int.deferUpdate();
                }
            }
            else if (int.customId === "next-page") {
                if (currentPage < maxPages - 1) {
                    currentPage++;
                    await int.deferUpdate();
                    const newComponents = this.generatePageComponents(client, ctx, response.tracks, currentPage, maxPages);
                    const newComponentsFiltered = filterFlagsForEditMessage(newComponents);
                    await ctx.editMessage(newComponentsFiltered);
                }
                else {
                    await int.deferUpdate();
                }
            }
            collector.resetTimer();
        });
        collector.on("end", async (_collected, reason) => {
            if (reason === "time" || reason === "idle") {
                try {
                    const timeoutContainer = new discord_js_1.ContainerBuilder()
                        .setAccentColor(this.client.color.red)
                        .addTextDisplayComponents((textDisplay) => textDisplay.setContent(`**${ctx.locale("cmd.search.messages.selection_timed_out_title")}**\n${ctx.locale("cmd.search.messages.selection_timed_out_description")}`));
                    await ctx.editMessage(filterFlagsForEditMessage({
                        components: [timeoutContainer],
                        flags: discord_js_1.MessageFlags.IsComponentsV2,
                    }));
                }
                catch (error) {
                    console.error("Failed to edit message on collector timeout:", error);
                    const fallbackTimeoutContainer = new discord_js_1.ContainerBuilder()
                        .setAccentColor(this.client.color.red)
                        .addTextDisplayComponents((textDisplay) => textDisplay.setContent(ctx.locale("cmd.search.messages.selection_timed_out_short")));
                    await ctx.sendMessage({
                        components: [fallbackTimeoutContainer],
                        flags: discord_js_1.MessageFlags.IsComponentsV2 | discord_js_1.MessageFlags.Ephemeral,
                    });
                }
            }
            else if (reason === "trackSelected") {
            }
        });
    }
}
exports.default = Search;
function filterFlagsForEditMessage(options) {
    const { flags, ...rest } = options;
    return rest;
}
