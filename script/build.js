const { build } = require('esbuild')

build({
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
  bundle: true,
  platform: 'node',
  target: ['node16'],
  format: 'cjs',
  sourcemap: 'external',
  plugins: [{
    name: 'external library',
    setup(build) {
      build.onResolve({ filter: /^[@/\w-]+$/ }, () => ({ external: true }))
    },
  }],
})