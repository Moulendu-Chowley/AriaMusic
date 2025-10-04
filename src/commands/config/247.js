import { Command } from "../../structures/index.js";

/**
 * @extends {Command}
 */
export default class _247 extends Command {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "247",
      description: {
        content: "commands.247.description",
        examples: ["247"],
        usage: "247",
      },
      category: "config",
      aliases: ["stay"],
      cooldown: 3,
      args: false,
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
        ],
        user: ["ManageGuild"],
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
    const embed = this.client.embed();
    let player = client.manager.getPlayer(cnt.guild.id);

    try {
      const data = await client.db.get_247(cnt.guild.id);
      const member = cnt.member;

      if (!member?.voice?.channel) {
        return await cnt.sendMessage({
          embeds: [
            embed
              .setDescription(cnt.get("commands.247.errors.not_in_voice"))
              .setColor(client.color.red),
          ],
        });
      }

      if (data) {
        await client.db.delete_247(cnt.guild.id);
        return await cnt.sendMessage({
          embeds: [
            embed
              .setDescription(cnt.get("commands.247.messages.disabled"))
              .setColor(client.color.red),
          ],
        });
      }

      await client.db.set_247(
        cnt.guild.id,
        cnt.channel.id,
        member.voice.channel.id
      );

      if (!player) {
        player = client.manager.createPlayer({
          guildId: cnt.guild.id,
          voiceChannelId: member.voice.channel.id,
          textChannelId: cnt.channel.id,
          selfMute: false,
          selfDeaf: true,
          vcRegion: member.voice.channel.rtcRegion ?? undefined,
        });
      }

      if (!player.connected) await player.connect();

      return await cnt.sendMessage({
        embeds: [
          embed
            .setDescription(cnt.get("commands.247.messages.enabled"))
            .setColor(this.client.color.main),
        ],
      });
    } catch (error) {
      client.logger.error("Error in 247 command:", error);
      return await cnt.sendMessage({
        embeds: [
          embed
            .setDescription(cnt.get("commands.247.errors.generic"))
            .setColor(client.color.red),
        ],
      });
    }
  }
}
