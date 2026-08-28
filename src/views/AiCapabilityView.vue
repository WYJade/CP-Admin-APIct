<template>
  <div class="ai-view">
    <div class="page-header">
      <div>
        <h2>AI 能力档案管理</h2>
        <p>配置 Agent 和 Ontology 的能力档案，AI 的有效权限是 Actor 能力与 Subject 业务权限的交集</p>
      </div>
      <el-button type="primary" @click="openDrawer(null)">
        <el-icon><Plus /></el-icon> 新建 AI Profile
      </el-button>
    </div>

    <!-- Profile 列表 -->
    <el-table :data="aiStore.profiles" stripe border row-key="id" style="width:100%">
      <el-table-column label="Profile 名称" min-width="200">
        <template #default="{ row }">
          <code class="profile-name">{{ row.name }}</code>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="110">
        <template #default="{ row }">
          <el-tag :type="row.profileType === 'AGENT' ? '' : 'warning'" size="small">
            {{ row.profileType === 'AGENT' ? '🤖 Agent' : '🧠 Ontology' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Tool 数量" width="90">
        <template #default="{ row }">
          <el-tag type="info" size="small">{{ row.tools.length }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="默认 AI Mode" width="140">
        <template #default="{ row }">
          <el-tag :type="modeTypes[row.defaultAiMode]" size="small">{{ row.defaultAiMode }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="AI Mode 分布" width="180">
        <template #default="{ row }">
          <div class="mode-dist">
            <span v-for="(count, mode) in aiStore.getModeDistribution(row.id)" :key="mode" v-if="count > 0">
              <el-tag :type="modeTypes[mode as AiMode]" size="small" style="margin-right:4px">{{ mode.slice(0,1) }}:{{ count }}</el-tag>
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }"><StatusBadge :status="row.status" /></template>
      </el-table-column>
      <el-table-column label="更新时间" width="110">
        <template #default="{ row }">{{ row.updatedAt.slice(0, 10) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" text @click="openDrawer(row)">编辑</el-button>
          <el-button size="small" text @click="exportProfile(row)">导出</el-button>
          <el-popconfirm title="确认删除此 AI Profile？" @confirm="aiStore.remove(row.id)">
            <template #reference>
              <el-button size="small" type="danger" text>删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- AI Profile 抽屉 -->
    <AiProfileDrawer v-model:visible="drawerVisible" :edit-profile="editProfile" @saved="drawerVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAIProfileStore } from '@/stores/aiProfile'
import type { AiCapabilityProfile, AiMode } from '@/types'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AiProfileDrawer from '@/components/ai-capability/AiProfileDrawer.vue'

const aiStore = useAIProfileStore()
const drawerVisible = ref(false)
const editProfile = ref<AiCapabilityProfile | null>(null)

const modeTypes: Record<AiMode, string> = { READ_ONLY: 'success', CONFIRM: 'warning', DENY: 'danger' }

function openDrawer(p: AiCapabilityProfile | null) {
  editProfile.value = p
  drawerVisible.value = true
}

function exportProfile(p: AiCapabilityProfile) {
  const json = aiStore.exportConfig(p.id)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${p.name}-config.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('配置已导出')
}
</script>

<style scoped>
.ai-view { display: flex; flex-direction: column; gap: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-header h2 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.page-header p { font-size: 13px; color: #909399; }
.profile-name { font-family: monospace; font-size: 12px; color: var(--el-color-primary); }
.mode-dist { display: flex; flex-wrap: wrap; gap: 2px; }
</style>
