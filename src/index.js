"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("node:fs"));
const shard_1 = require("./shard");
const Logger_1 = tslib_1.__importDefault(require("./structures/Logger"));
const ThemeSelector_1 = require("./utils/ThemeSelector");
const logger = new Logger_1.default();
const theme = new ThemeSelector_1.ThemeSelector();
function setConsoleTitle(title) {
    process.stdout.write(`\x1b]0;${title}\x07`);
}
try {
    if (!fs.existsSync("./src/utils/LavaLogo.txt")) {
        logger.error("LavaLogo.txt file is missing");
        process.exit(1);
    }
    console.clear();
    setConsoleTitle("Aria music");
    const logFile = fs.readFileSync("./src/utils/LavaLogo.txt", "utf-8");
    console.log(theme.purpleNeon(logFile));
    (0, shard_1.shardStart)(logger);
}
catch (err) {
    logger.error("[CLIENT] An error has occurred:", err);
}
