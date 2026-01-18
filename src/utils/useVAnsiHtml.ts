import { type Directive } from 'vue'
import { ansiToHtml } from '@/utils/ansiToHtml.ts'

export const useVAnsiHtml = () => {
  const vAnsiHtml: Directive<HTMLElement, string> = {
    mounted(el, binding) {
      el.innerHTML = ansiToHtml(binding.value)
    },
    updated(el, binding) {
      el.innerHTML = ansiToHtml(binding.value)
    },
  }
  return vAnsiHtml
}
