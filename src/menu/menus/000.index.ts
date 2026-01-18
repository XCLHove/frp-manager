import { defineMenu } from '@/menu'
import { h } from 'vue'
import { House } from '@element-plus/icons-vue'

export default defineMenu(() => {
  return {
    label: '首页',
    icon: () => h(House),
  }
})
