<script setup lang="ts">
import { onUnmounted, ref, shallowRef, watch } from 'vue'
import { OverflowTooltipTextProps, OverflowTooltipTextSlots } from './type.ts'

const props = withDefaults(defineProps<OverflowTooltipTextProps>(), {
  text: '',
})
defineSlots<OverflowTooltipTextSlots>()

const containerRef = shallowRef<HTMLDivElement>()
const contentRef = shallowRef<HTMLDivElement>()

const disableTooltip = ref(true)
let resizeObserver: ResizeObserver | null = null

watch(
  () => contentRef.value,
  (contentDiv) => {
    if (!contentDiv) {
      disableTooltip.value = true
      resizeObserver?.disconnect()
      return
    }

    resizeObserver = new ResizeObserver(() => updateDisableTooltip())
    resizeObserver.observe(contentDiv)
  },
)

onUnmounted(() => resizeObserver?.disconnect())

function updateDisableTooltip() {
  if (!contentRef.value || !containerRef.value) {
    disableTooltip.value = true
    return
  }
  disableTooltip.value = contentRef.value!.scrollWidth <= containerRef.value!.clientWidth
}
</script>

<template>
  <el-tooltip placement="top" v-bind="props.tooltipProps" :disabled="disableTooltip">
    <template #default>
      <div ref="containerRef" class="overflow-tooltip-text">
        <div ref="contentRef" class="overflow-tooltip-text__content">
          <slot v-if="$slots['default']" v-bind="{ text: props.text }"></slot>
          <template v-else>
            <el-text>{{ props.text }}</el-text>
          </template>
        </div>
      </div>
    </template>

    <template #content>
      <slot v-if="$slots['content']" name="content" v-bind="{ text: props.text }"></slot>
      <template v-else>
        {{ props.text }}
      </template>
    </template>
  </el-tooltip>
</template>

<style scoped lang="scss">
.overflow-tooltip-text {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  .overflow-tooltip-text__content {
    width: fit-content;
  }
}
</style>
