import fs from 'node:fs';
import { shardStart } from './shard.js';
import Logger from './structures/Logger.js';
import ThemeSelector from './utils/ThemeSelector.js';

const logger = new Logger();
const theme = new ThemeSelector();

/**
 * @param {string} title
 */
function setConsoleTitle(title) {
    process.stdout.write(`\x1b]0;${title}\x07`);
}

try {
    if (!fs.existsSync('./src/utils/LavaLogo.txt')) {
        logger.error('LavaLogo.txt file is missing');
        process.exit(1);
    }
    console.clear();
    setConsoleTitle('Aria music');
    const logFile = fs.readFileSync('./src/utils/LavaLogo.txt', 'utf-8');
    console.log(theme.purpleNeon(logFile));
    shardStart(logger);
} catch (err) {
    logger.error('[CLIENT] An error has occurred:', err);
}