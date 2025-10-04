import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  version as djsVersion,
} from "discord.js";
import os from "node:os";
import config from "../../configure/config.js";
import { Command } from "../../structures/index.js";

/**
 * @fileoverview About command - Multi-page interactive information about the bot
 * @author Moulendu Chowley
 * @version 1.0.5
 */
export default class About extends Command {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "about",
      description: {
        content: "commands.about.description",
        examples: ["about"],
        usage: "about",
      },
      category: "info",
      aliases: ["ab", "info", "botinfo", "bi", "stats"],
      cooldown: 3,
      args: false,
      vote: false,
      player: {
        voice: false,
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
        ],
        user: [],
      },
      slashCommand: true,
      options: [],
    });
  }

  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   * @param {import('../../structures/Content.js').Content} cnt
   */
  async run(client, cnt) {
    let currentPage = 0;
    const pages = await this.createPages(client, cnt);

    const message = await cnt.sendMessage({
      embeds: [pages[currentPage].embed],
      components: [pages[currentPage].components],
    });

    const collector = message.createMessageComponentCollector({
      time: 300000, // 5 minutes
    });

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== cnt.author.id) {
        return interaction.reply({
          content: cnt.get("buttons.errors.not_author"),
          ephemeral: true,
        });
      }

      if (interaction.customId === "prev_page") {
        currentPage = currentPage === 0 ? pages.length - 1 : currentPage - 1;
      } else if (interaction.customId === "next_page") {
        currentPage = currentPage === pages.length - 1 ? 0 : currentPage + 1;
      }

      await interaction.update({
        embeds: [pages[currentPage].embed],
        components: [pages[currentPage].components],
      });
    });

    collector.on("end", async () => {
      const disabledComponents = pages[currentPage].components.setComponents(
        pages[currentPage].components.components.map((component) =>
          component.setDisabled(true)
        )
      );

      try {
        await message.edit({
          embeds: [pages[currentPage].embed],
          components: [disabledComponents],
        });
      } catch (error) {
        // Message might have been deleted
      }
    });
  }

  async createPages(client, cnt) {
    // Get bot statistics
    const promises = [
      client.shard?.broadcastEval((c) => c.guilds.cache.size),
      client.shard?.broadcastEval((c) =>
        c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
      ),
    ];

    const results = await Promise.all(promises);
    const totalServers =
      results[0]?.reduce((acc, guildCount) => acc + guildCount, 0) ||
      client.guilds.cache.size;
    const totalUsers =
      results[1]?.reduce((acc, memberCount) => acc + memberCount, 0) ||
      client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

    const pages = [];

    // Page 1: Main Information
    const mainEmbed = client
      .embed()
      .setTitle("<a:rg_hypeshiny:892400143675031583> About Me")
      .setThumbnail(client.user?.avatarURL({ size: 256 }))
      .setColor(client.color.main)
      .setDescription(
        "🎵 **Premium Discord music bot with crystal-clear audio**\n✨ Advanced filters • Smart playlists • Lightning-fast streaming\n🚀 *Where music meets innovation*"
      )
      .addFields(
        {
          name: "<:Aria1_circle:1423270589589884938> Bot Version",
          value: "v1.0.5",
          inline: false,
        },
        {
          name: "<:Aria1_circle:1423270589589884938> Node Version",
          value: process.version,
          inline: false,
        },
        {
          name: "<:Aria1_circle:1423270589589884938> Discord.js Version",
          value: djsVersion,
          inline: false,
        },
        {
          name: "<:Aria1_circle:1423270589589884938> Total Servers",
          value: totalServers.toLocaleString(),
          inline: false,
        },
        {
          name: "<:Aria1_circle:1423270589589884938> Total Users",
          value: totalUsers.toLocaleString(),
          inline: false,
        },
        {
          name: "<:Aria1_circle:1423270589589884938> Total Commands",
          value: client.commands.size.toString(),
          inline: false,
        }
      )
      .setFooter({ text: "Page 1/3 • Discover. Play. Vibe." });

    const mainButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev_page")
        .setEmoji(config.emoji.page.back)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("next_page")
        .setEmoji(config.emoji.page.next)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setEmoji(config.emoji.buttons.link)
        .setLabel(cnt.get("buttons.invite"))
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/api/oauth2/authorize?client_id=${client.env.CLIENT_ID}&permissions=274881431873&scope=bot%20applications.commands`
        ),
      new ButtonBuilder()
        .setEmoji(config.emoji.buttons.website)
        .setLabel("Website")
        .setStyle(ButtonStyle.Link)
        .setURL("https://aria.moulendu.in")
    );

    pages.push({ embed: mainEmbed, components: mainButtons });

    // Page 2: Statistics
    const uptime = client.utils.formatTime(client.uptime || 0);
    const botLatency = `${client.ws.ping}ms`;

    // CPU and Memory usage
    const cpuLoad = os.loadavg()[0];
    const cpuPercent = ((cpuLoad / os.cpus().length) * 100).toFixed(1);
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = `${(usedMem / 1024 ** 3).toFixed(2)}GB / ${(
      totalMem /
      1024 ** 3
    ).toFixed(2)}GB`;
    const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

    const statsEmbed = client
      .embed()
      .setTitle("<:Aria1_Node:1423191704135270531> Bot Statistics")
      .setThumbnail(client.user?.avatarURL({ size: 256 }))
      .setColor(client.color.main)
      .addFields(
        {
          name: "<:Aria1_circle:1423270589589884938> Uptime",
          value: uptime,
          inline: false,
        },
        {
          name: "<:Aria1_circle:1423270589589884938> Latency",
          value: botLatency,
          inline: false,
        },
        {
          name: "<:Aria1_circle:1423270589589884938> Active Players",
          value: client.manager?.players?.size?.toString() || "0",
          inline: false,
        },
        {
          name: "<:Aria1_circle:1423270589589884938> CPU Usage",
          value: `${cpuPercent}%`,
          inline: false,
        },
        {
          name: "<:Aria1_circle:1423270589589884938> Memory Usage",
          value: `${memUsage} (${memPercent}%)`,
          inline: false,
        },
        {
          name: "<:Aria1_circle:1423270589589884938> System",
          value: `${os.type()} ${os.release()}`,
          inline: false,
        },
        {
          name: "<:Aria1_circle:1423270589589884938> Architecture",
          value: `${os.arch()} (${os.cpus().length} cores)`,
          inline: false,
        },
        {
          name: "<:Aria1_circle:1423270589589884938> Hostname",
          value: os.hostname(),
          inline: false,
        },
        {
          name: "<:Aria1_circle:1423270589589884938> Shards",
          value: client.shard ? `${client.shard.ids.join(", ")}` : "0",
          inline: false,
        }
      )
      .setFooter({ text: "Page 2/3 • Real-time Statistics" });

    const statsButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev_page")
        .setEmoji(config.emoji.page.back)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("next_page")
        .setEmoji(config.emoji.page.next)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setLabel(cnt.get("buttons.support"))
        .setStyle(ButtonStyle.Link)
        .setURL("https://discord.gg/3puJWDNzzA"),
      new ButtonBuilder()
        .setEmoji(config.emoji.buttons.website)
        .setLabel("Website")
        .setStyle(ButtonStyle.Link)
        .setURL("https://aria.moulendu.in")
    );

    pages.push({ embed: statsEmbed, components: statsButtons });

    // Page 3: Creator Information
    const creatorEmbed = client
      .embed()
      .setTitle("<a:rg_ba2:892400072728399903> About the Creator")
      .setThumbnail(client.user?.avatarURL({ size: 256 }))
      .setColor(client.color.main)
      .setDescription(cnt.get("commands.about.fields.description"))
      .addFields(
        {
          name: "🎯 Creator",
          value: "**Moulendu Chowley**",
          inline: false,
        },
        {
          name: "💼 Social Links",
          value:
            "[<:Aria1_circle:1423270589589884938> GitHub](https://github.com/Moulendu-Chowley)\n[<:Aria1_circle:1423270589589884938> Email](mailto:moulendu25@gmail.com)\n[<:Aria1_circle:1423270589589884938> Discord](https://discord.gg/3puJWDNzzA)",
          inline: false,
        },
        {
          name: "🚀 Project Info",
          value:
            "Personal Discord music bot project\nAdvanced audio streaming & queue management\nBuilt with Discord.js v14\nContinuous development since 2024",
          inline: false,
        }
      )
      .setFooter({ text: "Page 3/3 • Thank you for using Aria Music! ❤️" });

    const creatorButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev_page")
        .setEmoji(config.emoji.page.back)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("next_page")
        .setEmoji(config.emoji.page.next)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setLabel("👨‍💻 GitHub")
        .setStyle(ButtonStyle.Link)
        .setURL("https://github.com/Moulendu-Chowley"),
      new ButtonBuilder()
        .setEmoji(config.emoji.buttons.website)
        .setLabel("Website")
        .setStyle(ButtonStyle.Link)
        .setURL("https://aria.moulendu.in")
    );

    pages.push({ embed: creatorEmbed, components: creatorButtons });

    return pages;
  }
}
