const path = require('path');
const { promises: fs } = require('fs');
const http = require('http');

const { build } = require('esbuild');
const handler = require('serve-handler');

const OUTDIR = path.resolve(__dirname, 'build');
const port = 18888;
const prod = process.argv.includes('--prod');
const dev = process.argv.includes('--dev');
const watch = dev || process.argv.includes('--watch');
const noCache = dev || process.argv.includes('--no-cache');

const config = prod ? {
  minify: true
} : {
  watch,
  sourcemap: 'inline'
};

(async () => {
  await build({
    ...config,
    entryPoints: ['src/app.jsx'],
    bundle: true,
    outfile: path.resolve(OUTDIR, 'app.js'),
    logLevel: 'info'
  });

  // maybe do something else for this one?
  await fs.writeFile(path.resolve(OUTDIR, 'index.html'), await fs.readFile('src/index.html'));
  await fs.writeFile(path.resolve(OUTDIR, 'demoImage.jpg'), await fs.readFile('test/images/demo-image.jpg'));

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

    console.log(`app running at http://localhost:${port}`);
  }
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
