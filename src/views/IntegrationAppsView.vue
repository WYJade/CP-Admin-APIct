<template>
  <div class="integration-view">
    <div class="page-header">
      <div>
        <h2>外部应用管理</h2>
        <p>注册和管理外部系统集成，通过 Integration Profile 控制外部应用可调用的 API 范围</p>
      </div>
      <el-button type="primary" @click="showNewAppDialog = true">
        <el-icon><Plus /></el-icon> 注册外部应用
      </el-button>
    </div>

    <!-- 应用卡片网格 -->
    <div class="app-grid">
      <div v-for="app in integrationStore.apps" :key="app.id" class="app-card">
        <div class="app-card-header">
          <div class="app-icon">🔌</div>
          <div class="app-info">
            <div class="app-name">{{ app.name }}</div>
            <div class="app-sp">
              <code>{{ app.servicePrincipalId }}</code>
              <el-button size="small" text @click="copyText(app.servicePrincipalId)">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </div>
          <StatusBadge :status="app.status" />
        </div>
        <div class="app-desc">{{ app.description }}</div>
        <div class="app-stats">
          <span>{{ integrationStore.getProfilesByApp(app.id).length }} 个 Profile</span>
          <span>更新: {{ formatDate(app.updatedAt) }}</span>
        </div>
        <div class="app-actions">
          <el-button size="small" @click="viewProfiles(app.id)">查看集成档案</el-button>
          <el-popconfirm title="确认删除此应用及所有 Profile？" type="danger" @confirm="integrationStore.removeApp(app.id)">
            <template #reference>
              <el-button size="small" type="danger" plain>删除</el-button>
            </template>
          </el-popconfirm>
        </div>
      </div>
    </div>

    <!-- 新建应用 Dialog -->
    <el-dialog v-model="showNewAppDialog" title="注册外部应用" width="480px" append-to-body>
      <el-form :model="newAppForm" label-position="top">
        <el-form-item label="应用名称" required>
          <el-input v-model="newAppForm.name" placeholder="如: ACME BI Platform" />
        </el-form-item>
        <el-form-item label="Service Principal ID" required>
          <el-input v-model="newAppForm.servicePrincipalId" placeholder="如: sp-acme-bi-prod" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newAppForm.description" type="textarea" :rows="2" placeholder="简要描述应用用途" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNewAppDialog = false">取消</el-button>
        <el-button type="primary" @click="createApp">注册</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useIntegrationStore } from '@/stores/integration'
import StatusBadge from '@/components/common/StatusBadge.vue'

const integrationStore = useIntegrationStore()
const router = useRouter()
const showNewAppDialog = ref(false)
const newAppForm = ref({ name: '', servicePrincipalId: '', description: '', status: 'ACTIVE' as const })

function formatDate(d: string) {
  return d.slice(0, 10)
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => ElMessage.success('已复制'))
}

function viewProfiles(appId: string) {
  router.push({ path: '/integration/profiles', query: { appId } })
}

function createApp() {
  if (!newAppForm.value.name || !newAppForm.value.servicePrincipalId) {
    ElMessage.warning('请填写必填字段')
    return
  }
  integrationStore.createApp({ ...newAppForm.value })
  ElMessage.success('注册成功')
  showNewAppDialog.value = false
  newAppForm.value = { name: '', servicePrincipalId: '', description: '', status: 'ACTIVE' }
}
</script>

<style scoped>
.integration-view { display: flex; flex-direction: column; gap: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-header h2 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.page-header p { font-size: 13px; color: #909399; }
.app-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.app-card { background: #fff; border: 1px solid var(--card-border); border-radius: 8px; padding: 20px; box-shadow: var(--card-shadow); transition: box-shadow 0.2s; }
.app-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
.app-card-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
.app-icon { font-size: 28px; }
.app-info { flex: 1; }
.app-name { font-size: 15px; font-weight: 600; color: #303133; }
.app-sp { display: flex; align-items: center; gap: 4px; margin-top: 2px; }
.app-sp code { font-family: monospace; font-size: 11px; color: #606266; background: #f5f5f5; padding: 1px 6px; border-radius: 3px; }
.app-desc { font-size: 13px; color: #606266; margin-bottom: 10px; line-height: 1.5; }
.app-stats { display: flex; justify-content: space-between; font-size: 12px; color: #909399; margin-bottom: 14px; }
.app-actions { display: flex; gap: 8px; }
</style>
