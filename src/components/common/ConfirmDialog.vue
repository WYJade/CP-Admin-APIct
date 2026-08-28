<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="460px"
    :close-on-click-modal="false"
    append-to-body
  >
    <div class="confirm-content">
      <el-icon class="confirm-icon" :class="type"><component :is="icons[type]" /></el-icon>
      <div class="confirm-message">
        <p class="confirm-main">{{ message }}</p>
        <p v-if="detail" class="confirm-detail">{{ detail }}</p>
        <slot />
      </div>
    </div>
    <template #footer>
      <el-button @click="emit('cancel')">取消</el-button>
      <el-button :type="type === 'danger' ? 'danger' : 'primary'" @click="emit('confirm')">{{ confirmText }}</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { WarningFilled, InfoFilled, CircleCheckFilled } from '@element-plus/icons-vue'
const props = withDefaults(defineProps<{
  modelValue: boolean; title?: string; message: string;
  detail?: string; type?: 'warning' | 'danger' | 'info'; confirmText?: string
}>(), { title: '确认操作', type: 'warning', confirmText: '确认' })
const emit = defineEmits<{ 'update:modelValue': [v: boolean]; confirm: []; cancel: [] }>()
const visible = computed({ get: () => props.modelValue, set: v => emit('update:modelValue', v) })
const icons = { warning: WarningFilled, danger: WarningFilled, info: InfoFilled }
</script>
<style scoped>
.confirm-content { display: flex; gap: 16px; align-items: flex-start; }
.confirm-icon { font-size: 28px; flex-shrink: 0; margin-top: 2px; }
.confirm-icon.warning, .confirm-icon.danger { color: var(--el-color-warning); }
.confirm-icon.danger { color: var(--el-color-danger); }
.confirm-icon.info { color: var(--el-color-primary); }
.confirm-main { font-size: 14px; color: #303133; line-height: 1.6; }
.confirm-detail { font-size: 12px; color: #909399; margin-top: 6px; line-height: 1.5; }
</style>
