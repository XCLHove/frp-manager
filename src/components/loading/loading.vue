<script setup lang="ts">
type LoadingProps = {
  text?: string
}

const props = withDefaults(defineProps<LoadingProps>(), {
  text: '加载中...',
})
</script>

<template>
  <div class="w-full h-full" v-loading="true" :element-loading-text="props.text"></div>
</template>

<style scoped lang="scss"></style>
