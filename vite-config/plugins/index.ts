import {type PluginOption} from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import {ElementPlusResolver} from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import {join} from "path";
import {PROJECT_DIR} from "../commons/var";
import UnpluginElementPlus from "unplugin-element-plus/vite";
import tailwindcss from '@tailwindcss/vite'

export const plugins: PluginOption[] = [
  vue(),
  UnpluginElementPlus({
    ignoreComponents: ["LoadingService"],
  }),
  AutoImport({
    resolvers: [ElementPlusResolver()],
    imports: [],
    dirs: [],
    dts: join(PROJECT_DIR, "src/types/auto-imports.d.ts"),
  }),
  Components({
    resolvers: [ElementPlusResolver()],
    dirs: [],
    dts: join(PROJECT_DIR, "src/types/components.d.ts"),
  }),
  tailwindcss({})
];
