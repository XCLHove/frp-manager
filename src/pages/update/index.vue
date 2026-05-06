<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getVersion } from '@tauri-apps/api/app'
import { check } from '@tauri-apps/plugin-updater'
import { dayjs, ElMessage, ElMessageBox } from 'element-plus'
import { log_error } from '@/invoke-apis/file-log.ts'
import axios from 'axios'
import { GiteeReleaseInfo } from '@/pages/update/type.ts'
import MarkdownPreview from '@/components/markdown-preview/markdown-preview.vue'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'

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
const checkTimeout = 3 * 1000
const loading = ref(true)
const loadingText = ref('加载中...')

const user = 'xclhove'
const repo = 'frp-manager'
const giteeReleaseInfoList = ref<GiteeReleaseInfo[]>([])
const latestReleaseInfo = ref<GiteeReleaseInfo | null>(null)

let loadingCount = 0

onMounted(() => {
  init()
})

function init() {
  checkCurrentVersion()
  checkLatestVersion()
  getReleaseList()
  getLatestRelease()
}

async function checkCurrentVersion() {
  currentVersion.value = await getVersion()
}

function loadingStart(text?: string) {
  loadingText.value = text || '加载中...'
  loadingCount++
  loading.value = true

  const loadingEnd = () => {
    loadingCount--
    if (loadingCount <= 0) {
      loadingCount = 0
      loading.value = false
    }
  }
  return loadingEnd
}

async function checkLatestVersion(showMessage?: boolean) {
  const loadingEnd = loadingStart()
  check({ timeout: checkTimeout })
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
  const update = await check({ timeout: checkTimeout }).finally(() => loadingEnd())
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

async function getReleaseList() {
  const loadingEnd = loadingStart('获取版本信息...')
  await axios
    .get<GiteeReleaseInfo[]>(`https://gitee.com/api/v5/repos/${user}/${repo}/releases`, {
      timeout: 5 * 1000,
    })
    .then((r) => {
      giteeReleaseInfoList.value = r.data.reverse()
    })
    .catch((e) => {
      const errorMessage = e?.message || e?.toString()
      log_error(errorMessage)
      ElMessage.error(`获取版本信息失败：${errorMessage}`)
    })
    .finally(() => loadingEnd())
}

async function getLatestRelease() {
  const loadingEnd = loadingStart('获取最新版本信息...')
  await axios
    .get<GiteeReleaseInfo>(`https://gitee.com/api/v5/repos/${user}/${repo}/releases/latest`, {
      timeout: 5 * 1000,
    })
    .then((r) => {
      latestReleaseInfo.value = r.data
    })
    .catch((e) => {
      const errorMessage = e?.message || e?.toString()
      log_error(errorMessage)
    })
    .finally(() => loadingEnd())
}

function copyDownloadUrl(url: string) {
  writeText(url).then(() => {
    ElMessage.success('已复制链接到剪贴板！')
  })
}

function dateFormat(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<template>
  <div v-loading="loading" :element-loading-text="loadingText" class="update w-full h-full flex flex-col">
    <el-descriptions :column="1" border label-width="100">
      <el-descriptions-item label="当前版本">
        {{ currentVersion || '未知' }}
      </el-descriptions-item>

      <el-descriptions-item label="最新版本">
        <div class="flex items-center">
          <el-text :type="updateAvailable ? 'success' : ''">{{ latestVersion || latestReleaseInfo?.tag_name || '未知' }}</el-text>
        </div>
      </el-descriptions-item>

      <el-descriptions-item label="下载地址">
        <el-descriptions border :column="1">
          <el-descriptions-item label="gitee">
            <el-button link type="primary" @click="copyDownloadUrl(`https://gitee.com/${user}/${repo}/releases/latest`)">
              https://gitee.com/{{ user }}/{{ repo }}/releases/latest
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item label="github">
            <el-button link type="primary" @click="copyDownloadUrl(`https://github.com/${user}/${repo}/releases/latest`)">
              https://github.com/{{ user }}/{{ repo }}/releases/latest
            </el-button>
          </el-descriptions-item>
        </el-descriptions>
      </el-descriptions-item>

      <el-descriptions-item label="更新日志">
        <el-table border :data="giteeReleaseInfoList" default-expand-all height="calc(100vh - 330px)">
          <el-table-column type="expand" width="50" align="center">
            <template #default="{ row }: { row: GiteeReleaseInfo }">
              <markdown-preview :model-value="row.body" />
            </template>
          </el-table-column>
          <el-table-column label="版本" prop="tag_name">
            <template #default="{ row }: { row: GiteeReleaseInfo }">
              <div class="flex gap-1">
                <el-tag type="primary">{{ row.tag_name }}</el-tag>
                <el-tag v-if="row.id === latestReleaseInfo?.id" type="success">最新版本</el-tag>
                <el-tag v-if="row.tag_name === currentVersion" type="success">当前版本</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="发布时间" width="200" align="center">
            <template #default="{ row }: { row: GiteeReleaseInfo }">
              {{ dateFormat(row.created_at) }}
            </template>
          </el-table-column>
        </el-table>
      </el-descriptions-item>
    </el-descriptions>

    <div class="flex flex-col mt-auto p-1 w-full">
      <el-button type="success" @click="checkLatestVersion(true)">检查更新</el-button>
      <div class="w-full flex flex-col mt-1">
        <el-button v-show="updateAvailable && !downloading" type="primary" @click="downloadAndInstall"
          >下载并安装新版</el-button
        >
        <el-progress
          v-show="downloading"
          :format="formatPercentageText"
          :percentage="downloadPercentage"
          :stroke-width="26"
          :text-inside="true"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
