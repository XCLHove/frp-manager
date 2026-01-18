<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { disable, enable, isEnabled } from '@/invoke-apis/auto-start.ts'
import { getTauriStore, storeKey } from '@/utils/tauriStore.ts'
import { log_error } from '@/invoke-apis/file-log.ts'

const isEnabledAutoStart = ref(false)
const hideOnFirstStartUp = ref(false)

onMounted(() => {
  init()
})

async function init() {
  await checkAutoStart()
  await checkHideOnFirstStartUp()
}

async function checkAutoStart() {
  await isEnabled()
    .then((v) => {
      isEnabledAutoStart.value = v
    })
    .catch((e: any) => {
      ElMessage.error(`检查自启动状态失败：${e?.message || e}`)
    })
}

async function switchAutoStart() {
  Promise.resolve()
    .then(() => {
      if (isEnabledAutoStart.value) {
        return disable()
      } else {
        return enable()
      }
    })
    .catch((e: any) => {
      console.error(e)
      const errorMessage = `${e?.message || e}`
      log_error(errorMessage)
      ElMessage.error(errorMessage)
      throw e
    })
    .finally(() => checkAutoStart())
}

async function checkHideOnFirstStartUp() {
  const store = await getTauriStore()
  const value = await store.get<boolean>(storeKey.HIDE_ON_FIRST_START_UP)
  if (typeof value === 'undefined') return
  hideOnFirstStartUp.value = value
}

async function switchHideOnFirstStartUp() {
  const store = await getTauriStore()
  await Promise.resolve()
    .then(async () => {
      await store.set(storeKey.HIDE_ON_FIRST_START_UP, !hideOnFirstStartUp.value)
      await store.save()
    })
    .catch((e: any) => {
      console.error(e)
      let errorMessage = `${e?.message || e}`
      log_error(errorMessage)
      ElMessage.error(errorMessage)
      throw e
    })
    .finally(() => checkHideOnFirstStartUp())
}
</script>

<template>
  <div class="config flex flex-col w-full h-full">
    <el-descriptions :column="1" border label-width="150">
      <el-descriptions-item label="开机自启动">
        <el-switch
          :model-value="isEnabledAutoStart"
          active-text="已启用"
          inactive-text="已禁用"
          @click="switchAutoStart"
          inline-prompt
        ></el-switch>
      </el-descriptions-item>
      <el-descriptions-item label="首次启动后隐藏窗口">
        <el-switch
          :model-value="hideOnFirstStartUp"
          active-text="已启用"
          inactive-text="已禁用"
          @click="switchHideOnFirstStartUp"
          inline-prompt
        ></el-switch>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<style scoped lang="scss"></style>
