<script setup lang="ts">
import LayoutMenu from '@/layout/layout-menu/layout-menu.vue'
import useElementPlusStore from '@/stores/useElementPlusStore.ts'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
import { checkUpdate } from '@/utils/checkUpdate.ts'

const elementPlusStore = useElementPlusStore()
const { buttonConfig, locale, messageConfig } = storeToRefs(elementPlusStore)
const route = useRoute()

onMounted(() => {
  checkUpdate()
})
</script>

<template>
  <el-config-provider :button="buttonConfig" :locale="locale" :message="messageConfig">
    <div class="frp-manager w-screen h-screen flex flex-col box-border">
      <div class="flex flex-row w-full h-full">
        <div class="menu min-w-48 max-w-48">
          <el-scrollbar class="size-full-scrollbar" height="100vh">
            <layout-menu />
          </el-scrollbar>
        </div>
        <div class="page grow">
          <el-scrollbar class="size-full-scrollbar" height="100vh">
            <router-view :key="route.fullPath" />
          </el-scrollbar>
        </div>
      </div>
    </div>
  </el-config-provider>
</template>

<style scoped lang="scss">
.frp-manager {
  border-top: var(--el-border);

  .menu {
    border-right: var(--el-border);
  }
}
</style>
