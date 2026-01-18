import { defineStore } from 'pinia'
import { ref } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const useElementPlusStore = defineStore('elementPlus', () => {
  const locale = ref(zhCn)
  const buttonConfig = ref({
    plain: true,
  })
  const messageConfig = ref({
    duration: 1000 * 3,
  })

  return {
    buttonConfig,
    locale,
    messageConfig,
  }
})
export default useElementPlusStore
