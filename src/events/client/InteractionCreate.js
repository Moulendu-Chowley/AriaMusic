import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Collection,
  EmbedBuilder,
  InteractionType,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import { Content, Event } from "../../structures/index.js";

/**
 * Represents an interactionCreate event.
 */
export default class InteractionCreate extends Event {
  /**
   * @param {import('../../structures/AriaMusic.js').default} client The custom client instance.
   * @param {string} file The file name of the event.
   */
  constructor(client) {
    super(client, {
      name: "interactionCreate",
    });
  }

  /**
   * Runs the event.
   * @param {import('discord.js').Interaction} interaction The interaction that was created.
   */
  async run(interaction) {
    if (!(interaction.guild && interaction.guildId)) return;

    if (
      interaction.type === InteractionType.ApplicationCommand &&
      interaction.isChatInputCommand()
    ) {
      const setup = await this.client.db.getSetup(interaction.guildId);
      const allowedCategories = ["filters", "music", "playlist"];
      const commandInSetup = this.client.commands.get(interaction.commandName);

      const cnt = new Content(interaction, [...interaction.options.data]);

      if (
        setup &&
        interaction.channelId === setup.textId &&
        !(commandInSetup && allowedCategories.includes(commandInSetup.category))
      ) {
        return await interaction.reply({
          content: cnt.get("events.interaction.setup_channel"),
          ephemeral: true,
        });
      }

      const { commandName } = interaction;
      await this.client.db.get(interaction.guildId);
      const command = this.client.commands.get(commandName);
      if (!command) return;

      const clientMember = interaction.guild.members.resolve(this.client.user);
      if (
        !(
          interaction.inGuild() &&
          interaction.channel
            ?.permissionsFor(clientMember)
            ?.has(PermissionFlagsBits.ViewChannel)
        )
      )
        return;

      if (
        !(
          clientMember.permissions.has(PermissionFlagsBits.ViewChannel) &&
          clientMember.permissions.has(PermissionFlagsBits.SendMessages) &&
          clientMember.permissions.has(PermissionFlagsBits.EmbedLinks) &&
          clientMember.permissions.has(PermissionFlagsBits.ReadMessageHistory)
        )
      ) {
        return await interaction.member
          .send({
            content: cnt.get("events.interaction.no_send_message"),
          })
          .catch(() => null);
      }

      const logs = this.client.channels.cache.get(
        this.client.env.LOG_COMMANDS_ID
      );

      if (command.permissions) {
        if (command.permissions?.client) {
          const clientRequiredPermissions = Array.isArray(
            command.permissions.client
          )
            ? command.permissions.client
            : [command.permissions.client];
          const missingClientPermissions = clientRequiredPermissions.filter(
            (perm) => !clientMember.permissions.has(perm)
          );
          if (missingClientPermissions.length > 0) {
            return await interaction.reply({
              content: cnt.get("events.interaction.no_permission", {
                permissions: missingClientPermissions
                  .map((perm) => `\`${perm}\``)
                  .join(", "),
              }),
              flags: MessageFlags.Ephemeral,
            });
          }
        }

        if (
          command.permissions?.user &&
          !interaction.member.permissions.has(command.permissions.user)
        ) {
          await interaction.reply({
            content: cnt.get("events.interaction.no_user_permission"),
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        if (command.permissions?.dev && this.client.env.OWNER_IDS) {
          const isDev = this.client.env.OWNER_IDS.includes(interaction.user.id);
          if (!isDev) return;
        }
      }

      if (command.vote && this.client.env.TOPGG) {
        const voted = await this.client.topGG.hasVoted(interaction.user.id);
        if (!voted) {
          const voteBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel(cnt.get("events.interaction.vote_button"))
              .setURL(`https://top.gg/bot/${this.client.user?.id}/vote`)
              .setStyle(ButtonStyle.Link)
          );
          return await interaction.reply({
            content: cnt.get("events.interaction.vote_message"),
            components: [voteBtn],
            flags: MessageFlags.Ephemeral,
          });
        }
      }

      if (command.player) {
        if (command.player.voice) {
          if (!interaction.member.voice.channel) {
            return await interaction.reply({
              content: cnt.get("events.interaction.no_voice_channel", {
                command: command.name,
              }),
            });
          }

          if (!clientMember.permissions.has(PermissionFlagsBits.Connect)) {
            return await interaction.reply({
              content: cnt.get("events.interaction.no_connect_permission", {
                command: command.name,
              }),
            });
          }

          if (!clientMember.permissions.has(PermissionFlagsBits.Speak)) {
            return await interaction.reply({
              content: cnt.get("events.interaction.no_speak_permission", {
                command: command.name,
              }),
            });
          }

          if (
            interaction.member.voice.channel?.type ===
              ChannelType.GuildStageVoice &&
            !clientMember.permissions.has(PermissionFlagsBits.RequestToSpeak)
          ) {
            return await interaction.reply({
              content: cnt.get("events.interaction.no_request_to_speak", {
                command: command.name,
              }),
            });
          }

          if (
            clientMember.voice.channel &&
            clientMember.voice.channelId !== interaction.member.voice.channelId
          ) {
            return await interaction.reply({
              content: cnt.get("events.interaction.different_voice_channel", {
                channel: `<#${clientMember.voice.channelId}>`,
                command: command.name,
              }),
            });
          }
        }

        if (command.player.active) {
          const queue = this.client.manager.getPlayer(interaction.guildId);
          if (!queue?.queue.current) {
            return await interaction.reply({
              content: cnt.get("events.interaction.no_music_playing"),
            });
          }
        }

        if (command.player.dj) {
          const dj = await this.client.db.getDj(interaction.guildId);
          if (dj?.mode) {
            const djRole = await this.client.db.getRoles(interaction.guildId);
            if (!djRole) {
              return await interaction.reply({
                content: cnt.get("events.interaction.no_dj_role"),
              });
            }
            const hasDJRole = interaction.member.roles.cache.some((role) =>
              djRole.map((r) => r.roleId).includes(role.id)
            );
            if (
              !(
                hasDJRole &&
                !interaction.member.permissions.has(
                  PermissionFlagsBits.ManageGuild
                )
              )
            ) {
              return await interaction.reply({
                content: cnt.get("events.interaction.no_dj_permission"),
                flags: MessageFlags.Ephemeral,
              });
            }
          }
        }
      }

      if (!this.client.cooldown.has(commandName)) {
        this.client.cooldown.set(commandName, new Collection());
      }

      const now = Date.now();
      const timestamps = this.client.cooldown.get(commandName);
      const cooldownAmount = (command.cooldown || 5) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime =
          timestamps.get(interaction.user.id) + cooldownAmount;
        const timeLeft = (expirationTime - now) / 1000;
        if (now < expirationTime && timeLeft > 0.9) {
          return await interaction.reply({
            content: cnt.get("events.interaction.cooldown", {
              time: timeLeft.toFixed(1),
              command: commandName,
            }),
          });
        }
        timestamps.set(interaction.user.id, now);
        setTimeout(
          () => timestamps.delete(interaction.user.id),
          cooldownAmount
        );
      } else {
        timestamps.set(interaction.user.id, now);
        setTimeout(
          () => timestamps.delete(interaction.user.id),
          cooldownAmount
        );
      }

      try {
        await command.run(this.client, cnt);
        if (
          setup &&
          interaction.channelId === setup.textId &&
          allowedCategories.includes(command.category)
        ) {
          setTimeout(() => {
            interaction.deleteReply().catch(() => null);
          }, 5000);
        }
        if (logs) {
          const embed = new EmbedBuilder()
            .setAuthor({
              name: "Slash - Command Logs",
              iconURL: this.client.user?.avatarURL({ size: 2048 }),
            })
            .setColor(this.client.config.color.blue)
            .addFields(
              { name: "Command", value: `\`${command.name}\``, inline: true },
              {
                name: "User",
                value: `${interaction.user.tag} (\`${interaction.user.id}\`)
`,
                inline: true,
              },
              {
                name: "Guild",
                value: `${interaction.guild.name} (\`${interaction.guild.id}\`)
`,
                inline: true,
              }
            )
            .setTimestamp();
          await logs.send({ embeds: [embed] });
        }
      } catch (error) {
        this.client.logger.error(error);
        const reply = {
          content: cnt.get("events.interaction.error", { error }),
          flags: MessageFlags.Ephemeral,
        };
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply(reply);
        } else {
          await interaction.reply(reply);
        }
      }
    } else if (
      interaction.type === InteractionType.ApplicationCommandAutocomplete
    ) {
      const command = this.client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        this.client.logger.error(error);
      }
    }
  }
}
