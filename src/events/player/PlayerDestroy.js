import { Event } from "../../structures/index.js";
import { updateSetup } from "../../utils/SetupSystem.js";

/**
 * Represents a playerDestroy event.
 */
export default class PlayerDestroy extends Event {
  /**
   * @param {import('../../structures/AriaMusic').default} client The custom client instance.
   */
  constructor(client) {
    super(client, {
      name: "playerDestroy",
    });
  }

  /**
   * Runs the event.
   * @param {import('lavalink-client').Player} player The player that was destroyed.
   * @param {string} _reason The reason why the player was destroyed.
   */
  async run(player, _reason) {
    const guild = this.client.guilds.cache.get(player.guildId);
    if (!guild) return;

    await updateSetup(this.client, guild);

    const voiceChannelId =
      player.voiceChannelId ?? player.options.voiceChannelId;
    if (voiceChannelId) {
      await this.client.utils.setVoiceStatus(this.client, voiceChannelId, "");
    }

    const messageId = player.get("messageId");
    if (!messageId) return;

    const channel = guild.channels.cache.get(player.textChannelId);
    if (!channel) return;

    const message = await channel.messages.fetch(messageId).catch(() => null);
    if (!message) return;

    if (message.editable) {
      await message.edit({ components: [] }).catch(() => null);
    }
  }
}
