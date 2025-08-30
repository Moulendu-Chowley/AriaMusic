import { EmbedBuilder } from "discord.js";
import { Event } from "../../structures/index.js";

/**
 * Represents a guildCreate event.
 */
export default class GuildCreate extends Event {
    /**
     * @param {import('../../structures/AriaMusic').default} client The custom client instance.
     * @param {string} file The file name of the event.
     */
    constructor(client, file) {
        super(client, file, {
            name: "guildCreate",
        });
    }

    /**
     * Runs the event.
     * @param {import('discord.js').Guild} guild The guild that was created.
     */
    async run(guild) {
        let owner;
        try {
            owner = await guild.members.fetch(guild.ownerId);
        } catch (e) {
            this.client.logger.error(`Error fetching owner for guild ${guild.id}: ${e}`);
        }

        const embed = new EmbedBuilder()
            .setColor(this.client.config.color.green)
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL({ extension: "jpeg" }),
            })
            .setDescription(`**${guild.name}** has been added to my guilds!`)
            .setThumbnail(guild.iconURL({ extension: "jpeg" }))
            .addFields(
                {
                    name: "Owner",
                    value: owner ? owner.user.tag : "Unknown#0000",
                    inline: true,
                },
                {
                    name: "Members",
                    value: guild.memberCount.toString(),
                    inline: true,
                },
                {
                    name: "Created At",
                    value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
                    inline: true,
                },
                {
                    name: "Joined At",
                    value: `<t:${Math.floor(guild.joinedTimestamp / 1000)}:F>`,
                    inline: true,
                },
                { name: "ID", value: guild.id, inline: true }
            )
            .setTimestamp();

        const logChannelId = this.client.env.LOG_CHANNEL_ID;
        if (!logChannelId) {
            this.client.logger.error("Log channel ID not found in configuration.");
            return;
        }

        try {
            const channel = await this.client.channels.fetch(logChannelId);
            if (!channel) {
                this.client.logger.error(`Log channel not found with ID ${logChannelId}. Please change the settings in .env or, if you have a channel, invite me to that guild.`);
                return;
            }
            await channel.send({ embeds: [embed] });
        } catch (error) {
            this.client.logger.error(`Error sending message to log channel ${logChannelId}: ${error}`);
        }
    }
}