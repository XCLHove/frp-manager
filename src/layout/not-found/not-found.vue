<template>
  <div class="flex justify-center items-center h-full w-full">
    <el-empty>
      <template #description>
        <div class="flex flex-col items-center">
          <div class="flex">
            <el-text size="large">页面不存在: </el-text>
            <el-text size="large" type="danger">{{ path }}</el-text>
          </div>
          <el-button type="primary" @click="toHome">返回首页</el-button>
        </div>
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import router from '@/router'

const path = computed(() => router.currentRoute.value.path)

function toHome() {
  router.push('/')
}
</script>
