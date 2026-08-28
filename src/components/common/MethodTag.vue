<template>
  <el-tag :color="colors[method]?.bg" :style="{ color: colors[method]?.text, border: 'none' }" size="small" class="method-tag">
    {{ method }}
  </el-tag>
</template>
<script setup lang="ts">
import type { HttpMethod } from '@/types'
defineProps<{ method: HttpMethod }>()
const colors: Record<HttpMethod, { bg: string; text: string }> = {
  GET: { bg: '#e8f5e9', text: '#2e7d32' },
  POST: { bg: '#e3f2fd', text: '#1565c0' },
  PUT: { bg: '#fff3e0', text: '#e65100' },
  PATCH: { bg: '#f3e5f5', text: '#6a1b9a' },
  DELETE: { bg: '#ffebee', text: '#c62828' },
}
</script>
<style scoped>
.method-tag { font-family: monospace; font-weight: 600; min-width: 52px; text-align: center; }
</style>
