<template>
  <div class="yaml-wrapper">
    <div class="yaml-header">
      <span class="yaml-title">OpenAPI 扩展字段预览</span>
      <el-button size="small" text @click="copy">
        <el-icon><CopyDocument /></el-icon> 复制
      </el-button>
    </div>
    <pre class="yaml-code">{{ yaml }}</pre>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { ApiEntry } from '@/types'
import { generateOpenApiYaml } from '@/mock/apiCatalog'
const props = defineProps<{ entry: Partial<ApiEntry> }>()
const yaml = computed(() => generateOpenApiYaml(props.entry))
function copy() {
  navigator.clipboard.writeText(yaml.value).then(() => ElMessage.success('已复制到剪贴板'))
}
</script>
<style scoped>
.yaml-wrapper { border: 1px solid #e4e7ed; border-radius: 6px; overflow: hidden; }
.yaml-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8f9fa; border-bottom: 1px solid #e4e7ed; }
.yaml-title { font-size: 12px; font-weight: 600; color: #606266; }
.yaml-code { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.7; background: #1e1e2e; color: #cdd6f4; padding: 14px 16px; margin: 0; white-space: pre; overflow-x: auto; }
</style>
