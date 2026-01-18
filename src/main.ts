import { createApp } from 'vue'
import App from './App.vue'
import { loadLib } from '@/lib-loader/loadLib.ts'
import { tauriInit } from '@/tauri-init/tauriInit.ts'

const app = createApp(App)
loadLib(app)
app.mount('#app')
tauriInit()
