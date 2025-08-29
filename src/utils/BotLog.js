"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLog = sendLog;
function sendLog(client, message, type = "info") {
    if (!client?.channels.cache && client.env.LOG_CHANNEL_ID)
        return;
    const channel = client.channels.cache.get(client.env.LOG_CHANNEL_ID);
    if (!channel)
        return;
    const colors = {
        error: 0xff0000,
        warn: 0xffff00,
        info: 0x00ff00,
        success: 0x00ff00,
    };
    const color = colors[type];
    const embed = client
        .embed()
        .setColor(color)
        .setDescription(message)
        .setTimestamp();
    channel.send({ embeds: [embed] }).catch(() => {
        null;
    });
}
