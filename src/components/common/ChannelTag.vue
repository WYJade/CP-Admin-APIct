<template>
  <el-tag
    v-for="ch in channels"
    :key="ch"
    size="small"
    :color="colors[ch]?.bg"
    :style="{ color: colors[ch]?.text, border: 'none', marginRight: '4px' }"
    class="channel-tag"
  >
    {{ labels[ch] }}
  </el-tag>
</template>
<script setup lang="ts">
import type { Channel } from '@/types'
defineProps<{ channels: Channel[] }>()
const labels: Record<Channel, string> = { PORTAL: 'P', EXTERNAL: 'E', ONTOLOGY: 'O', AGENT: 'A' }
const colors: Record<Channel, { bg: string; text: string }> = {
  PORTAL: { bg: '#ede9f5', text: '#7B5EA7' },
  EXTERNAL: { bg: '#ecf5ff', text: '#409eff' },
  ONTOLOGY: { bg: '#f0f9eb', text: '#67c23a' },
  AGENT: { bg: '#fdf6ec', text: '#e6a23c' },
}
</script>
<style scoped>
.channel-tag { font-weight: 600; font-size: 11px; letter-spacing: 0.5px; }
</style>
