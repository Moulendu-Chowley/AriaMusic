import { Events } from "discord.js";
import { AutoPoster } from "topgg-autoposter";
import { env } from "../../env.js";
import { Event } from "../../structures/index.js";
import Utils from "../../utils/Utils.js";

/**
 * Represents a clientReady event.
 */
export default class Ready extends Event {
  /**
   * @param {import('../../structures/AriaMusic').default} client The custom client instance.
   * @param {string} file The file name of the event.
   */
  constructor(client) {
    super(client, {
      name: Events.ClientReady,
    });
  }

  /**
   * Runs the event.
   */
  async run() {
    this.client.logger.success(`${this.client.user?.tag} is ready!`);

    // Update bot status with rotation
    Utils.updateStatus(this.client, this.client.env.GUILD_ID);

    // Start rotating activity status
    this.startRotatingActivity();

    // Initialize remaining services
    await this.initializeServices();
  }

  /**
   * Start rotating activity status every 5 seconds
   */
  startRotatingActivity() {
    // Initialize default activities
    this.client.originalActivities = [
      {
        name: "Music",
        type: 1, // Streaming
      },
      {
        name: `Over ${this.client.guilds.cache.size} Servers`,
        type: 3, // Watching
      },
      {
        name: `Vibes In ${this.getTotalPlayers()} Zones!`,
        type: 0, // Playing
      },
      {
        name: `${this.client.guilds.cache.reduce(
          (acc, guild) => acc + guild.memberCount,
          0
        )} Users`,
        type: 2, // Listening to
      },
    ];

    // Set current activities (will be modified by Utils.js when music plays)
    this.client.currentActivities = [...this.client.originalActivities];
    this.client.currentSongInRotation = false;

    let currentIndex = 0;

    // Set initial activity
    this.updateActivity(this.client.currentActivities[currentIndex]);

    // Rotate activities every 10 seconds
    this.client.activityRotationInterval = setInterval(() => {
      // Use current activities (which may include current song)
      const activities =
        this.client.currentActivities || this.client.originalActivities;

      currentIndex = (currentIndex + 1) % activities.length;

      // Update dynamic values in original activities
      if (this.client.originalActivities) {
        this.client.originalActivities[1].name = `Over ${this.client.guilds.cache.size} Servers`;
        this.client.originalActivities[2].name = `${this.getTotalPlayers()} Musics`;
        this.client.originalActivities[3].name = `${this.client.guilds.cache.reduce(
          (acc, guild) => acc + guild.memberCount,
          0
        )} Users`;

        // Update current activities if no song is playing
        if (!this.client.currentSongInRotation) {
          this.client.currentActivities = [...this.client.originalActivities];
        } else {
          // Update only the non-song activities (indices 1, 2, 3), keep index 0 for song
          for (let i = 1; i < this.client.originalActivities.length; i++) {
            this.client.currentActivities[i] = {
              ...this.client.originalActivities[i],
            };
          }
        }
      }

      this.updateActivity(activities[currentIndex]);
    }, 5000); // 5 seconds
  }

  /**
   * Update bot activity
   * @param {Object} activity The activity object
   */
  updateActivity(activity) {
    // Check if client is ready and connected before updating presence
    if (!this.client || !this.client.user || !this.client.isReady()) {
      return;
    }

    try {
      this.client.user.setPresence({
        activities: [activity],
        status: env.BOT_STATUS,
      });
    } catch (error) {
      // Silently handle shard errors during restart/shutdown
      if (
        error.message?.includes("Shard") ||
        error.message?.includes("not found")
      ) {
        console.log("[ACTIVITY] Skipping activity update - bot is restarting");
        return;
      }
      console.error("[ACTIVITY] Error updating activity:", error);
    }
  }

  /**
   * Get total number of active players
   * @returns {number} Number of active players
   */
  getTotalPlayers() {
    return this.client.manager?.players?.size || 0;
  }

  /**
   * Initialize remaining services
   */
  async initializeServices() {
    if (env.TOPGG) {
      const autoPoster = AutoPoster(env.TOPGG, this.client);
      setInterval(() => {
        autoPoster.on("posted", (_stats) => {
          this.client.logger.info("Successfully posted stats to Top.gg!");
        });
      }, 86400000);
    } else {
      this.client.logger.warn("Top.gg token not found. Skipping auto poster.");
    }

    await this.client.manager.init({ ...this.client.user, shards: "auto" });
  }
}
