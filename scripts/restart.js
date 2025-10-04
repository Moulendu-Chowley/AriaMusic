import { spawn } from "node:child_process";

async function startAriaMusic() {
  try {
    const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
    const spawnOptions = {
      stdio: "ignore", // Don't inherit stdio to avoid terminal windows
      shell: false, // Don't use shell to avoid visible terminals
      detached: true,
      windowsHide: true, // Hide terminal window on Windows
    };

    const child = spawn(npmCommand, ["start"], spawnOptions);
    child.on("error", (err) => {
      console.error(`Failed to start Aria music with npm: ${err.message}`);
      console.log("Trying direct node execution as fallback...");

      // Fallback to direct node execution
      const nodeChild = spawn("node", ["src/index.js"], {
        ...spawnOptions,
        env: { ...process.env },
      });
      nodeChild.on("error", (nodeErr) => {
        console.error(
          `Failed to start Aria music with node: ${nodeErr.message}`
        );
      });
      nodeChild.unref();
    });
    child.unref();
  } catch (error) {
    console.error(`Failed to start Aria music: ${error.message}`);
  }
}

setTimeout(startAriaMusic, 5000);

/**
 * Project: ariamusic
 * Author: Moulendu Chowley
 * Main Contributor: LucasB25
 * Company: Coders
 * Copyright (c) 2024. All rights reserved.
 * This code is the property of Coder and may not be reproduced or
 * modified without permission. For more information, contact us at
 * https://discord.gg/YQsGbTwPBx
 */
