<template>
  <el-drawer v-model="visible" :title="isEdit ? '编辑集成档案' : '新建集成档案'" size="680px" :close-on-click-modal="false">
    <el-form :model="form" label-position="top" class="drawer-form">
      <el-form-item label="所属应用" required>
        <el-select v-model="form.appId" placeholder="选择外部应用" style="width:100%" :disabled="isEdit">
          <el-option v-for="app in integrationStore.apps" :key="app.id" :label="app.name" :value="app.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <template #label><TooltipLabel label="档案名称" tooltip="Integration Profile 的标识名，如 EXT_INVENTORY_READONLY" required /></template>
        <el-input v-model="form.name" placeholder="如: EXT_INVENTORY_READONLY" maxlength="100" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" maxlength="500" show-word-limit placeholder="描述此集成档案的业务场景" />
      </el-form-item>

      <el-form-item>
        <template #label><TooltipLabel label="Profile Actions" tooltip="该档案允许外部应用调用的 API Action 列表，只能选择开放了 External 渠道的 Active API" required /></template>
        <el-select v-model="selectedActions" multiple filterable placeholder="选择 API Action" style="width:100%" @change="syncActions">
          <el-option v-for="api in externalApis" :key="api.id" :label="api.apiAction" :value="api.apiAction">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <code>{{ api.apiAction }}</code>
              <RiskLevelTag :level="api.riskLevel" size="small" />
            </div>
          </el-option>
        </el-select>
        <div v-if="invalidActions.length" class="invalid-warn">
          <el-icon><Warning /></el-icon> 以下 API 未开放 External 渠道：{{ invalidActions.join(', ') }}
        </div>
      </el-form-item>

      <el-form-item>
        <template #label><TooltipLabel label="Data Scope" tooltip="该档案的数据访问维度：T=Tenant、C=Customer、F=Facility" required /></template>
        <el-checkbox-group v-model="form.dataScope">
          <el-checkbox value="TENANT" label="Tenant (T)" />
          <el-checkbox value="CUSTOMER" label="Customer (C)" />
          <el-checkbox value="FACILITY" label="Facility (F)" />
        </el-checkbox-group>
      </el-form-item>

      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item>
            <template #label><TooltipLabel label="认证方式" tooltip="外部应用调用时使用的凭证类型" /></template>
            <el-radio-group v-model="form.credentialType">
              <el-radio value="API_KEY">API Key</el-radio>
              <el-radio value="OAUTH2">OAuth 2.0</el-radio>
              <el-radio value="MTLS">mTLS</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item>
            <template #label><TooltipLabel label="QPS 限制" tooltip="每秒最大请求数" /></template>
            <el-input-number v-model="form.qpsLimit" :min="1" :max="10000" style="width:100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label><TooltipLabel label="日调用配额" tooltip="每天最大调用次数" /></template>
            <el-input-number v-model="form.dailyQuota" :min="100" :max="1000000" style="width:100%" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="save" :disabled="!!invalidActions.length">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useIntegrationStore } from '@/stores/integration'
import { useCatalogStore } from '@/stores/catalog'
import type { IntegrationProfile } from '@/types'
import TooltipLabel from '@/components/common/TooltipLabel.vue'
import RiskLevelTag from '@/components/common/RiskLevelTag.vue'

const props = defineProps<{ visible: boolean; editProfile?: IntegrationProfile | null }>()
const emit = defineEmits<{ 'update:visible': [v: boolean]; saved: [] }>()
const integrationStore = useIntegrationStore()
const catalogStore = useCatalogStore()

const visible = computed({ get: () => props.visible, set: v => emit('update:visible', v) })
const isEdit = computed(() => !!props.editProfile)
const selectedActions = ref<string[]>([])

const defaultForm = () => ({
  appId: '', name: '', description: '',
  actions: [] as { apiAction: string; dataDimensionOverride: null }[],
  dataScope: ['TENANT', 'CUSTOMER', 'FACILITY'] as any[],
  credentialType: 'OAUTH2' as const,
  qpsLimit: 100, dailyQuota: 10000, status: 'ACTIVE' as const
})

const form = ref(defaultForm())

const externalApis = computed(() =>
  catalogStore.entries.filter(e => e.lifecycle === 'ACTIVE' && e.allowedChannels.includes('EXTERNAL'))
)

const invalidActions = computed(() =>
  selectedActions.value.filter(a => {
    const entry = catalogStore.getByAction(a)
    return !entry || !entry.allowedChannels.includes('EXTERNAL')
  })
)

watch(() => props.editProfile, p => {
  if (p) {
    form.value = { ...p }
    selectedActions.value = p.actions.map(a => a.apiAction)
  } else {
    form.value = defaultForm()
    selectedActions.value = []
  }
}, { immediate: true })

function syncActions() {
  form.value.actions = selectedActions.value.map(a => ({ apiAction: a, dataDimensionOverride: null }))
}

function save() {
  if (!form.value.appId || !form.value.name || !selectedActions.value.length) {
    ElMessage.warning('请填写必填字段')
    return
  }
  syncActions()
  if (isEdit.value && props.editProfile) {
    integrationStore.updateProfile(props.editProfile.id, form.value)
  } else {
    integrationStore.createProfile(form.value)
  }
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
  emit('saved')
}
</script>

<style scoped>
.drawer-form { padding-bottom: 80px; }
.invalid-warn { display: flex; align-items: center; gap: 6px; color: var(--el-color-danger); font-size: 12px; margin-top: 6px; }
</style>
