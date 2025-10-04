import { Events } from "discord.js";
import { Event } from "../../structures/index.js";
import { content } from "../../utils/ContentManager.js";

/**
 * Handles automatic slash command deployment when bot joins new guilds
 */
export default class GuildCreate extends Event {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: Events.GuildCreate,
    });
  }

  /**
   * @param {import('discord.js').Guild} guild
   */
  async run(guild) {
    this.client.logger.success(`Joined guild: ${guild.name} (${guild.id})`);

    try {
      // Auto-deploy slash commands to the new guild
      await this.deploySlashCommands(guild);
    } catch (error) {
      this.client.logger.error(
        `Failed to deploy commands to ${guild.name}:`,
        error
      );
    }
  }

  /**
   * Deploy slash commands to a specific guild
   * @param {import('discord.js').Guild} guild
   */
  async deploySlashCommands(guild) {
    this.client.logger.info(`Deploying slash commands to ${guild.name}...`);

    // Get all commands that have slashCommand enabled
    const slashCommands = this.client.commands
      .filter((cmd) => cmd.slashCommand)
      .map((cmd) => {
        let description = `Execute ${cmd.name} command`;

        // Resolve description using ContentManager
        if (cmd.description?.content) {
          const resolvedDescription = content.get(cmd.description.content);
          if (resolvedDescription) {
            description = resolvedDescription;
          }
        }

        // Ensure description meets Discord requirements (1-100 characters)
        if (description.length > 100) {
          description = description.substring(0, 97) + "...";
        }

        return {
          name: cmd.name,
          description: description,
          type: 1, // CHAT_INPUT
          options: cmd.options || [],
        };
      });

    // Deploy to the specific guild
    await this.client.rest.put(
      `/applications/${this.client.user.id}/guilds/${guild.id}/commands`,
      { body: slashCommands }
    );

    this.client.logger.success(
      `Deployed ${slashCommands.length} commands to ${guild.name}`
    );
  }

  /**
   * Update bot activity with current server count
   */
  updateBotActivity() {
    try {
      const serverCount = this.client.guilds.cache.size;
      const userCount = this.client.guilds.cache.reduce(
        (acc, guild) => acc + guild.memberCount,
        0
      );

      // Update the original activities array if it exists
      if (
        this.client.originalActivities &&
        this.client.originalActivities.length > 1
      ) {
        this.client.originalActivities[1].name = `Over ${serverCount} Servers`;
        this.client.originalActivities[3].name = `${userCount.toLocaleString()} Users`;
      }
    } catch (error) {
      this.client.logger.error("Failed to update bot activity:", error);
    }
  }

  /**
   * Send log message to configured log channel
   * @param {import('discord.js').Guild} guild
   */
  async sendLogMessage(guild) {
    const logChannelId = this.client.env.LOG_CHANNEL_ID;
    if (!logChannelId) return;

    try {
      let owner;
      try {
        owner = await guild.members.fetch(guild.ownerId);
      } catch (e) {
        this.client.logger.error(
          `Error fetching owner for guild ${guild.id}: ${e}`
        );
      }

      const { EmbedBuilder } = await import("discord.js");
      const embed = new EmbedBuilder()
        .setColor(this.client.config.color.green)
        .setAuthor({
          name: guild.name,
          iconURL: guild.iconURL({ extension: "jpeg" }),
        })
        .setDescription(
          `**${guild.name}** has been added to my guilds!\n\n✅ **Slash commands deployed automatically**`
        )
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
            name: "Commands Deployed",
            value: this.client.commands
              .filter((cmd) => cmd.slashCommand)
              .size.toString(),
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

      const channel = await this.client.channels.fetch(logChannelId);
      if (channel) {
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      this.client.logger.error(`Error sending log message: ${error}`);
    }
  }
}
