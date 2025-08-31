import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));
const { dependencies, peerDependencies } = packageJson;

const sharedConfig = {
  entryPoints: ['src/index.js'],
  bundle: true,
  minify: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  external: Object.keys(dependencies || {}).concat(Object.keys(peerDependencies || {})).concat(['@dotenvx/dotenvx', 'dotenv']),
};

build({
  ...sharedConfig,
  outfile: 'dist/index.js',
}).catch(() => process.exit(1));
