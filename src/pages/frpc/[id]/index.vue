<script setup lang="ts">
import { useRoute } from 'vue-router'
import useFrpStore from '@/stores/useFrpStore.ts'
import { storeToRefs } from 'pinia'
import { computed, defineAsyncComponent, onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue'
import router from '@/router'
import { dayjs, ElMessage } from 'element-plus'
import {
  checkFrpcIsRunningApi,
  queryFrpcLogsApi,
  readFrpcConfigApi,
  runFrpcApi,
  stopFrpcApi,
  writeFrpcConfigApi,
} from '@/invoke-apis/frpc.ts'
import { useWindowSize } from '@vueuse/core'
import { simpleClone } from '@/utils/simpleClone.ts'
import { useVAnsiHtml } from '@/utils/useVAnsiHtml.ts'
import { sessionStorageRef } from '@/utils/sessionStorageRef.ts'
import { CirclePlusFilled, DeleteFilled, EditPen, Refresh, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import Loading from '@/components/loading/loading.vue'
import { sleep } from '@/utils/PromiseUtil.ts'

const { height: windowHeight } = useWindowSize()
const tabHeight = computed(() => windowHeight.value - 112)
const vAnsiHtml = useVAnsiHtml()
const asyncMonacoJsonEditor = defineAsyncComponent({
  loader: () => import('@/components/monaco-json-editor/monaco-json-editor.vue'),
  loadingComponent: Loading,
})

const route = useRoute()
const { id } = route.params as { id: string }

const frpStore = useFrpStore()
const { frpcList } = storeToRefs(frpStore)
const frpc = computed(() => simpleClone(frpcList.value.find((item) => item.id === id)))
const isRunning = ref(false)

const currentTab = ref('日志')
const logsText = ref('')
const queryLogData = ref({
  id,
  orderNumber: 0,
})

const configJson = ref('{}')
const config = ref(JSON.parse(configJson.value))
const visitors = ref<any[]>([])
const proxies = ref<any[]>([])

onBeforeMount(() => {
  if (!frpc.value) {
    ElMessage.warning('未找到相关配置')
    router.push('/')
  }
})

onMounted(() => {
  refreshConfig()
})

onMounted(() => {
  let timer: null | ReturnType<typeof setTimeout>
  let stopQuery = false
  const doQuery = (time = 0) => {
    timer = setTimeout(() => {
      queryFrpcLogsApi(queryLogData.value)
        .then(async (logs) => {
          if (logs.length > 0) {
            queryLogData.value.orderNumber = logs[logs.length - 1].order_number
          }

          for (const log of logs) {
            await Promise.resolve().then(async () => {
              logsText.value += log.content + '\n'
              await sleep(1000 / 30)
            })
          }
        })
        .finally(() => !stopQuery && doQuery(1000))
    }, time)
  }
  doQuery()
  onBeforeUnmount(() => {
    stopQuery = true
    if (timer !== null) clearTimeout(timer)
  })
})

onMounted(() => {
  let timer: null | ReturnType<typeof setTimeout>
  let stopRefresh = false
  const doRefresh = (time = 0) => {
    timer = setTimeout(() => {
      refreshStatus().finally(() => !stopRefresh && doRefresh(1000))
    }, time)
  }
  doRefresh()
  onBeforeUnmount(() => {
    stopRefresh = true
    if (timer !== null) clearTimeout(timer)
  })
})

async function refreshConfig(showMessage = false) {
  await readFrpcConfigApi({ id })
    .then((json) => {
      configJson.value = json
      config.value = JSON.parse(configJson.value)
      visitors.value = simpleClone(config.value.visitors) || []
      proxies.value = simpleClone(config.value.proxys) || []
      if (showMessage) {
        ElMessage.success('已刷新！')
      }
    })
    .catch((e) => {
      ElMessage.error(`${e?.message || e}`)
      throw e
    })
}

async function run() {
  logsText.value = ''
  await runFrpcApi({
    id: frpc.value!.id,
    binaryFile: frpc.value!.binaryFile,
    args: frpc.value!.startUpArgs,
  }).then((r) => {
    refreshStatus()
    if (r) {
      ElMessage.success('启动成功')
    } else {
      ElMessage.success('已启动')
    }
  })
}

async function stop() {
  await stopFrpcApi({ id }).then(() => {
    refreshStatus()
    ElMessage.success('已停止')
  })
}

async function refreshStatus() {
  await checkFrpcIsRunningApi({ id }).then((status) => {
    isRunning.value = status
  })
}

function validateConfig() {
  try {
    JSON.parse(configJson.value)
    return true
  } catch (_e) {
    return false
  }
}

async function saveConfig() {
  if (!validateConfig()) {
    ElMessage.error('配置有误！')
    return
  }

  writeFrpcConfigApi({
    id,
    config: configJson.value,
  }).then(() => {
    ElMessage.success('保存成功！')
    refreshConfig()
  })
}
</script>

<template>
  <div class="frpc flex flex-col child-mt-5">
    <div class="ml-1 mt-1">
      <el-button v-if="!isRunning" type="primary" @click="run" :icon="VideoPlay">启动</el-button>
      <el-button v-else type="danger" @click="stop" :icon="VideoPause">停止</el-button>
      <el-button type="primary" @click="saveConfig">保存配置</el-button>
      <el-button type="primary" :icon="Refresh" @click="refreshConfig(true)">刷新配置</el-button>
    </div>
    <div>
      <el-tabs type="border-card" v-model="currentTab">
        <el-tab-pane name="日志" label="日志">
          <div style="background: #454545" class="rounded">
            <el-scrollbar class="size-full-scrollbar" :height="tabHeight">
              <pre style="width: 1vw"><code class="text-xs" v-ansi-html="logsText"></code></pre>
            </el-scrollbar>
          </div>
        </el-tab-pane>

        <el-tab-pane name="配置" label="配置">
          <div style="height: calc(100vh - 112px)">
            <async-monaco-json-editor class="h-full w-full" v-model="configJson" @save="saveConfig" />
          </div>
        </el-tab-pane>

        <el-tab-pane name="visitors" label="visitors">
          <div class="flex flex-col">
            <div class="flex flex-row">
              <el-button type="primary" :icon="CirclePlusFilled">新增</el-button>
            </div>
            <div class="mt-1">
              <el-table :data="visitors" border :height="windowHeight - 148">
                <el-table-column label="name" prop="name"></el-table-column>
                <el-table-column label="type" prop="type" align="center" width="120"></el-table-column>
                <el-table-column label="操作" fixed="right" align="center" width="120">
                  <template #default="{ row }">
                    <el-tooltip placement="bottom" effect="light">
                      <template #default>
                        <el-text type="primary" text>操作</el-text>
                      </template>

                      <template #content>
                        <div class="flex flex-col child-mt-10">
                          <div>
                            <el-button type="primary" :icon="EditPen">编辑</el-button>
                          </div>
                          <div>
                            <el-button type="danger" :icon="DeleteFilled">删除</el-button>
                          </div>
                        </div>
                      </template>
                    </el-tooltip>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="proxies" label="proxies">
          <div class="flex flex-col">
            <div class="flex flex-row">
              <el-button type="primary" :icon="CirclePlusFilled">新增</el-button>
            </div>
            <div class="mt-1">
              <el-table :data="proxies" border :height="windowHeight - 148">
                <el-table-column label="name" prop="name"></el-table-column>
                <el-table-column label="type" prop="type"></el-table-column>
                <el-table-column label="操作">
                  <template #default="{ row }">
                    <el-tooltip placement="bottom" effect="light">
                      <template #default>
                        <el-text type="primary" text>操作</el-text>
                      </template>

                      <template #content>
                        <div class="flex flex-col child-mt-10">
                          <div>
                            <el-button type="primary" :icon="EditPen">编辑</el-button>
                          </div>
                          <div>
                            <el-button type="danger" :icon="DeleteFilled">删除</el-button>
                          </div>
                        </div>
                      </template>
                    </el-tooltip>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
