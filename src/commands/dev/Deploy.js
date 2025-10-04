import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags,
} from "discord.js";
import { Command } from "../../structures/index.js";

/**
 * @extends {Command}
 */
export default class Deploy extends Command {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "deploy",
      description: {
        content: "Deploy commands",
        examples: ["deploy"],
        usage: "deploy",
      },
      category: "dev",
      aliases: ["deploy-commands"],
      cooldown: 3,
      args: false,
      player: {
        voice: false,
        dj: false,
        active: false,
        djPerm: null,
      },
      permissions: {
        dev: true,
        client: [
          "SendMessages",
          "ReadMessageHistory",
          "ViewChannel",
          "EmbedLinks",
        ],
        user: [],
      },
      slashCommand: false,
      options: [],
    });
  }

  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   * @param {import('../../structures/Content.js').Content} cnt
   * @param {string[]} _args
   */
  async run(client, cnt, _args) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("deploy-global")
        .setLabel("Deploy Global")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("deploy-guild")
        .setLabel("Deploy Guild")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("clear-global")
        .setLabel("Clear Global")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("clear-guild")
        .setLabel("Clear Guild")
        .setStyle(ButtonStyle.Secondary)
    );

    let msg;
    try {
      msg = await cnt.sendMessage({
        content:
          "🚀 **Command Management**\n\n**Deploy:** Register slash commands\n**Clear:** Remove all slash commands\n\nChoose your action:",
        components: [row],
      });
    } catch (error) {
      client.logger.error("Failed to send the initial message:", error);
      return;
    }

    const filter = (interaction) => {
      if (interaction.user.id !== cnt.author?.id) {
        interaction
          .reply({
            content: "You can't interact with this message",
            flags: MessageFlags.Ephemeral,
          })
          .catch(client.logger.error);
        return false;
      }
      return true;
    };

    const collector = msg.createMessageComponentCollector({
      filter: (interaction) => {
        if (interaction.message.id !== msg.id) return false;
        return filter(interaction);
      },
      componentType: ComponentType.Button,
      time: 30000,
    });

    collector.on("collect", async (interaction) => {
      try {
        await interaction.deferUpdate();

        if (interaction.customId === "deploy-global") {
          await client.deployCommands();
          await cnt.editMessage({
            content:
              "✅ **Commands deployed globally!**\n\nAll slash commands have been registered worldwide.",
            components: [],
          });
        } else if (interaction.customId === "deploy-guild") {
          await client.deployCommands(interaction.guild.id);
          await cnt.editMessage({
            content:
              "✅ **Commands deployed to this guild!**\n\nSlash commands are now available in this server.",
            components: [],
          });
        } else if (interaction.customId === "clear-global") {
          await client.clearCommands();
          await cnt.editMessage({
            content:
              "🗑️ **Global commands cleared!**\n\nAll slash commands have been removed worldwide.",
            components: [],
          });
        } else if (interaction.customId === "clear-guild") {
          await client.clearCommands(interaction.guild.id);
          await cnt.editMessage({
            content:
              "🗑️ **Guild commands cleared!**\n\nAll slash commands have been removed from this server.",
            components: [],
          });
        }
      } catch (error) {
        client.logger.error("Failed to handle interaction:", error);
        await cnt.editMessage({
          content:
            "❌ **Error occurred!**\n\nFailed to execute the command. Check console for details.",
          components: [],
        });
      }
    });

    collector.on("end", async (_collected, reason) => {
      if (reason === "time" && msg) {
        try {
          await msg.delete();
        } catch (error) {
          client.logger.error("Failed to delete the message:", error);
        }
      }
    });
  }
}
