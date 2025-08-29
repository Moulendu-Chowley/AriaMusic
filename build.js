const { build } = require('esbuild');
const { dependencies, peerDependencies } = require('./package.json');

const sharedConfig = {
  entryPoints: ['src/index.js'],
  bundle: true,
  minify: true,
  platform: 'node',
  target: 'node18',
  external: Object.keys(dependencies || {}).concat(Object.keys(peerDependencies || {})),
};

build({
  ...sharedConfig,
  outfile: 'dist/index.js',
}).catch(() => process.exit(1));
