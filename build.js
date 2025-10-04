import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";

console.log("🔨 Building Aria Music for production...");

// Ensure dist directory exists
const distDir = path.resolve(process.cwd(), "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log("📁 Created dist directory");
}

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf-8")
);
const { dependencies, peerDependencies } = packageJson;

const sharedConfig = {
  entryPoints: ["src/index.js"],
  bundle: true,
  minify: true,
  platform: "node",
  target: "node18",
  format: "esm",
  sourcemap: false, // Disable sourcemaps for production
  treeShaking: true, // Enable tree shaking for smaller bundles
  external: Object.keys(dependencies || {})
    .concat(Object.keys(peerDependencies || {}))
    .concat(["@dotenvx/dotenvx", "dotenv"]),
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  banner: {
    js: "#!/usr/bin/env node",
  },
};

console.log("⚡ Bundling and minifying code...");

build({
  ...sharedConfig,
  outfile: "dist/index.js",
})
  .then(() => {
    // Make the file executable
    try {
      fs.chmodSync(path.resolve(process.cwd(), "dist/index.js"), 0o755);
    } catch (err) {
      // chmod might not work on Windows, that's okay
    }

    const stats = fs.statSync(path.resolve(process.cwd(), "dist/index.js"));
    const fileSizeInKB = (stats.size / 1024).toFixed(2);

    console.log("✅ Build completed successfully!");
    console.log(`📦 Output: dist/index.js (${fileSizeInKB} KB)`);
    console.log("🚀 Ready for production deployment!");
  })
  .catch((error) => {
    console.error("❌ Build failed:", error);
    process.exit(1);
  });
