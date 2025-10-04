import { EmbedBuilder } from "discord.js";
import { Event } from "../../structures/index.js";

/**
 * Represents a guildDelete event.
 */
export default class GuildDelete extends Event {
  /**
   * @param {import('../../structures/AriaMusic').default} client The custom client instance.
   * @param {string} file The file name of the event.
   */
  constructor(client) {
    super(client, {
      name: "guildDelete",
    });
  }

  /**
   * Runs the event.
   * @param {import('discord.js').Guild} guild The guild that was deleted.
   */
  async run(guild) {
    if (!guild) return;

    // Clean up slash commands when leaving guild
    await this.cleanupSlashCommands(guild);

    let owner;
    try {
      owner = await guild.members.fetch(guild.ownerId);
    } catch (error) {
      this.client.logger.error(
        `Error fetching owner for guild ${guild.id}: ${error}`
      );
    }

    const embed = new EmbedBuilder()
      .setColor(this.client.config.color.red)
      .setAuthor({
        name: guild.name || "Unknown Guild",
        iconURL: guild.iconURL({ extension: "jpeg" }) ?? undefined,
      })
      .setDescription(`**${guild.name}** has been removed from my guilds!`)
      .setThumbnail(guild.iconURL({ extension: "jpeg" }))
      .addFields(
        {
          name: "Owner",
          value: owner ? owner.user.tag : "Unknown#0000",
          inline: true,
        },
        {
          name: "Members",
          value: guild.memberCount?.toString() || "Unknown",
          inline: true,
        },
        {
          name: "Created At",
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
          inline: true,
        },
        {
          name: "Removed At",
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
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
      const fetched = await this.client.channels.fetch(logChannelId);
      if (!fetched?.isTextBased()) {
        this.client.logger.error(
          `Channel ${logChannelId} is not a text-based channel.`
        );
        return;
      }
      const channel = fetched;
      await channel.send({ embeds: [embed] });
    } catch (error) {
      this.client.logger.error(
        `Error sending message to log channel ${logChannelId}: ${error}`
      );
    }
  }

  /**
   * Clean up slash commands when bot leaves a guild
   * @param {import('discord.js').Guild} guild
   */
  async cleanupSlashCommands(guild) {
    try {
      this.client.logger.info(
        `Cleaning up slash commands for ${guild.name}...`
      );

      // Clear all guild commands
      await this.client.rest.put(
        `/applications/${this.client.user.id}/guilds/${guild.id}/commands`,
        { body: [] }
      );

      this.client.logger.success(`Cleaned up slash commands for ${guild.name}`);
    } catch (error) {
      this.client.logger.warn(
        `Failed to cleanup slash commands for ${guild.name}:`,
        error
      );
    }
  }
}
