import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, "dist");
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5173;

let backendUrl = process.env.VITE_API_BASE_URL || process.env.BACKEND_URL || "";
if (backendUrl && !backendUrl.startsWith("http://") && !backendUrl.startsWith("https://")) {
  backendUrl = `https://${backendUrl}`;
}
if (backendUrl.endsWith("/")) {
  backendUrl = backendUrl.slice(0, -1);
}

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split("?")[0];

  // Reverse proxy API routes to backend if configured
  if (backendUrl && (urlPath === "/jobs" || urlPath === "/generate" || urlPath === "/health")) {
    try {
      const targetUrl = new URL(req.url, backendUrl);
      const clientLib = targetUrl.protocol === "https:" ? https : http;

      const proxyReq = clientLib.request(
        targetUrl,
        {
          method: req.method,
          headers: {
            ...req.headers,
            host: targetUrl.host,
          },
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        }
      );

      proxyReq.on("error", (err) => {
        console.error("Backend proxy error:", err);
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Backend proxy unreachable", details: err.message }));
      });

      req.pipe(proxyReq);
      return;
    } catch (e) {
      console.error("Failed to construct proxy URL:", e);
    }
  }

  // Static file serving
  let safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, "");
  let filePath = path.join(DIST_DIR, safePath);

  // Fallback to index.html for SPA client-side routing
  if (
    safePath === "/" ||
    !fs.existsSync(filePath) ||
    fs.statSync(filePath).isDirectory()
  ) {
    filePath = path.join(DIST_DIR, "index.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server Error");
      return;
    }
    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
    });
    res.end(content);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
  if (backendUrl) {
    console.log(`Proxying API requests to: ${backendUrl}`);
  }
});
