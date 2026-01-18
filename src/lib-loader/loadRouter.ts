import { App } from 'vue'
import router from "@/router";

export function loadRouter(app: App) {
  app.use(router)
}
