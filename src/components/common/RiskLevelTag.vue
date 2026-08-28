<template>
  <el-tag :type="types[level]" :size="size" effect="light" class="risk-tag">
    {{ level }}
    <span class="risk-label">{{ labels[level] }}</span>
  </el-tag>
</template>
<script setup lang="ts">
import type { RiskLevel } from '@/types'
withDefaults(defineProps<{ level: RiskLevel; size?: 'small' | 'default' }>(), { size: 'small' })
const types: Record<RiskLevel, string> = { L1: 'success', L2: 'primary', L3: 'warning', L4: 'danger' }
const labels: Record<RiskLevel, string> = { L1: '低', L2: '中', L3: '高', L4: '极高' }
</script>
<style scoped>
.risk-tag { font-weight: 600; }
.risk-label { margin-left: 2px; font-weight: 400; font-size: 11px; }
</style>
