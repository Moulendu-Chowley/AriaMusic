import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { Command } from "../../structures/index.js";

const TRACKS_PER_PAGE = 5;

/**
 * @extends Command
 */
export default class Search extends Command {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "search",
      description: {
        content: "commands.search.description",
        examples: ["search example"],
        usage: "search <song>",
      },
      category: "music",
      aliases: ["sc"],
      cooldown: 3,
      args: true,
      vote: true,
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
          "AttachFiles",
        ],
        user: [],
      },
      slashCommand: true,
      options: [
        {
          name: "song",
          description: "commands.search.options.song",
          type: 3,
          required: true,
        },
      ],
    });
  }

  /**
   * @param {import('lavalink-client').Track} track
   * @param {number} index
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   * @returns {string}
   */
  formatTrackDisplay(track, index, client) {
    return (
      `**${index + 1}. [${client.utils.escapeMarkdown(track.info.title)}](${
        track.info.uri
      })**
` +
      `*${track.info.author || "Unknown Artist"}*
` +
      `
${track.info.duration ? client.utils.formatTime(track.info.duration) : "N/A"}
`
    );
  }

  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   * @param {import('../../structures/Content.js').Content} cnt
   * @param {import('lavalink-client').Track[]} tracks
   * @param {number} currentPage
   * @param {number} maxPages
   * @param {boolean} isDisabled
   * @returns {{components: (ContainerBuilder | ActionRowBuilder)[], flags: number}}
   */
  generatePageComponents(
    client,
    cnt,
    tracks,
    currentPage,
    maxPages,
    isDisabled = false
  ) {
    const startIndex = currentPage * TRACKS_PER_PAGE;
    const endIndex = startIndex + TRACKS_PER_PAGE;
    const tracksOnPage = tracks.slice(
      startIndex,
      Math.min(endIndex, tracks.length)
    );

    const resultsContainer = new ContainerBuilder()
      .setAccentColor(client.color.main)
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(
          `**${cnt.get("commands.search.messages.results_found", {
            count: tracks.length,
          })}**
*${cnt.get("commands.search.messages.select_prompt")}*` +
            `

**${cnt.get("commands.search.messages.page_info", {
              currentPage: currentPage + 1,
              maxPages: maxPages,
            })}**`
        )
      );

    tracksOnPage.forEach((track, index) => {
      const globalIndex = startIndex + index;
      const section = new SectionBuilder().addTextDisplayComponents(
        (textDisplay) =>
          textDisplay.setContent(
            this.formatTrackDisplay(track, globalIndex, client)
          )
      );
      if (track.info.artworkUrl) {
        section.setThumbnailAccessory((thumbnail) =>
          thumbnail
            .setURL(track.info.artworkUrl)
            .setDescription(`Artwork for ${track.info.title}`)
        );
      }
      resultsContainer.addSectionComponents(section);
    });

    if (tracksOnPage.length > 0) {
      resultsContainer.addSeparatorComponents(new SeparatorBuilder());
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select-track")
      .setPlaceholder(cnt.get("commands.search.select"))
      .addOptions(
        tracksOnPage.map((track, index) => ({
          label: `${startIndex + index + 1}. ${track.info.title.slice(0, 50)}${
            track.info.title.length > 50 ? "..." : ""
          }`,
          description: (track.info.author || "Unknown Artist").slice(0, 100),
          value: (startIndex + index).toString(),
        }))
      )
      .setDisabled(isDisabled);

    const selectRow = new ActionRowBuilder().addComponents(selectMenu);

    const previousButton = new ButtonBuilder()
      .setCustomId("previous-page")
      .setLabel(cnt.get("buttons.previous"))
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 0 || isDisabled);

    const nextButton = new ButtonBuilder()
      .setCustomId("next-page")
      .setLabel(cnt.get("buttons.next"))
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === maxPages - 1 || isDisabled);

    const buttonRow = new ActionRowBuilder().addComponents(
      previousButton,
      nextButton
    );

    return {
      components: [resultsContainer, selectRow, buttonRow],
      flags: MessageFlags.IsComponentsV2,
    };
  }

  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   * @param {import('../../structures/Content.js').Content} cnt
   * @param {string[]} args
   */
  async run(client, cnt, args) {
    const query = args.join(" ");
    const memberVoiceChannel = cnt.member.voice.channel;
    let player = client.manager.getPlayer(cnt.guild.id);

    if (!player) {
      player = client.manager.createPlayer({
        guildId: cnt.guild.id,
        voiceChannelId: memberVoiceChannel.id,
        textChannelId: cnt.channel.id,
        selfMute: false,
        selfDeaf: true,
        vcRegion: memberVoiceChannel.rtcRegion,
      });
    }

    if (!player.connected) {
      try {
        await player.connect();
      } catch (error) {
        console.error("Failed to connect to voice channel:", error);
        await player.destroy();
        const connectErrorContainer = new ContainerBuilder()
          .setAccentColor(this.client.color.red)
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(
              `**${cnt.get("commands.search.errors.vc_connect_fail_title")}**
${cnt.get("commands.search.errors.vc_connect_fail_description")}`
            )
          );
        return await cnt.sendMessage({
          components: [connectErrorContainer],
          flags: MessageFlags.IsComponentsV2,
        });
      }
    }

    const response = await player.search({ query: query }, cnt.author);

    if (!response || response.tracks?.length === 0) {
      const noResultsContainer = new ContainerBuilder()
        .setAccentColor(this.client.color.red)
        .addTextDisplayComponents((textDisplay) =>
          textDisplay.setContent(
            `**${cnt.get("commands.search.errors.no_results_title")}**

${cnt.get("commands.search.errors.no_results_description")}`
          )
        );
      return await cnt.sendMessage({
        components: [noResultsContainer],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    let currentPage = 0;
    const maxPages = Math.ceil(response.tracks.length / TRACKS_PER_PAGE);
    const initialComponents = this.generatePageComponents(
      client,
      cnt,
      response.tracks,
      currentPage,
      maxPages
    );

    const sentMessage = await cnt.sendMessage(initialComponents);

    const collector = sentMessage.createMessageComponentCollector({
      filter: (f) => f.user.id === cnt.author?.id,
      time: 120000,
      idle: 60000,
    });

    collector.on("collect", async (int) => {
      if (int.customId === "select-track") {
        const selectedIndex = Number.parseInt(int.values[0]);
        const track = response.tracks[selectedIndex];
        await int.deferUpdate();

        if (!track) {
          const errorContainer = new ContainerBuilder()
            .setAccentColor(this.client.color.red)
            .addTextDisplayComponents((textDisplay) =>
              textDisplay.setContent(
                `**${cnt.get(
                  "commands.search.errors.invalid_selection_title"
                )}**
${cnt.get("commands.search.errors.invalid_selection_description")}`
              )
            );
          return await int.sendMessage({
            components: [errorContainer],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
          });
        }

        player.queue.add(track);
        if (!player.playing && player.queue.tracks.length > 0)
          await player.play({ paused: false });

        const confirmationContainer = new ContainerBuilder()
          .setAccentColor(this.client.color.green)
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(
              cnt.get("commands.search.messages.added_to_queue", {
                title: track.info.title,
                uri: track.info.uri,
              })
            )
          );

        const disabledComponents = this.generatePageComponents(
          client,
          cnt,
          response.tracks,
          currentPage,
          maxPages,
          true
        );

        await cnt.editMessage(
          filterFlagsForEditMessage({
            components: [
              confirmationContainer,
              ...disabledComponents.components.slice(1),
            ],
            flags: MessageFlags.IsComponentsV2,
          })
        );
        collector.stop("trackSelected");
      } else if (int.customId === "previous-page") {
        if (currentPage > 0) {
          currentPage--;
          await int.deferUpdate();
          const newComponents = this.generatePageComponents(
            client,
            cnt,
            response.tracks,
            currentPage,
            maxPages
          );
          await cnt.editMessage(filterFlagsForEditMessage(newComponents));
        } else {
          await int.deferUpdate();
        }
      } else if (int.customId === "next-page") {
        if (currentPage < maxPages - 1) {
          currentPage++;
          await int.deferUpdate();
          const newComponents = this.generatePageComponents(
            client,
            cnt,
            response.tracks,
            currentPage,
            maxPages
          );
          const newComponentsFiltered =
            filterFlagsForEditMessage(newComponents);
          await cnt.editMessage(newComponentsFiltered);
        } else {
          await int.deferUpdate();
        }
      }
      collector.resetTimer();
    });

    collector.on("end", async (_collected, reason) => {
      if (reason === "time" || reason === "idle") {
        try {
          const timeoutContainer = new ContainerBuilder()
            .setAccentColor(this.client.color.red)
            .addTextDisplayComponents((textDisplay) =>
              textDisplay.setContent(
                `**${cnt.get(
                  "commands.search.messages.selection_timed_out_title"
                )}**
${cnt.get("commands.search.messages.selection_timed_out_description")}`
              )
            );
          await cnt.editMessage(
            filterFlagsForEditMessage({
              components: [timeoutContainer],
              flags: MessageFlags.IsComponentsV2,
            })
          );
        } catch (error) {
          console.error("Failed to edit message on collector timeout:", error);
          const fallbackTimeoutContainer = new ContainerBuilder()
            .setAccentColor(this.client.color.red)
            .addTextDisplayComponents((textDisplay) =>
              textDisplay.setContent(
                cnt.get("commands.search.messages.selection_timed_out_short")
              )
            );
          await cnt.sendMessage({
            components: [fallbackTimeoutContainer],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
          });
        }
      } else if (reason === "trackSelected") {
        // Do nothing
      }
    });
  }
}

/**
 * @param {{components: (ContainerBuilder | ActionRowBuilder)[], flags: number}}
 * @returns {{components: (ContainerBuilder | ActionRowBuilder)[]}}
 */
function filterFlagsForEditMessage(options) {
  const { flags, ...rest } = options;
  return rest;
}
