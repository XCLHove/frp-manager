<script setup lang="ts">
import { type Menu, getMenus } from '@/menu'
import { ElIcon, ElMenuItem, ElSubMenu } from 'element-plus'
import { computed, h } from 'vue'
import router from '@/router'
import { Document as IconDocument, FolderOpened } from '@element-plus/icons-vue'

const defaultActive = computed(() => router.currentRoute.value.path)
const menus = computed(() => getMenus())

function getMenuComponent(menu: Menu) {
  const path = menu.path

  const menuChildren = menu.children || []
  if (menu.isDirectory || menuChildren.length > 0) {
    const icon = menu.icon || (() => h(FolderOpened))
    return h(
      ElSubMenu,
      { index: path },
      {
        title: () => [h(ElIcon, icon), h('span', menu.label)],
        default: () => menuChildren.map((item) => getMenuComponent(item)),
      },
    )
  }

  const icon = menu.icon || (() => h(IconDocument))
  return h(ElMenuItem, { index: path }, { title: () => [h(ElIcon, icon), h('span', menu.label)] })
}
</script>

<template>
  <el-menu
    class="layout-menu"
    router
    :default-active="defaultActive"
    background-color="#F7FAFC"
    text-color="#4A5568"
    active-text-color="#38B2AC"
  >
    <component :is="getMenuComponent(menu)" v-for="menu in menus" :key="menu.path" />
  </el-menu>
</template>

<style scoped lang="scss">
.layout-menu {
  height: 100%;
  border-right: none;
}
</style>
