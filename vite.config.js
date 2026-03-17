import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function ytSearchPlugin() {
  return {
    name: "yt-search-middleware",
    configureServer(server) {
      server.middlewares.use("/yt-search", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", async () => {
          try {
            const parsed = JSON.parse(body);
            const response = await fetch(
              "https://www.youtube.com/youtubei/v1/search",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  context: {
                    client: {
                      clientName: "WEB",
                      clientVersion: "2.20231219",
                    },
                  },
                  query: parsed.query,
                }),
              }
            );
            const data = await response.text();
            res.setHeader("Content-Type", "application/json");
            res.end(data);
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), ytSearchPlugin()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "@react-three/fiber"],
        },
      },
    },
  },
});
