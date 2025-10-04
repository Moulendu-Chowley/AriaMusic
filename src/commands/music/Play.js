import { Command } from "../../structures/index.js";
import { applyFairPlayToQueue } from "../../utils/functions/player.js";

/**
 * @extends Command
 */
export default class Play extends Command {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "play",
      description: {
        content: "commands.play.description",
        examples: [
          "play songname",
          "play https://www.youtube.com/watch?v=example",
          "play https://open.spotify.com/track/example",
          "play http://www.example.com/example.mp3",
        ],
        usage: "play <song>",
      },
      category: "music",
      aliases: ["p"],
      cooldown: 3,
      args: true,
      vote: false,
      player: {
        voice: true,
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
          "Connect",
          "Speak",
        ],
        user: [],
      },
      slashCommand: true,
      options: [
        {
          name: "song",
          description: "commands.play.options.song",
          type: 3,
          required: true,
          autocomplete: true,
        },
      ],
    });
  }

  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   * @param {import('../../structures/Content.js').Content} cnt
   * @param {string[]} args
   */
  async run(client, cnt, args) {
    const query = cnt.isInteraction
      ? cnt.interaction.options.getString("song")
      : args.join(" ");
    await cnt.sendDeferMessage(cnt.get("commands.play.loading"));

    let player = client.manager.getPlayer(cnt.guild.id);
    const memberVoiceChannel = cnt.member.voice.channel;

    if (!player)
      player = client.manager.createPlayer({
        guildId: cnt.guild.id,
        voiceChannelId: memberVoiceChannel.id,
        textChannelId: cnt.channel.id,
        selfMute: false,
        selfDeaf: true,
        vcRegion: memberVoiceChannel.rtcRegion,
      });

    if (!player.connected) await player.connect();

    // Update the text channel to the current channel where the command was used
    player.textChannelId = cnt.channel.id;

    const response = await player.search({ query: query }, cnt.author);
    const embed = this.client.embed();

    if (!response || response.tracks?.length === 0) {
      return await cnt.editMessage({
        content: "",
        embeds: [
          embed
            .setColor(this.client.color.red)
            .setDescription(cnt.get("commands.play.errors.search_error")),
        ],
      });
    }

    await player.queue.add(
      response.loadType === "playlist" ? response.tracks : response.tracks[0]
    );

    const fairPlayEnabled = player.get("fairplay");
    if (fairPlayEnabled) {
      await applyFairPlayToQueue(player);
    }

    if (response.loadType === "playlist") {
      await cnt.editMessage({
        content: "",
        embeds: [
          embed.setColor(this.client.color.main).setDescription(
            cnt.get("commands.play.added_playlist_to_queue", {
              length: response.tracks.length,
              queueLength: player.queue.tracks.length,
            })
          ),
        ],
      });
    } else {
      const queuePosition = player.queue.tracks.length;
      await cnt.editMessage({
        content: "",
        embeds: [
          embed.setColor(this.client.color.main).setDescription(
            cnt.get("commands.play.added_to_queue", {
              title: response.tracks[0].info.title,
              uri: response.tracks[0].info.uri,
              position: queuePosition,
              queueLength: player.queue.tracks.length,
            })
          ),
        ],
      });
    }

    if (!player.playing && player.queue.tracks.length > 0)
      await player.play({ paused: false });
  }

  /**
   * @param {import('discord.js').AutocompleteInteraction} interaction
   */
  async autocomplete(interaction) {
    try {
      const focusedValue = interaction.options.getFocused(true);
      if (!focusedValue?.value.trim()) {
        return await interaction.respond([]);
      }

      const query = focusedValue.value.trim();
      if (query.length < 2) {
        return await interaction.respond([]);
      }

      const res = await this.client.manager.search(
        { query: query },
        interaction.user
      );
      const songs = [];

      if (res && res.tracks && res.tracks.length > 0) {
        res.tracks.slice(0, 10).forEach((track) => {
          const name = `${track.info.title} by ${track.info.author}`;
          songs.push({
            name: name.length > 100 ? `${name.substring(0, 97)}...` : name,
            value: track.info.uri,
          });
        });
      }

      return await interaction.respond(songs);
    } catch (error) {
      console.error("Autocomplete error:", error);
      return await interaction.respond([]);
    }
  }
}
