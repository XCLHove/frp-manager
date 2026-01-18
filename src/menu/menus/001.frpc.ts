import { defineMenu } from '@/menu'
import useFrpStore from '@/stores/useFrpStore.ts'
import { storeToRefs } from 'pinia'

export default defineMenu(() => {
  const frpStore = useFrpStore()
  const { frpcList } = storeToRefs(frpStore)
  return {
    label: 'FRPC',
    isDirectory: true,
    children: frpcList.value.map((item) => ({
      label: item.name,
      path: `/frpc/${item.id}`,
    })),
  }
})
