import {
  EmbedBuilder,
  Guild,
  Message,
  MessageFlags,
  TextChannel,
} from "discord.js";
import { getButtons } from "./Buttons.js";
import { content } from "./ContentManager.js";

/**
 * Builds the embed for the setup message.
 * @param {EmbedBuilder} embed The embed to build upon.
 * @param {import('lavalink-client').Player} player The Lavalink player instance.
 * @param {import('../structures/AriaMusic').default} client The custom client instance.
 * @returns {EmbedBuilder} The built embed.
 */
function neb(embed, player, client) {
  if (!player?.queue.current?.info) return embed;

  const iconUrl =
    client.config.icons[player.queue.current.info.sourceName] ||
    client.user.displayAvatarURL({ extension: "png" });
  const icon = player.queue.current.info.artworkUrl || client.config.links.img;
  const description = content.get("player.setupStart.description", {
    title: player.queue.current.info.title,
    uri: player.queue.current.info.uri,
    author: player.queue.current.info.author,
    length: client.utils.formatTime(player.queue.current.info.duration),
    requester: player.queue.current.requester.id,
  });

  return embed
    .setAuthor({
      name: content.get("player.setupStart.now_playing"),
      iconURL: iconUrl,
    })
    .setDescription(description)
    .setImage(icon)
    .setColor(client.color.main);
}

/**
 * Handles the setup start message.
 * @param {import('../structures/AriaMusic').default} client The custom client instance.
 * @param {string} query The search query.
 * @param {import('lavalink-client').Player} player The Lavalink player instance.
 * @param {Message} message The message that triggered the command.
 */
export async function setupStart(client, query, player, message) {
  let m;
  const embed = client.embed();
  const n = client.embed().setColor(client.color.main);
  const data = await client.db.getSetup(message.guild.id);

  try {
    if (data)
      m = await message.channel.messages.fetch({
        message: data.messageId,
        cache: true,
      });
  } catch (error) {
    client.logger.error(error);
  }

  if (m) {
    try {
      if (message.inGuild()) {
        const res = await player.search(query, message.author);
        switch (res.loadType) {
          case "empty":
          case "error":
            await message.channel
              .send({
                embeds: [
                  embed
                    .setColor(client.color.red)
                    .setDescription(
                      content.get("player.setupStart.error_searching")
                    ),
                ],
              })
              .then((msg) => setTimeout(() => msg.delete(), 5000));
            break;
          case "search":
          case "track": {
            player.queue.add(res.tracks[0]);
            await message.channel
              .send({
                embeds: [
                  embed.setColor(client.color.main).setDescription(
                    content.get("player.setupStart.added_to_queue", {
                      title: res.tracks[0].info.title,
                      uri: res.tracks[0].info.uri,
                    })
                  ),
                ],
              })
              .then((msg) => setTimeout(() => msg.delete(), 5000));
            neb(n, player, client);
            await m.edit({ embeds: [n] }).catch(() => null);
            break;
          }
          case "playlist": {
            player.queue.add(res.tracks);
            await message.channel
              .send({
                embeds: [
                  embed.setColor(client.color.main).setDescription(
                    content.get("player.setupStart.added_playlist_to_queue", {
                      length: res.tracks.length,
                    })
                  ),
                ],
              })
              .then((msg) => setTimeout(() => msg.delete(), 5000));
            neb(n, player, client);
            await m.edit({ embeds: [n] }).catch(() => null);
            break;
          }
        }
        if (!player.playing && player.queue.tracks.length > 0)
          await player.play();
      }
    } catch (error) {
      client.logger.error(error);
    }
  }
}

/**
 * Handles the track start event.
 * @param {string} msgId The message ID of the setup message.
 * @param {TextChannel} channel The text channel of the setup message.
 * @param {import('lavalink-client').Player} player The Lavalink player instance.
 * @param {import('lavalink-client').Track} track The track that started playing.
 * @param {import('../structures/AriaMusic').default} client The custom client instance.
 */
