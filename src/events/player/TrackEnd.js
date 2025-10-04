import { Event } from "../../structures/index.js";
import { updateSetup } from "../../utils/SetupSystem.js";

/**
 * @extends {Event}
 */
export default class TrackEnd extends Event {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   * @param {string} file
   */
  constructor(client) {
    super(client, {
      name: "trackEnd",
    });
  }

  /**
   * @param {import('shoukaku').Player} player
   * @param {import('shoukaku').Track} _track
   * @param {any} _payload
   */
  async run(player, _track, _payload) {
    const guild = this.client.guilds.cache.get(player.guildId);
    if (!guild) return;

    await updateSetup(this.client, guild);

    // Update status when track ends
    this.client.utils.updateStatus(this.client, guild.id);

    const messageId = player.get("messageId");
    if (!messageId) return;

    const channel = guild.channels.cache.get(player.textChannelId);
    if (!channel) return;

    const message = await channel.messages.fetch(messageId).catch(() => null);
    if (!message) return;

    message.delete().catch(() => null);
  }
}
