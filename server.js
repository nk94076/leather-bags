// Custom production server for Passenger-based Node.js hosting (Hostinger,
// and most shared/cloud hosts that run Node apps via Phusion Passenger).
// Passenger expects a plain JS entry file that listens on process.env.PORT —
// it cannot invoke the `next start` CLI directly, so this wraps Next.js
// programmatically. For a VPS or other host where you control the process
// yourself, `npm start` (plain `next start`) still works fine.
const { createServer } = require("node:http");
const { parse } = require("node:url");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Corium ready on port ${port} (${dev ? "development" : "production"})`);
  });
});
