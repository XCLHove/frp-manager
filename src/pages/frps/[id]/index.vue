<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

onMounted(() => {
  console.log(useRoute().params)
})
</script>

<template>
  <div></div>
</template>

<style scoped></style>
