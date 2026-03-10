import { defineConfig, type Plugin } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";

// SPA fallback: intercept non-file, non-API requests BEFORE the Cloudflare
// worker so that client-side routes like /chat get index.html.
// In production, wrangler.jsonc `not_found_handling: "single-page-application"` handles this.
function spaFallback(): Plugin {
  return {
    name: "spa-fallback",
    configureServer(server) {
      // Returning a function makes this run AFTER internal middlewares but
      // the trick is we need it BEFORE the Cloudflare worker proxy.
      // Use `server.middlewares.use` directly (no return) to run early.
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "/";
        // Let through: API, Vite internals, files with extensions, HMR websocket
        if (
          url.startsWith("/api/") ||
          url.startsWith("/@") ||
          url.startsWith("/__") ||
          url.startsWith("/node_modules/") ||
          url.startsWith("/src/") ||
          /\.\w+(\?|$)/.test(url) ||
          url === "/"
        ) {
          return next();
        }
        // Serve transformed index.html for SPA routes
        const htmlPath = path.resolve(server.config.root, "index.html");
        let html = fs.readFileSync(htmlPath, "utf-8");
        html = await server.transformIndexHtml(url, html);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      });
    },
  };
}

export default defineConfig({
  server: {
    host: true,
  },
  plugins: [
    spaFallback(),
    cloudflare({
      configPath: "./wrangler.jsonc",
      viteEnvironment: { name: "ssr" },
    }),
    tailwindcss(),
  ],
});
