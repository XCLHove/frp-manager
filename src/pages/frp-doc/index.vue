<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { runFrpDocServerApi } from '@/invoke-apis/frp-doc.ts'
import { getAllWindows } from '@tauri-apps/api/window'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

const url = ref('')
const loading = ref(false)
const frpDocWindowLabel = 'frp-doc'

onMounted(() => {
  loading.value = true
  runFrpDocServerApi()
    .then((docUrl) => {
      url.value = docUrl
    })
    .finally(() => (loading.value = false))
})

async function openInNewWindow() {
  let frpDocWindow = (await getAllWindows()).find((w) => w.label === frpDocWindowLabel)
  if (!frpDocWindow) {
    frpDocWindow = new WebviewWindow(frpDocWindowLabel, {
      title: 'Frp Doc',
      width: 800,
      height: 600,
      url: url.value,
    })
  }
  frpDocWindow.setFocus()
}
</script>

<template>
  <div class="frp-doc h-full w-full">
    <div class="button-container">
      <el-button type="primary" @click="openInNewWindow">在新窗口中打开</el-button>
    </div>
    <iframe class="h-full w-full" v-if="url" :src="url"></iframe>
  </div>
</template>

<style scoped lang="scss">
.frp-doc {
  position: relative;

  .button-container {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.5;
    display: none;
  }

  &:hover {
    .button-container {
      display: block;
    }
  }
}
</style>
