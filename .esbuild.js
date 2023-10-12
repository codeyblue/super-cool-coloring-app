const path = require('path');
const { promises: fs } = require('fs');
const http = require('http');
const { networkInterfaces } = require('os');

const esbuild = require('esbuild');
const handler = require('serve-handler');

const OUTDIR = path.resolve(__dirname, 'build');
const port = 18888;
const prod = process.argv.includes('--prod');
const dev = process.argv.includes('--dev');
const watch = dev || process.argv.includes('--watch');
const noCache = dev || process.argv.includes('--no-cache');

const buildApp = async () => {
  const context = await esbuild.context({
    minify: !!prod,
    sourcemap: prod ? false : 'inline',
    entryPoints: ['src/app.jsx'],
    bundle: true,
    outfile: path.resolve(OUTDIR, 'app.js'),
    logLevel: 'info',
    treeShaking: true,
    metafile: true
  });

  const { metafile } = await context.rebuild();
  await fs.writeFile(path.resolve(OUTDIR, 'metafile'), JSON.stringify(metafile, null, 2));

  if (watch) {
    await context.watch();
  } else {
    await context.rebuild();
    await context.dispose();
  }
};

const buildStatic = async () => {
  const files = [
    { source: 'src/index.html', destination: path.resolve(OUTDIR, 'index.html') },
    { source: 'test/images/demo-image.jpg', destination: path.resolve(OUTDIR, 'demo-image.jpg') }
  ];

  for (const { source, destination } of files) {
    const ctx = await esbuild.context({
      entryPoints: [source],
      outfile: destination,
      bundle: false,
      loader: {
        [path.extname(source)]: 'copy'
      },
      logLevel: 'info'
    });

    if (watch) {
      await ctx.watch();
    } else {
      await ctx.rebuild();
      await ctx.dispose();
    }
  }
};

(async () => {
  await fs.rm(OUTDIR, {
    force: true,
    recursive: true
  });
  await buildApp();
  await buildStatic();

  if (dev) {
    const noCacheSettings = {
      headers: [{
        source: '**/*',
        headers: [{
          key: 'Cache-Control',
          value: 'no-cache'
        }]
      }]
    };

    const server = http.createServer((request, response) => {
      // see for options: https://github.com/vercel/serve-handler#options
      return handler(request, response, {
        public: OUTDIR,
        ...(noCache ? noCacheSettings : {})
      });
    });

    await new Promise(r => server.listen(port, () => r()));

    console.log([
      'app running at:',
      `  http://localhost:${port}`,
      ...Object.values(networkInterfaces())
        .reduce((memo, value) => [...memo, ...value], [])
        .filter(value => value.family === 'IPv4')
        .map(({ address }) => `  http://${address}:${port}`)
    ].join('\n'));
  }
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
