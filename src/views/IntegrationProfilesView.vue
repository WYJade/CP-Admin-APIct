<template>
  <div class="profiles-view">
    <div class="page-header">
      <div>
        <h2>集成档案管理</h2>
        <p>为外部应用定义可调用的 API 场景，申请的是业务场景而非具体接口</p>
      </div>
      <el-button type="primary" @click="openDrawer(null)">
        <el-icon><Plus /></el-icon> 新建集成档案
      </el-button>
    </div>

    <!-- 应用筛选 -->
    <div class="filter-card">
      <el-select v-model="filterApp" placeholder="筛选应用" clearable style="width:200px">
        <el-option v-for="app in integrationStore.apps" :key="app.id" :label="app.name" :value="app.id" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="状态" clearable style="width:140px">
        <el-option value="ACTIVE" label="激活" />
        <el-option value="INACTIVE" label="停用" />
      </el-select>
    </div>

    <!-- Profile 列表 -->
    <div class="profile-list">
      <div v-for="profile in filteredProfiles" :key="profile.id" class="profile-card">
        <div class="profile-header">
          <div class="profile-name-row">
            <code class="profile-name">{{ profile.name }}</code>
            <StatusBadge :status="profile.status" />
          </div>
          <div class="profile-app">所属应用：{{ getAppName(profile.appId) }}</div>
          <p class="profile-desc">{{ profile.description }}</p>
        </div>
        <div class="profile-meta">
          <div class="meta-item">
            <span class="meta-label">API Actions</span>
            <span class="meta-value">{{ profile.actions.length }} 个</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Credential</span>
            <span class="meta-value">{{ profile.credentialType }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">QPS 限制</span>
            <span class="meta-value">{{ profile.qpsLimit }}/s</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">7天调用</span>
            <span class="meta-value">{{ profile.last7DayCalls.toLocaleString() }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">成功率</span>
            <span class="meta-value" :class="{ 'success-rate-good': profile.successRate >= 99 }">
              {{ profile.successRate }}%
            </span>
          </div>
        </div>
        <div class="profile-actions-row">
          <el-button size="small" @click="openDrawer(profile)">编辑</el-button>
          <el-button size="small" @click="integrationStore.cloneProfile(profile.id); ElMessage.success('已复制')">复制档案</el-button>
          <el-button v-if="profile.status === 'ACTIVE'" size="small" type="warning" @click="deactivate(profile.id)">禁用</el-button>
          <el-button v-else size="small" type="success" @click="integrationStore.updateProfile(profile.id, { status: 'ACTIVE' })">启用</el-button>
        </div>
      </div>
      <el-empty v-if="!filteredProfiles.length" description="暂无集成档案" />
    </div>

    <!-- Profile 配置抽屉 -->
    <ProfileDrawer v-model:visible="drawerVisible" :edit-profile="editProfile" @saved="drawerVisible = false" />

    <!-- 禁用确认 -->
    <ConfirmDialog
      v-model="showDeactivateDialog"
      message="禁用后，使用该 Profile 的外部应用将立即无法调用关联 API"
      detail="请确认此操作不会中断正在运行的集成业务。"
      type="danger"
      confirm-text="确认禁用"
      @confirm="doDeactivate"
      @cancel="showDeactivateDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useIntegrationStore } from '@/stores/integration'
import type { IntegrationProfile } from '@/types'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import ProfileDrawer from '@/components/integration/ProfileDrawer.vue'

const integrationStore = useIntegrationStore()
const route = useRoute()
const filterApp = ref('')
const filterStatus = ref('')
const drawerVisible = ref(false)
const editProfile = ref<IntegrationProfile | null>(null)
const showDeactivateDialog = ref(false)
const deactivatingId = ref('')

onMounted(() => {
  if (route.query.appId) filterApp.value = route.query.appId as string
})

const filteredProfiles = computed(() => {
  return integrationStore.profiles.filter(p => {
    if (filterApp.value && p.appId !== filterApp.value) return false
    if (filterStatus.value && p.status !== filterStatus.value) return false
    return true
  })
})

function getAppName(appId: string) {
  return integrationStore.apps.find(a => a.id === appId)?.name ?? appId
}

function openDrawer(profile: IntegrationProfile | null) {
  editProfile.value = profile
  drawerVisible.value = true
}

function deactivate(id: string) {
  deactivatingId.value = id
  showDeactivateDialog.value = true
}

function doDeactivate() {
  integrationStore.deactivateProfile(deactivatingId.value)
  ElMessage.success('已禁用')
  showDeactivateDialog.value = false
}
</script>

<style scoped>
.profiles-view { display: flex; flex-direction: column; gap: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-header h2 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.page-header p { font-size: 13px; color: #909399; }
.filter-card { background: #fff; border: 1px solid var(--card-border); border-radius: 8px; padding: 14px 20px; display: flex; gap: 12px; }
.profile-list { display: flex; flex-direction: column; gap: 12px; }
.profile-card { background: #fff; border: 1px solid var(--card-border); border-radius: 8px; padding: 20px; }
.profile-header { margin-bottom: 12px; }
.profile-name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.profile-name { font-family: monospace; font-size: 14px; font-weight: 600; color: var(--el-color-primary); }
.profile-app { font-size: 12px; color: #909399; margin-bottom: 4px; }
.profile-desc { font-size: 13px; color: #606266; }
.profile-meta { display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 14px; padding: 12px 16px; background: #fafbfc; border-radius: 6px; }
.meta-item { display: flex; flex-direction: column; gap: 2px; }
.meta-label { font-size: 11px; color: #909399; }
.meta-value { font-size: 14px; font-weight: 600; color: #303133; }
.success-rate-good { color: var(--risk-l1-color); }
.profile-actions-row { display: flex; gap: 8px; }
</style>
