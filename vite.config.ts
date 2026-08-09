import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    tanstackStart({ server: { entry: "server" } }),
    ...(command === "build" ? [nitro({ defaultPreset: "node-server" })] : []),
    react(),
  ],
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom", "@tanstack/react-router"],
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
}));
