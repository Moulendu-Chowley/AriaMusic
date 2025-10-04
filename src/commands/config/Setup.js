import { ChannelType, OverwriteType, PermissionFlagsBits } from "discord.js";
import { Command } from "../../structures/index.js";
import { getButtons } from "../../utils/Buttons.js";

/**
 * @extends {Command}
 */
export default class Setup extends Command {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "setup",
      description: {
        content: "commands.setup.description",
        examples: ["setup create", "setup delete", "setup info"],
        usage: "setup",
      },
      category: "config",
      aliases: ["set"],
      cooldown: 3,
      args: true,
      vote: true,
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
          "ManageChannels",
        ],
        user: ["ManageGuild"],
      },
      slashCommand: true,
      options: [
        {
          name: "create",
          description: "commands.setup.options.create",
          type: 1,
        },
        {
          name: "delete",
          description: "commands.setup.options.delete",
          type: 1,
        },
        {
          name: "info",
          description: "commands.setup.options.info",
          type: 1,
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
    const subCommand = cnt.isInteraction
      ? cnt.options.getSubCommand()
      : args[0];
    const embed = client.embed().setColor(this.client.color.main);

    switch (subCommand) {
      case "create": {
        const data = await client.db.getSetup(cnt.guild.id);
        if (data?.textId && data.messageId) {
          return await cnt.sendMessage({
            embeds: [
              {
                description: cnt.get("commands.setup.errors.channel_exists"),
                color: client.color.red,
              },
            ],
          });
        }

        const textChannel = await cnt.guild.channels.create({
          name: `${client.user?.username}-song-requests`,
          type: ChannelType.GuildText,
          topic: "Song requests for the music bot.",
          permissionOverwrites: [
            {
              type: OverwriteType.Member,
              id: client.user?.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
            {
              type: OverwriteType.Role,
              id: cnt.guild.roles.everyone.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
          ],
        });

        const player = this.client.manager.getPlayer(cnt.guild.id);
        const image = this.client.config.links.img;
        const desc = player?.queue.current
          ? `[${player.queue.current.info.title}](${player.queue.current.info.uri})`
          : cnt.get("player.setupStart.nothing_playing");

        embed.setDescription(desc).setImage(image);

        await textChannel
          .send({
            embeds: [embed],
            components: getButtons(player, client),
          })
          .then((msg) => {
            client.db.setSetup(cnt.guild.id, textChannel.id, msg.id);
          });

        await cnt.sendMessage({
          embeds: [
            {
              description: cnt.get("commands.setup.messages.channel_created", {
                channelId: textChannel.id,
              }),
              color: this.client.color.main,
            },
          ],
        });
        break;
      }
      case "delete": {
        const data2 = await client.db.getSetup(cnt.guild.id);
        if (!data2) {
          return await cnt.sendMessage({
            embeds: [
              {
                description: cnt.get(
                  "commands.setup.errors.channel_not_exists"
                ),
                color: client.color.red,
              },
            ],
          });
        }

        client.db.deleteSetup(cnt.guild.id);
        const textChannel = cnt.guild.channels.cache.get(data2.textId);
        if (textChannel)
          await textChannel.delete().catch(() => {
            null;
          });

        await cnt.sendMessage({
          embeds: [
            {
              description: cnt.get("commands.setup.messages.channel_deleted"),
              color: this.client.color.main,
            },
          ],
        });
        break;
      }
      case "info": {
        const data3 = await client.db.getSetup(cnt.guild.id);
        if (!data3) {
          return await cnt.sendMessage({
            embeds: [
              {
                description: cnt.get(
                  "commands.setup.errors.channel_not_exists"
                ),
                color: client.color.red,
              },
            ],
          });
        }

        const channel = cnt.guild.channels.cache.get(data3.textId);
        if (channel) {
          embed.setDescription(
            cnt.get("commands.setup.messages.channel_info", {
              channelId: channel.id,
            })
          );
          await cnt.sendMessage({ embeds: [embed] });
        } else {
          await cnt.sendMessage({
            embeds: [
              {
                description: cnt.get(
                  "commands.setup.errors.channel_not_exists"
                ),
                color: client.color.red,
              },
            ],
          });
        }
        break;
      }
      default:
        break;
    }
  }
}
