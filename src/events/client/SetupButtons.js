import { Event } from "../../structures/index.js";
import { getButtons } from "../../utils/Buttons.js";
import { content } from "../../utils/ContentManager.js";
import { buttonReply } from "../../utils/SetupSystem.js";
import { checkDj } from "../player/TrackStart.js";

/**
 * Represents a setupButtons event.
 */
export default class SetupButtons extends Event {
  /**
   * @param {import('../../structures/AriaMusic').default} client The custom client instance.
   * @param {string} file The file name of the event.
   */
  constructor(client) {
    super(client, {
      name: "setupButtons",
    });
  }

  /**
   * Runs the event.
   * @param {import('discord.js').ButtonInteraction} interaction The button interaction.
   */
  async run(interaction) {
    if (!interaction.replied) await interaction.deferReply().catch(() => null);

    if (!interaction.member.voice.channel) {
      return await buttonReply(
        interaction,
        content.get("events.setupButton.no_voice_channel_button"),
        this.client.color.red
      );
    }

    const clientMember = interaction.guild.members.cache.get(
      this.client.user?.id
    );
    if (
      clientMember.voice.channel &&
      clientMember.voice.channelId !== interaction.member.voice.channelId
    ) {
      return await buttonReply(
        interaction,
        content.get("events.setupButton.different_voice_channel_button", {
          channel: clientMember.voice.channel,
        }),
        this.client.color.red
      );
    }

    const player = this.client.manager.getPlayer(interaction.guildId);
    if (!player) {
      return await buttonReply(
        interaction,
        content.get("events.setupButton.no_music_playing"),
        this.client.color.red
      );
    }
    if (!player.queue) {
      return await buttonReply(
        interaction,
        content.get("events.setupButton.no_music_playing"),
        this.client.color.red
      );
    }
    if (!player.queue.current) {
      return await buttonReply(
        interaction,
        content.get("events.setupButton.no_music_playing"),
        this.client.color.red
      );
    }

    const data = await this.client.db.getSetup(interaction.guildId);
    const { title, uri, duration, artworkUrl, sourceName, isStream } =
      player.queue.current.info;

    let message;
    try {
      message = await interaction.channel.messages.fetch(data?.messageId, {
        cache: true,
      });
    } catch (_e) {
      null;
    }

    const iconUrl =
      this.client.config.icons[sourceName] ||
      this.client.user?.displayAvatarURL({ extension: "png" });

    const embed = this.client
      .embed()
      .setAuthor({
        name: content.get("events.setupButton.now_playing"),
        iconURL: iconUrl,
      })
      .setColor(this.client.color.main)
      .setDescription(
        `[${title}](${uri}) - ${
          isStream
            ? content.get("events.setupButton.live")
            : this.client.utils.formatTime(duration)
        } - ${content.get("events.setupButton.requested_by", {
          requester: player.queue.current.requester.id,
        })}`
      )
      .setImage(
        artworkUrl || this.client.user?.displayAvatarURL({ extension: "png" })
      );

    if (!interaction.isButton()) return;

    if (!(await checkDj(this.client, interaction))) {
      return await buttonReply(
        interaction,
        content.get("events.setupButton.no_dj_permission"),
        this.client.color.red
      );
    }

    if (message) {
      const handleVolumeChange = async (change) => {
        const vol = player.volume + change;
        player.setVolume(vol);
        await buttonReply(
          interaction,
          content.get("events.setupButton.volume_set", { vol }),
          this.client.color.main
        );
        await message.edit({
          embeds: [
            embed.setFooter({
              text: content.get("events.setupButton.volume_footer", {
                vol,
                displayName: interaction.member.displayName,
              }),
              iconURL: interaction.member.displayAvatarURL({}),
            }),
          ],
        });
      };

      switch (interaction.customId) {
        case "PREV_BUT": {
          if (!player.queue.previous) {
            return await buttonReply(
              interaction,
              content.get("events.setupButton.no_previous_track"),
              this.client.color.main
            );
          }
          player.play({
            track: player.queue.previous[0],
          });
          await buttonReply(
            interaction,
            content.get("events.setupButton.playing_previous"),
            this.client.color.main
          );
          await message.edit({
            embeds: [
              embed.setFooter({
                text: content.get("events.setupButton.previous_footer", {
                  displayName: interaction.member.displayName,
                }),
                iconURL: interaction.member.displayAvatarURL({}),
              }),
            ],
          });
          break;
        }
        case "REWIND_BUT": {
          const time = player.position - 10000;
          if (time < 0) {
            player.seek(0);
          } else {
            player.seek(time);
          }
          await buttonReply(
            interaction,
            content.get("events.setupButton.rewinded"),
            this.client.color.main
          );
          await message.edit({
            embeds: [
              embed.setFooter({
                text: content.get("events.setupButton.rewind_footer", {
                  displayName: interaction.member.displayName,
                }),
                iconURL: interaction.member.displayAvatarURL({}),
              }),
            ],
          });
          break;
        }
        case "PAUSE_BUT": {
          const name = player.paused
            ? content.get("events.setupButton.resumed")
            : content.get("events.setupButton.paused");
          if (player.paused) {
            player.resume();
          } else {
            player.pause();
          }
          await buttonReply(
            interaction,
            content.get("events.setupButton.pause_resume", { name }),
            this.client.color.main
          );
          await message.edit({
            embeds: [
              embed.setFooter({
                text: content.get("events.setupButton.pause_resume_footer", {
                  name,
                  displayName: interaction.member.displayName,
                }),
                iconURL: interaction.member.displayAvatarURL({}),
              }),
            ],
            components: getButtons(player, this.client),
          });
          break;
        }
        case "FORWARD_BUT": {
          const time = player.position + 10000;
          if (time > player.queue.current.info.duration) {
            return await buttonReply(
              interaction,
              content.get("events.setupButton.forward_limit"),
              this.client.color.main
            );
          }
          player.seek(time);
          await buttonReply(
            interaction,
            content.get("events.setupButton.forwarded"),
            this.client.color.main
          );
          await message.edit({
            embeds: [
              embed.setFooter({
                text: content.get("events.setupButton.forward_footer", {
                  displayName: interaction.member.displayName,
                }),
                iconURL: interaction.member.displayAvatarURL({}),
              }),
            ],
          });
          break;
        }
        case "SKIP_BUT": {
          if (player.queue.tracks.length === 0) {
            return await buttonReply(
              interaction,
              content.get("events.setupButton.no_music_to_skip"),
              this.client.color.main
            );
          }
          player.skip();
          await buttonReply(
            interaction,
            content.get("events.setupButton.skipped"),
            this.client.color.main
          );
          const newTrack = player.queue.current?.info;
          const newEmbed = this.client
            .embed()
            .setAuthor({
              name: content.get("events.setupButton.now_playing"),
              iconURL:
                this.client.config.icons[newTrack?.sourceName || ""] ||
                this.client.user?.displayAvatarURL({ extension: "png" }),
            })
            .setColor(this.client.color.main)
            .setDescription(
              `[${newTrack?.title}](${newTrack?.uri}) - ${
                newTrack?.isStream
                  ? content.get("events.setupButton.live")
                  : this.client.utils.formatTime(newTrack?.duration)
              } - ${content.get("events.setupButton.requested_by", {
                requester: (player.queue.current?.requester).id,
              })}`
            )
            .setImage(
              newTrack?.artworkUrl ||
                this.client.user?.displayAvatarURL({ extension: "png" })
            );
          if (message) {
            await message.edit({
              embeds: [newEmbed],
              components: getButtons(player, this.client),
            });
          }
          break;
        }
        case "LOW_VOL_BUT":
          await handleVolumeChange(-10);
          break;
        case "LOOP_BUT": {
          const loopOptions = ["off", "queue", "track"];
          const newLoop =
            loopOptions[
              (loopOptions.indexOf(player.repeatMode) + 1) % loopOptions.length
            ];
          player.setRepeatMode(newLoop);
          await buttonReply(
            interaction,
            content.get("events.setupButton.loop_set", {
              loop: newLoop,
            }),
            this.client.color.main
          );
          await message.edit({
            embeds: [
              embed.setFooter({
                text: content.get("events.setupButton.loop_footer", {
                  loop: newLoop,
                  displayName: interaction.member.displayName,
                }),
                iconURL: interaction.member.displayAvatarURL({}),
              }),
            ],
          });
          break;
        }
        case "STOP_BUT": {
          player.stopPlaying(true, false);
          await buttonReply(
            interaction,
            content.get("events.setupButton.stopped"),
            this.client.color.main
          );
          await message.edit({
            embeds: [
              embed
                .setFooter({
                  text: content.get("events.setupButton.stopped_footer", {
                    displayName: interaction.member.displayName,
                  }),
                  iconURL: interaction.member.displayAvatarURL({}),
                })
                .setDescription(
                  content.get("events.setupButton.nothing_playing")
                )
                .setImage(this.client.config.links.img)
                .setAuthor({
                  name: this.client.user?.username,
                  iconURL: this.client.user?.displayAvatarURL({
                    extension: "png",
                  }),
                }),
            ],
          });
          break;
        }
        case "SHUFFLE_BUT": {
          player.queue.shuffle();
          await buttonReply(
            interaction,
            content.get("events.setupButton.shuffled"),
            this.client.color.main
          );
          break;
        }
        case "HIGH_VOL_BUT":
          await handleVolumeChange(10);
          break;
      }
    }
  }
}
