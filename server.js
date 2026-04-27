/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("http");
const next = require("next");
const { parse } = require("url");

const port = parseInt(process.env.PORT || "3000", 10);
// Robust production check: Default to production if .next exists
const isProd = process.env.NODE_ENV === "production" || fs.existsSync(path.join(__dirname, '.next'));
const dev = !isProd && process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

console.log(`> [START] Ishta Crafts Server initializing...`);
console.log(`> [MODE] ${dev ? 'DEVELOPMENT' : 'PRODUCTION'}`);

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) {
      console.error(`> [FATAL] Server failed to start:`, err);
      process.exit(1);
    }
    console.log(`> [READY] Ishta Crafts live on port ${port}`);
  });
}).catch((err) => {
  console.error(`> [FATAL] App preparation failed:`, err);
  process.exit(1);
});
