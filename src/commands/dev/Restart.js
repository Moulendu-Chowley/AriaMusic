import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { spawn } from "node:child_process";
import { Command } from "../../structures/index.js";

/**
 * Restart Command - Intelligently restarts the bot based on environment
 *
 * Environment Detection:
 * - Pterodactyl/Container: Performs graceful exit (panel handles restart)
 * - Local/VPS: Spawns new process before exiting
 *
 * To force Pterodactyl mode, set PTERODACTYL=true in your .env file
 *
 * @extends {Command}
 */
export default class Restart extends Command {
  /**
   * @param {import('../../structures/AriaMusic.js').AriaMusic} client
   */
  constructor(client) {
    super(client, {
      name: "restart",
      description: {
        content: "Restart the bot",
        examples: ["restart"],
        usage: "restart",
      },
      category: "dev",
      aliases: ["reboot"],
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
   */
  async run(client, cnt) {
    const embed = this.client.embed();
    const button = new ButtonBuilder()
      .setStyle(ButtonStyle.Danger)
      .setLabel("Confirm Restart")
      .setCustomId("confirm-restart");

    const row = new ActionRowBuilder().addComponents(button);

    const restartEmbed = embed
      .setColor(this.client.color.red)
      .setDescription(
        `**Are you sure you want to restart **\`${client.user?.username}\`?`
      )
      .setTimestamp();

    const msg = await cnt.sendMessage({
      embeds: [restartEmbed],
      components: [row],
    });

    const filter = (i) =>
      i.customId === "confirm-restart" && i.user.id === cnt.author?.id;
    const collector = msg.createMessageComponentCollector({
      time: 30000,
      filter,
    });

    collector.on("collect", async (i) => {
      await i.deferUpdate();

      // Detect environment type for appropriate restart message
      const isPterodactyl =
        client.env.PTERODACTYL ||
        process.env.P_SERVER_UUID ||
        process.env.PTERODACTYL_UUID ||
        process.env.SERVER_UUID ||
        process.env.CONTAINER_ID ||
        process.argv.includes("--pterodactyl");

      const restartMessage = isPterodactyl
        ? "🔄 Restarting bot... Pterodactyl will automatically restart the process."
        : "🔄 Restarting bot... Spawning new process.";

      await msg.edit({
        content: restartMessage,
        embeds: [],
        components: [],
      });
      try {
        // Perform comprehensive cleanup
        console.log("[RESTART] Performing cleanup...");
        await client.cleanup();

        // Destroy the client
        console.log("[RESTART] Destroying client...");
        await client.destroy();

        // Wait longer for complete cleanup and to avoid port conflicts
        console.log("[RESTART] Waiting for complete cleanup...");
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Check if running on Pterodactyl or similar container/panel environment
        const isPterodactyl =
          client.env.PTERODACTYL ||
          process.env.P_SERVER_UUID ||
          process.env.PTERODACTYL_UUID ||
          process.env.SERVER_UUID ||
          process.env.CONTAINER_ID ||
          process.argv.includes("--pterodactyl");

        if (isPterodactyl) {
          console.log(
            "[RESTART] Detected Pterodactyl/container environment - performing graceful exit..."
          );
          console.log(
            "[RESTART] Pterodactyl will automatically restart the bot."
          );

          // In Pterodactyl/container environments, just exit gracefully
          // The panel will automatically restart the process
          process.exit(0);
        } else {
          console.log(
            "[RESTART] Detected local environment - spawning new process..."
          );

          // Determine startup method based on environment
          const useBuiltVersion =
            client.env.PTERODACTYL || process.env.NODE_ENV === "production";
          const spawnOptions = {
            detached: true,
            stdio: "ignore",
            cwd: process.cwd(),
            windowsHide: true, // Hide terminal window on Windows
            shell: false, // Don't use shell to avoid visible terminals
          };

          let child;

          if (useBuiltVersion) {
            console.log(
              "[RESTART] Using optimized build for production environment..."
            );

            // Check if dist/index.js exists, if not, try to build it
            const { existsSync } = await import("node:fs");
            const { join } = await import("node:path");
            const distPath = join(process.cwd(), "dist", "index.js");

            if (!existsSync(distPath)) {
              console.log(
                "[RESTART] Build not found, creating optimized build first..."
              );
              try {
                // Build first using npm run build
                const npmCommand =
                  process.platform === "win32" ? "npm.cmd" : "npm";
                await new Promise((resolve, reject) => {
                  const buildProcess = spawn(npmCommand, ["run", "build"], {
                    stdio: "pipe",
                    cwd: process.cwd(),
                  });
                  buildProcess.on("close", (code) => {
                    if (code === 0) resolve();
                    else reject(new Error(`Build failed with code ${code}`));
                  });
                });
                console.log("[RESTART] Build completed successfully!");
              } catch (buildError) {
                console.error("[RESTART] Build failed:", buildError);
                console.log("[RESTART] Falling back to source version...");
              }
            }

            // Start with built version if available, otherwise fallback to source
            if (existsSync(distPath)) {
              console.log(
                "[RESTART] Starting optimized build from dist/index.js..."
              );
              child = spawn("node", ["dist/index.js"], {
                ...spawnOptions,
                env: { ...process.env },
              });
            } else {
              console.log(
                "[RESTART] Build not available, using source version..."
              );
              child = spawn("node", ["src/index.js"], {
                ...spawnOptions,
                env: { ...process.env },
              });
            }
          } else {
            console.log(
              "[RESTART] Using development mode with source files..."
            );

            // Development mode - try npm first, fallback to direct node execution
            try {
              const npmCommand =
                process.platform === "win32" ? "npm.cmd" : "npm";
              child = spawn(npmCommand, ["run", "start"], spawnOptions);
            } catch (npmError) {
              console.log(
                "[RESTART] npm failed, trying direct node execution..."
              );
              // Fallback: run directly with node (assumes .env is set up properly)
              child = spawn("node", ["src/index.js"], {
                ...spawnOptions,
                env: { ...process.env },
              });
            }
          }
          child.unref();

          // Force exit current process
          setTimeout(() => {
            process.exit(0);
          }, 1000);
        }
      } catch (error) {
        console.error("[RESTART ERROR]:", error);
        await msg.edit({
          content: "An error occurred while restarting the bot.",
          components: [],
        });
      }
    });

    collector.on("end", async () => {
      if (collector.collected.size === 0) {
        await msg.edit({
          content: "Restart cancelled.",
          components: [],
        });
      }
    });
  }
}
