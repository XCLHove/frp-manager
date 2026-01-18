import { defineConfig } from "vite";
import { build, plugins, resolve, server } from "./vite-config";

export default defineConfig(() => ({
  plugins,
  server,
  build,
  resolve,
  clearScreen: false,
}));
