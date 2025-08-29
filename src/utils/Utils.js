"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const discord_js_1 = require("discord.js");
class Utils {
    static formatTime(ms) {
        const minuteMs = 60 * 1000;
        const hourMs = 60 * minuteMs;
        const dayMs = 24 * hourMs;
        if (ms < minuteMs)
            return `${ms / 1000}s`;
        if (ms < hourMs)
            return `${Math.floor(ms / minuteMs)}m ${Math.floor((ms % minuteMs) / 1000)}s`;
        if (ms < dayMs)
            return `${Math.floor(ms / hourMs)}h ${Math.floor((ms % hourMs) / minuteMs)}m`;
        return `${Math.floor(ms / dayMs)}d ${Math.floor((ms % dayMs) / hourMs)}h`;
    }
    static updateStatus(client, guildId) {
        const { user } = client;
        if (user && client.env.GUILD_ID && guildId === client.env.GUILD_ID) {
            const player = client.manager.getPlayer(client.env.GUILD_ID);
            user.setPresence({
                activities: [
                    {
                        name: player?.queue?.current
                            ? `🎶 | ${player.queue?.current.info.title}`
                            : client.env.BOT_ACTIVITY,
                        type: player?.queue?.current
                            ? discord_js_1.ActivityType.Listening
                            : client.env.BOT_ACTIVITY_TYPE,
                    },
                ],
                status: client.env.BOT_STATUS,
            });
        }
    }
    static async setVoiceStatus(client, channelId, message) {
        await client.rest
            .put(`/channels/${channelId}/voice-status`, { body: { status: message } })
            .catch(() => { });
    }
    static chunk(array, size) {
        const chunked_arr = [];
        for (let index = 0; index < array.length; index += size) {
            chunked_arr.push(array.slice(index, size + index));
        }
        return chunked_arr;
    }
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0)
            return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
    }
    static formatNumber(number) {
        return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }
    static parseTime(string) {
        const time = string.match(/(\d+[dhms])/g);
        if (!time)
            return 0;
        let ms = 0;
        for (const t of time) {
            const unit = t[t.length - 1];
            const amount = Number(t.slice(0, -1));
            if (unit === "d")
                ms += amount * 24 * 60 * 60 * 1000;
            else if (unit === "h")
                ms += amount * 60 * 60 * 1000;
            else if (unit === "m")
                ms += amount * 60 * 1000;
            else if (unit === "s")
                ms += amount * 1000;
        }
        return ms;
    }
    static progressBar(current, total, size = 20) {
        const percent = Math.round((current / total) * 100);
        const filledSize = Math.round((size * current) / total);
        const filledBar = "▓".repeat(filledSize);
        const emptyBar = "░".repeat(size - filledSize);
        return `${filledBar}${emptyBar} ${percent}%`;
    }
    static async paginate(client, ctx, embed) {
        if (embed.length < 2) {
            if (ctx.isInteraction) {
                ctx.deferred
                    ? await ctx.interaction?.followUp({ embeds: embed })
                    : await ctx.interaction?.reply({ embeds: embed });
                return;
            }
            await ctx.channel.send({ embeds: embed });
            return;
        }
        let page = 0;
        let stoppedManually = false;
        const getButton = (page) => {
            const firstEmbed = page === 0;
            const lastEmbed = page === embed.length - 1;
            const pageEmbed = embed[page];
            const first = new discord_js_1.ButtonBuilder()
                .setCustomId("first")
                .setEmoji(client.emoji.page.first)
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setDisabled(firstEmbed);
            const back = new discord_js_1.ButtonBuilder()
                .setCustomId("back")
                .setEmoji(client.emoji.page.back)
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setDisabled(firstEmbed);
            const next = new discord_js_1.ButtonBuilder()
                .setCustomId("next")
                .setEmoji(client.emoji.page.next)
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setDisabled(lastEmbed);
            const last = new discord_js_1.ButtonBuilder()
                .setCustomId("last")
                .setEmoji(client.emoji.page.last)
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setDisabled(lastEmbed);
            const stop = new discord_js_1.ButtonBuilder()
                .setCustomId("stop")
                .setEmoji(client.emoji.page.cancel)
                .setStyle(discord_js_1.ButtonStyle.Danger);
            const row = new discord_js_1.ActionRowBuilder().addComponents(first, back, stop, next, last);
            return { embeds: [pageEmbed], components: [row] };
        };
        const msgOptions = getButton(0);
        let msg;
        if (ctx.isInteraction) {
            if (ctx.deferred) {
                await ctx.interaction.followUp(msgOptions);
                msg = (await ctx.interaction.fetchReply());
            }
            else {
                await ctx.interaction.reply(msgOptions);
                msg = (await ctx.interaction.fetchReply());
            }
        }
        else {
            msg = await ctx.channel.send(msgOptions);
        }
        const author = ctx instanceof discord_js_1.CommandInteraction ? ctx.user : ctx.author;
        const filter = (int) => int.user.id === author?.id;
        const collector = msg.createMessageComponentCollector({
            filter,
            time: 60000,
        });
        collector.on("collect", async (interaction) => {
            if (interaction.user.id !== author?.id) {
                await interaction.reply({
                    content: ctx.locale("buttons.errors.not_author"),
                    flags: discord_js_1.MessageFlags.Ephemeral,
                });
                return;
            }
            await interaction.deferUpdate();
            switch (interaction.customId) {
                case "first":
                    if (page !== 0)
                        page = 0;
                    break;
                case "back":
                    if (page > 0)
                        page--;
                    break;
                case "next":
                    if (page < embed.length - 1)
                        page++;
                    break;
                case "last":
                    if (page !== embed.length - 1)
                        page = embed.length - 1;
                    break;
                case "stop":
                    stoppedManually = true;
                    collector.stop();
                    try {
                        await msg.edit({ components: [] });
                    }
                    catch { }
                    return;
            }
            await interaction.editReply(getButton(page));
        });
        collector.on("end", async () => {
            if (stoppedManually)
                return;
            try {
                await msg.edit({ embeds: [embed[page]], components: [] });
            }
            catch { }
        });
    }
}
exports.Utils = Utils;
