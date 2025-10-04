import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";

/**
 * A class with utility methods.
 */
export default class Utils {
  /**
   * Escapes markdown characters in text to prevent formatting issues.
   * @param {string} text The text to escape.
   * @returns {string} The escaped text.
   */
  static escapeMarkdown(text) {
    if (!text) return text;
    return text
      .replace(/\*/g, "\\*")
      .replace(/_/g, "\\_")
      .replace(/~/g, "\\~")
      .replace(/`/g, "\\`");
  }

  /**
   * Formats milliseconds into a human-readable time string.
   * @param {number} ms The number of milliseconds.
   * @returns {string} The formatted time string.
   */
  static formatTime(ms) {
    const minuteMs = 60 * 1000;
    const hourMs = 60 * minuteMs;
    const dayMs = 24 * hourMs;

    if (ms < minuteMs) return `${ms / 1000}s`;
    if (ms < hourMs)
      return `${Math.floor(ms / minuteMs)}m ${Math.floor(
        (ms % minuteMs) / 1000
      )}s`;
    if (ms < dayMs)
      return `${Math.floor(ms / hourMs)}h ${Math.floor(
        (ms % hourMs) / minuteMs
      )}m`;
    return `${Math.floor(ms / dayMs)}d ${Math.floor((ms % dayMs) / hourMs)}h`;
  }

  /**
   * Updates the rotation activities to include current song if playing.
   * @param {import('../structures/AriaMusic').default} client The custom client instance.
   * @param {string} guildId The ID of the guild.
   */
  static updateStatus(client, guildId) {
    const { user } = client;
    if (user && client.env.GUILD_ID && guildId === client.env.GUILD_ID) {
      const player = client.manager.getPlayer(client.env.GUILD_ID);

      // Update the activities array with current song if playing
      if (player?.queue?.current) {
        const currentSongTitle = player.queue.current.info.title;

        // Update if no song in rotation or song title changed
        if (
          !client.currentSongInRotation ||
          client.currentSongTitle !== currentSongTitle
        ) {
          client.currentSongInRotation = true;
          client.currentSongTitle = currentSongTitle;
          this.addSongToRotation(client, currentSongTitle);
        }
      } else {
        if (client.currentSongInRotation) {
          client.currentSongInRotation = false;
          client.currentSongTitle = null;
          this.removeSongFromRotation(client);
        }
      }
    }
  }

  /**
   * Replace streaming activity with current song
   * @param {import('../structures/AriaMusic').default} client The custom client instance.
   * @param {string} songTitle The title of the current song
   */
  static addSongToRotation(client, songTitle) {
    // Replace the first activity (Streaming Music) with current song
    if (client.currentActivities && client.currentActivities.length >= 4) {
      client.currentActivities[0] = {
        name: `🎶 | ${songTitle} in HANGOUT`,
        type: 1, // Streaming
      };
    }
  }

  /**
   * Restore original streaming activity
   * @param {import('../structures/AriaMusic').default} client The custom client instance.
   */
  static removeSongFromRotation(client) {
    // Restore original "Music" streaming activity
    if (client.currentActivities && client.currentActivities.length >= 4) {
      client.currentActivities[0] = {
        name: "Music",
        type: 1, // Streaming
      };
    }
  }

  /**
   * Sets the voice status of the bot in a channel.
   * @param {import('../structures/AriaMusic').default} client The custom client instance.
   * @param {string} channelId The ID of the channel.
   * @param {string} message The status message.
   */
  static async setVoiceStatus(client, channelId, message) {
    await client.rest
      .put(`/channels/${channelId}/voice-status`, { body: { status: message } })
      .catch(() => {});
  }

  /**
   * Chunks an array into smaller arrays.
   * @param {any[]} array The array to chunk.
   * @param {number} size The size of each chunk.
   * @returns {any[][]} The chunked array.
   */
  static chunk(array, size) {
    const chunked_arr = [];
    for (let index = 0; index < array.length; index += size) {
      chunked_arr.push(array.slice(index, size + index));
    }
    return chunked_arr;
  }

  /**
   * Formats bytes into a human-readable string.
   * @param {number} bytes The number of bytes.
   * @param {number} [decimals=2] The number of decimal places.
   * @returns {string} The formatted string.
   */
  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
  }

