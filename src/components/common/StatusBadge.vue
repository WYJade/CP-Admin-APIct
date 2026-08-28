<template>
  <el-tag :type="config[status]?.type ?? 'info'" size="small" effect="light">
    {{ config[status]?.label ?? status }}
  </el-tag>
</template>
<script setup lang="ts">
defineProps<{ status: string }>()
const config: Record<string, { type: string; label: string }> = {
  ACTIVE: { type: 'success', label: '激活' },
  INACTIVE: { type: 'info', label: '停用' },
  DRAFT: { type: 'warning', label: '草稿' },
  DEPRECATED: { type: 'warning', label: '已弃用' },
  RETIRED: { type: 'danger', label: '已停用' },
  PORTAL_USER: { type: 'primary', label: 'Portal 用户' },
  EXTERNAL_APP: { type: '', label: '外部应用' },
  AI_AGENT: { type: 'warning', label: 'AI Agent' },
}
</script>
