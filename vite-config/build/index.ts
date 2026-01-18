import { type BuildEnvironmentOptions } from "vite";

const assetDirMap = new Map<string, string>([
  ["ttf", "fonts"],
  ["css", "css"],
  ["js", "js"],
  ["svg", "image"],
  ["png", "image"],
  ["jpg", "image"],
]);

export const build: BuildEnvironmentOptions = {
  rollupOptions: {
    output: {
      chunkFileNames: "static/js/[name]__[hash].js",
      entryFileNames: "static/js/[name]__[hash].js",
      assetFileNames: (chunkInfo) => {
        const suffix = chunkInfo.name.split(".").pop();
        const dir = assetDirMap.get(suffix);
        if (dir) return `static/${dir}/[name]__[hash].[ext]`;
        return "static/[ext]/[name]__[hash].[ext]";
      },
    },
  },
};