  /**
   * Formats a number with commas.
   * @param {number} number The number to format.
   * @returns {string} The formatted number.
   */
  static formatNumber(number) {
    return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }

  /**
   * Parses a time string into milliseconds.
   * @param {string} string The time string to parse.
   * @returns {number} The number of milliseconds.
   */
  static parseTime(string) {
    const time = string.match(/(\d+[dhms])/g);
    if (!time) return 0;
    let ms = 0;
    for (const t of time) {
      const unit = t[t.length - 1];
      const amount = Number(t.slice(0, -1));
      if (unit === "d") ms += amount * 24 * 60 * 60 * 1000;
      else if (unit === "h") ms += amount * 60 * 60 * 1000;
      else if (unit === "m") ms += amount * 60 * 1000;
      else if (unit === "s") ms += amount * 1000;
    }
    return ms;
  }

  /**
   * Creates a progress bar string.
   * @param {number} current The current value.
   * @param {number} total The total value.
   * @param {number} [size=20] The size of the progress bar.
   * @returns {string} The progress bar string.
   */
  static progressBar(current, total, size = 20) {
    const percent = Math.round((current / total) * 100);
    const filledSize = Math.round((size * current) / total);
    const filledBar = "▓".repeat(filledSize);
    const emptyBar = "░".repeat(size - filledSize);
    return `${filledBar}${emptyBar} ${percent}%`;
  }

  /**
   * Paginates embeds.
   * @param {import('../structures/AriaMusic').default} client The custom client instance.
   * @param {import('../structures/Content').default} cnt The context of the command.
   * @param {EmbedBuilder[]} embed The embeds to paginate.
   */
  static async paginate(client, cnt, embed) {
    if (embed.length < 2) {
      if (cnt.isInteraction) {
        cnt.deferred
          ? await cnt.interaction?.followUp({ embeds: embed })
          : await cnt.interaction?.reply({ embeds: embed });
        return;
      }
      await cnt.channel.send({ embeds: embed });
      return;
    }

    let page = 0;
    let stoppedManually = false;

    const getButton = (page) => {
      const firstEmbed = page === 0;
      const lastEmbed = page === embed.length - 1;
      const pageEmbed = embed[page];

      const first = new ButtonBuilder()
        .setCustomId("first")
        .setEmoji(client.emoji.page.first)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(firstEmbed);
      const back = new ButtonBuilder()
        .setCustomId("back")
        .setEmoji(client.emoji.page.back)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(firstEmbed);
      const next = new ButtonBuilder()
        .setCustomId("next")
        .setEmoji(client.emoji.page.next)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(lastEmbed);
      const last = new ButtonBuilder()
        .setCustomId("last")
        .setEmoji(client.emoji.page.last)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(lastEmbed);
      const stop = new ButtonBuilder()
        .setCustomId("stop")
        .setEmoji(client.emoji.page.cancel)
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(
        first,
        back,
        stop,
        next,
        last
      );
      return { embeds: [pageEmbed], components: [row] };
    };

    const msgOptions = getButton(0);
    let msg;

    if (cnt.isInteraction) {
      if (cnt.deferred) {
        msg = await cnt.interaction.followUp(msgOptions);
      } else {
        await cnt.interaction.reply(msgOptions);
        msg = await cnt.interaction.fetchReply();
      }
    } else {
      msg = await cnt.channel.send(msgOptions);
    }

    const author = cnt instanceof CommandInteraction ? cnt.user : cnt.author;
    const filter = (int) => int.user.id === author?.id;
    const collector = msg.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== author?.id) {
        await interaction.reply({
          content: cnt.get("buttons.errors.not_author"),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      await interaction.deferUpdate();
      switch (interaction.customId) {
        case "first":
          if (page !== 0) page = 0;
          break;
        case "back":
          if (page > 0) page--;
          break;
        case "next":
          if (page < embed.length - 1) page++;
          break;
        case "last":
          if (page !== embed.length - 1) page = embed.length - 1;
          break;
        case "stop":
          stoppedManually = true;
          collector.stop();
          try {
            await msg.edit({ components: [] });
          } catch {}
          return;
      }
      await interaction.editReply(getButton(page));
    });

    collector.on("end", async () => {
      if (stoppedManually) return;
      try {
        await msg.edit({ embeds: [embed[page]], components: [] });
      } catch {}
    });
  }
}
