"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getButtons = getButtons;
const discord_js_1 = require("discord.js");
function getButtons(player, client) {
    const buttonData = [
        {
            customId: "PREV_BUT",
            emoji: client.emoji.previous,
            style: discord_js_1.ButtonStyle.Secondary,
        },
        {
            customId: "REWIND_BUT",
            emoji: client.emoji.rewind,
            style: discord_js_1.ButtonStyle.Secondary,
        },
        {
            customId: "PAUSE_BUT",
            emoji: player?.paused ? client.emoji.resume : client.emoji.pause,
            style: player?.paused ? discord_js_1.ButtonStyle.Success : discord_js_1.ButtonStyle.Secondary,
        },
        {
            customId: "FORWARD_BUT",
            emoji: client.emoji.forward,
            style: discord_js_1.ButtonStyle.Secondary,
        },
        {
            customId: "SKIP_BUT",
            emoji: client.emoji.skip,
            style: discord_js_1.ButtonStyle.Secondary,
        },
        {
            customId: "LOW_VOL_BUT",
            emoji: client.emoji.voldown,
            style: discord_js_1.ButtonStyle.Secondary,
        },
        {
            customId: "LOOP_BUT",
            emoji: client.emoji.loop.none,
            style: discord_js_1.ButtonStyle.Secondary,
        },
        {
            customId: "STOP_BUT",
            emoji: client.emoji.stop,
            style: discord_js_1.ButtonStyle.Danger,
        },
        {
            customId: "SHUFFLE_BUT",
            emoji: client.emoji.shuffle,
            style: discord_js_1.ButtonStyle.Secondary,
        },
        {
            customId: "HIGH_VOL_BUT",
            emoji: client.emoji.volup,
            style: discord_js_1.ButtonStyle.Secondary,
        },
    ];
    return buttonData.reduce((rows, { customId, emoji, style }, index) => {
        if (index % 5 === 0)
            rows.push(new discord_js_1.ActionRowBuilder());
        let emojiFormat;
        if (typeof emoji === "string" && emoji.startsWith("<:")) {
            const match = emoji.match(/^<:\w+:(\d+)>$/);
            emojiFormat = match ? match[1] : emoji;
        }
        else {
            emojiFormat = emoji;
        }
        const button = new discord_js_1.ButtonBuilder()
            .setCustomId(customId)
            .setEmoji(emojiFormat)
            .setStyle(style);
        rows[rows.length - 1].addComponents(button);
        return rows;
    }, []);
}
