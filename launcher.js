#!/usr/bin/env node

/**
 * Aria Music Launcher
 * Automatically detects environment and starts the appropriate version
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const isProduction =
  process.env.NODE_ENV === "production" || process.env.PTERODACTYL === "true";
const distPath = join(process.cwd(), "dist", "index.js");
const srcPath = join(process.cwd(), "src", "index.js");

console.log("🚀 Aria Music Launcher");
console.log(`📊 Environment: ${isProduction ? "Production" : "Development"}`);

if (isProduction) {
  console.log("🏭 Production mode detected");

  if (existsSync(distPath)) {
    console.log("✅ Using optimized build: dist/index.js");
    startBot(["dist/index.js"]);
  } else {
    console.log("⚠️  Optimized build not found, building now...");

    // Build first, then start
    const buildProcess = spawn("node", ["build.js"], { stdio: "inherit" });
    buildProcess.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Build completed, starting bot...");
        startBot(["dist/index.js"]);
      } else {
        console.error("❌ Build failed, falling back to source...");
        startBot(["src/index.js"]);
      }
    });
  }
} else {
  console.log("🛠️  Development mode detected");
  console.log("✅ Using source files: src/index.js");
  startBot(["src/index.js"]);
}

function startBot(args) {
  const child = spawn("node", args, {
    stdio: "inherit",
    env: { ...process.env },
  });

  child.on("error", (err) => {
    console.error("❌ Failed to start bot:", err);
    process.exit(1);
  });

  child.on("exit", (code) => {
    console.log(`🔄 Bot process exited with code ${code}`);
    process.exit(code);
  });
}
