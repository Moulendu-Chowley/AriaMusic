"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../../structures/index");
class GuildDelete extends index_1.Event {
    constructor(client, file) {
        super(client, file, {
            name: "guildDelete",
        });
    }
    async run(guild) {
        if (!guild)
            return;
        let owner;
        try {
            owner = await guild.members.fetch(guild.ownerId);
        }
        catch (error) {
            this.client.logger.error(`Error fetching owner for guild ${guild.id}: ${error}`);
        }
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(this.client.config.color.red)
            .setAuthor({
            name: guild.name || "Unknown Guild",
            iconURL: guild.iconURL({ extension: "jpeg" }) ?? undefined,
        })
            .setDescription(`**${guild.name}** has been removed from my guilds!`)
            .setThumbnail(guild.iconURL({ extension: "jpeg" }))
            .addFields({
            name: "Owner",
            value: owner ? owner.user.tag : "Unknown#0000",
            inline: true,
        }, {
            name: "Members",
            value: guild.memberCount?.toString() || "Unknown",
            inline: true,
        }, {
            name: "Created At",
            value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
            inline: true,
        }, {
            name: "Removed At",
            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
            inline: true,
        }, { name: "ID", value: guild.id, inline: true })
            .setTimestamp();
        const logChannelId = this.client.env.LOG_CHANNEL_ID;
        if (!logChannelId) {
            this.client.logger.error("Log channel ID not found in configuration.");
            return;
        }
        try {
            const fetched = await this.client.channels.fetch(logChannelId);
            if (!fetched?.isTextBased()) {
                this.client.logger.error(`Channel ${logChannelId} is not a text-based channel.`);
                return;
            }
            const channel = fetched;
            await channel.send({ embeds: [embed] });
        }
        catch (error) {
            this.client.logger.error(`Error sending message to log channel ${logChannelId}: ${error}`);
        }
    }
}
exports.default = GuildDelete;
