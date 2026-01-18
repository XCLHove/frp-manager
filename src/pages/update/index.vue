<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getVersion } from '@tauri-apps/api/app'
import { check, Update } from '@tauri-apps/plugin-updater'
import { ElMessage, ElMessageBox } from 'element-plus'
import { log_error } from '@/invoke-apis/file-log.ts'

const currentVersion = ref('')
const latestVersion = ref('')
const downloading = ref(false)
const totalDownloadSize = ref(0)
const currentDownLoadSize = ref(0)
const updateAvailable = computed(() => latestVersion.value && latestVersion.value !== currentVersion.value)
const downloadPercentage = computed(() => {
  if (currentDownLoadSize.value === 0) return 0
  return Math.ceil((currentDownLoadSize.value / totalDownloadSize.value) * 100)
})
const loading = ref(true)
const loadingText = ref('加载中...')

onMounted(() => {
  init()
})

function init() {
  checkCurrentVersion()
  checkLatestVersion()
}

async function checkCurrentVersion() {
  currentVersion.value = await getVersion()
}

async function checkLatestVersion(showMessage?: boolean) {
  const loadingEnd = loadingStart()
  check()
    .then((newUpdate) => {
      if (!newUpdate) return
      latestVersion.value = newUpdate?.version

      if (showMessage) {
        ElMessage.success(`最新版本：${latestVersion.value}`)
      }
    })
    .catch((e) => {
      const errorMessage = `${e?.message || e}`
      log_error(`检查更新失败：${errorMessage}`)
      ElMessageBox.alert(errorMessage, '检查更新失败').catch(() => {})
      throw e
    })
    .finally(() => loadingEnd())
}

async function downloadAndInstall() {
  const loadingEnd = loadingStart('准备中...')
  const update = await check().finally(() => loadingEnd())
  if (!update) return
  totalDownloadSize.value = 0
  currentDownLoadSize.value = 0
  downloading.value = true
  update
    .downloadAndInstall((progress) => {
      if (progress.event === 'Started') {
        downloading.value = true
        totalDownloadSize.value = progress.data.contentLength as number
      } else if (progress.event === 'Progress') {
        currentDownLoadSize.value += progress.data.chunkLength as number
      } else if (progress.event === 'Finished') {
        downloading.value = false
      }
    })
    .catch((e) => {
      const errorMessage = `${e?.message || e}`
      log_error(`下载失败：${errorMessage}`)
      ElMessageBox.alert(errorMessage, '下载失败').catch(() => {})
      throw e
    })
    .finally(() => {
      downloading.value = false
    })
}

function formatPercentageText(percentage: number) {
  return `${formatBytes(currentDownLoadSize.value)}/${formatBytes(totalDownloadSize.value)} (${percentage.toFixed(2)}%)`
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

function loadingStart(text?: string) {
  loadingText.value = text || '加载中...'
  loading.value = true

  const loadingEnd = () => (loading.value = false)
  return loadingEnd
}
</script>

<template>
  <div class="update w-full h-full flex flex-col" v-loading="loading" :element-loading-text="loadingText">
    <el-descriptions border :column="1" label-width="100">
      <el-descriptions-item label="当前版本">
        {{ currentVersion || '未知' }}
      </el-descriptions-item>
      <el-descriptions-item label="最新版本">
        <div class="flex items-center">
          <el-text :type="updateAvailable ? 'success' : ''">{{ latestVersion || '未知' }}</el-text>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="更新日志"> 开发中... </el-descriptions-item>
    </el-descriptions>

    <div class="flex flex-col mt-auto p-1 w-full">
      <el-button @click="checkLatestVersion(true)" type="success">检查更新</el-button>
      <div class="w-full flex flex-col mt-1">
        <el-button type="primary" v-show="updateAvailable && !downloading" @click="downloadAndInstall"
          >下载并安装</el-button
        >
        <el-progress
          class="w-full"
          v-show="downloading"
          :text-inside="true"
          :stroke-width="26"
          :percentage="downloadPercentage"
          :format="formatPercentageText"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
