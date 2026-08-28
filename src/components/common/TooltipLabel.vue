<template>
  <span class="tooltip-label">
    <span v-if="required" class="required-star">*</span>
    <span class="label-text">{{ label }}</span>
    <el-tooltip :content="tooltip" placement="top" :show-after="200">
      <el-icon class="help-icon"><QuestionFilled /></el-icon>
    </el-tooltip>
  </span>
</template>
<script setup lang="ts">
import { QuestionFilled } from '@element-plus/icons-vue'
defineProps<{ label: string; tooltip: string; required?: boolean }>()
</script>
<style scoped>
.tooltip-label { display: inline-flex; align-items: center; gap: 4px; }
.required-star { color: var(--el-color-danger); font-size: 14px; }
.label-text { font-size: 13px; color: #606266; }
.help-icon { color: #c0c4cc; cursor: help; font-size: 14px; transition: color 0.2s; }
.help-icon:hover { color: var(--el-color-primary); }
</style>
