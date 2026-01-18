import { defineStore } from 'pinia'
import { onMounted, ref } from 'vue'
import { Frpc, Frps } from 'FrpManager'
import { readConfigApi, writeConfigApi } from '@/invoke-apis/frp-manager.ts'
import { ElMessage } from 'element-plus'

const useFrpStore = defineStore('frpc', () => {
  const frpcList = ref<Frpc[]>([])
  const frpsList = ref<Frps[]>([])

  setTimeout(() => {
    refresh()
  })

  function save() {
    return writeConfigApi(
      JSON.stringify(
        {
          frpc: frpcList.value,
          frps: frpsList.value,
        },
        null,
        4,
      ),
    )
  }

  async function refresh() {
    await readConfigApi()
      .then((json) => {
        const config = JSON.parse(json)
        frpcList.value = config.frpc
        frpsList.value = config.frps
      })
      .catch((e) => {
        ElMessage.error(`${e?.message || e}`)
        throw e
      })
  }

  return {
    frpcList,
    frpsList,
    save,
    refresh,
  }
})

export default useFrpStore
