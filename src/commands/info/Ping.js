import { Command } from "../../structures/index.js";

/**
 * @extends Command
 */
export default class Ping extends Command {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "ping",
      description: {
        content: "commands.ping.description",
        examples: ["ping"],
        usage: "ping",
      },
      category: "general",
      aliases: ["pong"],
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
    const startTime = Date.now();
    await cnt.sendDeferMessage(cnt.get("commands.ping.content"));
    const botLatency = Date.now() - startTime;
    const apiLatency = Math.round(cnt.client.ws.ping);

    const embed = this.client
      .embed()
      .setAuthor({
        name: "Pong!",
        iconURL: client.user?.displayAvatarURL(),
      })
      .setColor(this.client.color.main)
      .addFields([
        {
          name: cnt.get("commands.ping.bot_latency"),
          value: `**${botLatency}ms**`,
          inline: true,
        },
        {
          name: cnt.get("commands.ping.api_latency"),
          value: `**${apiLatency}ms**`,
          inline: true,
        },
      ])
      .setFooter({
        text: cnt.get("commands.ping.requested_by", {
          author: cnt.author?.tag,
        }),
        iconURL: cnt.author?.displayAvatarURL({}),
      })
      .setTimestamp();

    return await cnt.editMessage({ content: "", embeds: [embed] });
  }
}
