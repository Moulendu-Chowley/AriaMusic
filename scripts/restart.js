const { spawn } = require("node:child_process");

async function startAriaMusic() {
    const child = spawn("npm", ["start"], {
        stdio: "inherit",
        shell: true,
        detached: true,
    });
    child.on("error", (err) => {
        console.error(`Failed to start Aria music: ${err.message}`);
    });
    child.unref();
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