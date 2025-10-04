/**
 * @type {import('../../types.js').Plugin}
 */
const antiCrash = {
  name: "AntiCrash Plugin",
  version: "1.1.0",
  author: "Appu",
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  initialize: (client) => {
    let isShuttingDown = false;

    const handleExit = async (signal = "UNKNOWN") => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      client.logger.star(`Received ${signal}, initiating graceful shutdown...`);

      try {
        // Cleanup music players and Lavalink connections
        if (client.manager) {
          client.logger.info("Destroying all music players...");

          // Destroy all active players
          if (client.manager.players && client.manager.players.size > 0) {
            for (const [guildId, player] of client.manager.players) {
              try {
                player.destroy();
                client.logger.info(`Destroyed player for guild: ${guildId}`);
              } catch (error) {
                client.logger.error(
                  `Failed to destroy player for guild ${guildId}: ${error.message}`
                );
              }
            }
          }

          // Clean up manager listeners
          if (typeof client.manager.removeAllListeners === "function") {
            client.manager.removeAllListeners();
          }
        }

        // Disconnect from Discord
        client.logger.info("Disconnecting from Discord...");
        await Promise.race([
          client.destroy(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 5000)
          ),
        ]);

        client.logger.success("Successfully disconnected from Discord!");
        process.exit(0);
      } catch (error) {
        client.logger.error("Error during shutdown:", error);
        process.exit(1);
      }
    };

    process.on("unhandledRejection", (reason, promise) => {
      client.logger.error(
        "Unhandled Rejection at:",
        promise,
        "reason:",
        reason
      );

      // Don't exit immediately, but log the stack trace if available
      if (reason && reason.stack) {
        client.logger.error("Stack trace:", reason.stack);
      }
    });

    process.on("uncaughtException", async (err) => {
      client.logger.error("Uncaught Exception thrown:", err);

      // For critical errors, attempt graceful shutdown
      if (err.name === "Error" || err.name === "TypeError") {
        client.logger.error(
          "Critical error detected, initiating emergency shutdown..."
        );
        await handleExit("UNCAUGHT_EXCEPTION");
      }
    });

    process.on("SIGINT", () => handleExit("SIGINT"));
    process.on("SIGTERM", () => handleExit("SIGTERM"));
    process.on("SIGQUIT", () => handleExit("SIGQUIT"));

    // Handle Windows-specific signals
    process.on("SIGBREAK", () => handleExit("SIGBREAK"));
  },
};

export default antiCrash;
