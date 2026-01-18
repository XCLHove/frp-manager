import { defineMenu } from '@/menu'
import useFrpStore from '@/stores/useFrpStore.ts'
import { storeToRefs } from 'pinia'

export default defineMenu(() => {
  const frpStore = useFrpStore()
  const { frpsList } = storeToRefs(frpStore)
  return {
    label: 'FRPS',
    isDirectory: true,
    children: frpsList.value.map((item) => ({
      label: item.name,
      path: `/frpc/${item.id}`,
    })),
  }
})