export async function trackStart(msgId, channel, player, track, client) {
  const icon = player.queue.current
    ? player.queue.current.info.artworkUrl
    : client.config.links.img;
  let m;

  try {
    m = await channel.messages.fetch({ message: msgId, cache: true });
  } catch (error) {
    client.logger.error(error);
  }

  const iconUrl =
    client.config.icons[player.queue.current.info.sourceName] ||
    client.user.displayAvatarURL({ extension: "png" });
  const description = content.get("player.setupStart.description", {
    title: track.info.title,
    uri: track.info.uri,
    author: track.info.author,
    length: client.utils.formatTime(track.info.duration),
    requester: player.queue.current.requester.id,
  });
  const embed = client
    .embed()
    .setAuthor({
      name: content.get("player.setupStart.now_playing"),
      iconURL: iconUrl,
    })
    .setColor(client.color.main)
    .setDescription(description)
    .setImage(icon);

  if (m) {
    await m
      .edit({
        embeds: [embed],
        components: getButtons(player, client).map((b) => {
          b.components.forEach((c) => c.setDisabled(!player?.queue.current));
          return b;
        }),
      })
      .catch(() => null);
  } else {
    await channel
      .send({
        embeds: [embed],
        components: getButtons(player, client).map((b) => {
          b.components.forEach((c) => c.setDisabled(!player?.queue.current));
          return b;
        }),
      })
      .then((msg) => {
        client.db.setSetup(msg.guild.id, msg.id, msg.channel.id);
      })
      .catch(() => null);
  }
}

/**
 * Updates the setup message.
 * @param {import('../structures/AriaMusic').default} client The custom client instance.
 * @param {Guild} guild The guild to update the setup message in.
 */
export async function updateSetup(client, guild) {
  const setup = await client.db.getSetup(guild.id);
  let m;

  if (setup?.textId) {
    const textChannel = guild.channels.cache.get(setup.textId);
    if (!textChannel) return;
    try {
      m = await textChannel.messages.fetch({
        message: setup.messageId,
        cache: true,
      });
    } catch (error) {
      client.logger.error(error);
    }
  }

  if (m) {
    const player = client.manager.getPlayer(guild.id);
    if (player?.queue.current) {
      const iconUrl =
        client.config.icons[player.queue.current.info.sourceName] ||
        client.user.displayAvatarURL({ extension: "png" });
      const description = content.get("player.setupStart.description", {
        title: player.queue.current.info.title,
        uri: player.queue.current.info.uri,
        author: player.queue.current.info.author,
        length: client.utils.formatTime(player.queue.current.info.duration),
        requester: player.queue.current.requester.id,
      });
      const embed = client
        .embed()
        .setAuthor({
          name: content.get("player.setupStart.now_playing"),
          iconURL: iconUrl,
        })
        .setColor(client.color.main)
        .setDescription(description)
        .setImage(player.queue.current.info.artworkUrl);
      await m
        .edit({
          embeds: [embed],
          components: getButtons(player, client).map((b) => {
            b.components.forEach((c) => c.setDisabled(!player?.queue.current));
            return b;
          }),
        })
        .catch(() => null);
    } else {
      const embed = client
        .embed()
        .setColor(client.color.main)
        .setAuthor({
          name: client.user.username,
          iconURL: client.user.displayAvatarURL({ extension: "png" }),
        })
        .setDescription(content.get("player.setupStart.nothing_playing"))
        .setImage(client.config.links.img);
      await m
        .edit({
          embeds: [embed],
          components: getButtons(player, client).map((b) => {
            b.components.forEach((c) => c.setDisabled(true));
            return b;
          }),
        })
        .catch(() => null);
    }
  }
}

/**
 * Replies to a button interaction.
 * @param {Interaction} int The interaction to reply to.
 * @param {string} args The message to reply with.
 * @param {ColorResolvable} color The color of the embed.
 */
export async function buttonReply(int, args, color) {
  const embed = new EmbedBuilder();
  let m;

  if (int.replied) {
    m = await int
      .editReply({ embeds: [embed.setColor(color).setDescription(args)] })
      .catch(() => null);
  } else {
    m = await int
      .followUp({ embeds: [embed.setColor(color).setDescription(args)] })
      .catch(() => null);
  }

  setTimeout(async () => {
    if (int && !int.flags?.has(MessageFlags.Ephemeral)) {
      await m.delete().catch(() => null);
    }
  }, 2000);
}

/**
 * Sends an error message.
 * @param {TextChannel} channel The channel to send the message in.
 * @param {string} args The message to send.
 */
export async function oops(channel, args) {
  try {
    const embed1 = new EmbedBuilder().setColor("Red").setDescription(`${args}`);
    const m = await channel.send({
      embeds: [embed1],
    });
    setTimeout(async () => await m.delete().catch(() => null), 12000);
  } catch (e) {
    return console.error(e);
  }
}
