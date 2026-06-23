import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "0.0.0.0";
const homePage = "Swiss-Invest v2.dc.html";

const publicFiles = new Set([
  homePage,
  "support.js",
  "assets/logo-dark.svg",
  "assets/logo-light.svg",
  "node_modules/react/umd/react.production.min.js",
  "node_modules/react-dom/umd/react-dom.production.min.js"
]);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function setSecurityHeaders(response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "SAMEORIGIN");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join("; ")
  );
}

function sendText(response, status, body, contentType = "text/plain; charset=utf-8") {
  response.writeHead(status, {
    "Content-Type": contentType,
    "Content-Length": Buffer.byteLength(body)
  });
  response.end(body);
}

async function sendFile(response, relativePath) {
  if (!publicFiles.has(relativePath)) {
    sendText(response, 404, "Not found\n");
    return;
  }

  const absolutePath = resolve(root, relativePath);
  if (!absolutePath.startsWith(`${resolve(root)}${sep}`)) {
    sendText(response, 403, "Forbidden\n");
    return;
  }

  try {
    await access(absolutePath);
    const details = await stat(absolutePath);
    const extension = extname(absolutePath).toLowerCase();

    response.writeHead(200, {
      "Content-Type": contentTypes[extension] ?? "application/octet-stream",
      "Content-Length": details.size,
      "Cache-Control":
        extension === ".html" ? "no-cache" : "public, max-age=604800"
    });
    createReadStream(absolutePath).pipe(response);
  } catch {
    sendText(response, 404, "Not found\n");
  }
}

const server = createServer(async (request, response) => {
  setSecurityHeaders(response);

  if (!request.url || !["GET", "HEAD"].includes(request.method ?? "")) {
    sendText(response, 405, "Method not allowed\n");
    return;
  }

  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);

  if (pathname === "/health" || pathname === "/healthz") {
    sendText(
      response,
      200,
      JSON.stringify({ status: "ok", node: process.version }),
      "application/json; charset=utf-8"
    );
    return;
  }

  const routes = {
    "/": homePage,
    "/index.html": homePage,
    "/support.js": "support.js",
    "/assets/logo-dark.svg": "assets/logo-dark.svg",
    "/assets/logo-light.svg": "assets/logo-light.svg",
    "/node_modules/react/umd/react.production.min.js":
      "node_modules/react/umd/react.production.min.js",
    "/node_modules/react-dom/umd/react-dom.production.min.js":
      "node_modules/react-dom/umd/react-dom.production.min.js"
  };

  const file = routes[pathname];
  if (!file) {
    sendText(response, 404, "Not found\n");
    return;
  }

  await sendFile(response, file);
});

server.listen(port, host, () => {
  console.log(`XR-SWISSINVEST listening on http://${host}:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down`);
  server.close((error) => {
    process.exitCode = error ? 1 : 0;
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
