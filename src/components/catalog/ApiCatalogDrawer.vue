<template>
  <el-drawer v-model="visible" :title="isEdit ? '编辑 API' : '新建 API'" size="600px" :close-on-click-modal="false" @closed="resetForm">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="drawer-form">
      <!-- 必填字段 -->
      <div class="form-section-title">必填字段</div>

      <el-form-item prop="apiAction">
        <template #label><TooltipLabel label="API Action" tooltip="唯一业务标识符，格式：domain.resource.action，如 inventory.onhand.read，不随 URL 变化" required /></template>
        <el-input v-model="form.apiAction" placeholder="例如: inventory.onhand.read" maxlength="100" show-word-limit :disabled="isEdit" />
      </el-form-item>

      <el-row :gutter="12">
        <el-col :span="8">
          <el-form-item prop="method">
            <template #label><TooltipLabel label="HTTP Method" tooltip="该 API 的 HTTP 请求方法" required /></template>
            <el-select v-model="form.method" placeholder="选择" style="width:100%">
              <el-option v-for="m in METHODS" :key="m" :label="m" :value="m" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item prop="path">
            <template #label><TooltipLabel label="Path" tooltip="API 的 URL 路径，如 /api/v3/inventory/on-hand" required /></template>
            <el-input v-model="form.path" placeholder="/api/v3/..." maxlength="200" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item prop="businessDomain">
        <template #label><TooltipLabel label="业务域" tooltip="该 API 所属的业务模块，如 Inventory、Order、Billing" required /></template>
        <el-select v-model="form.businessDomain" placeholder="选择业务域" style="width:100%">
          <el-option v-for="d in BUSINESS_DOMAINS" :key="d" :label="d" :value="d" />
        </el-select>
      </el-form-item>

      <el-form-item prop="requiredBusinessPermissions">
        <template #label><TooltipLabel label="业务权限" tooltip="Portal SaaS 用户调用此 API 时需要持有的菜单/功能权限，如 MENU_INVENTORY" required /></template>
        <el-select v-model="form.requiredBusinessPermissions" multiple filterable allow-create placeholder="选择或输入权限标识" style="width:100%">
          <el-option v-for="p in PERMISSIONS" :key="p" :label="p" :value="p" />
        </el-select>
      </el-form-item>

      <el-form-item prop="allowedChannels">
        <template #label><TooltipLabel label="允许渠道" tooltip="哪些调用端允许调用此 API：P=Portal、E=External、O=Ontology、A=Agent，未声明渠道默认拒绝" required /></template>
        <el-checkbox-group v-model="form.allowedChannels">
          <el-checkbox value="PORTAL" label="Portal (P)" />
          <el-checkbox value="EXTERNAL" label="External (E)" />
          <el-checkbox value="ONTOLOGY" label="Ontology (O)" />
          <el-checkbox value="AGENT" label="Agent (A)" />
        </el-checkbox-group>
      </el-form-item>

      <el-form-item prop="riskLevel">
        <template #label><TooltipLabel label="风险等级" tooltip="L1=只读低风险，L2=普通操作，L3=重要写操作，L4=高风险操作（取消/审批/删除）" required /></template>
        <el-radio-group v-model="form.riskLevel">
          <el-radio value="L1"><el-tag type="success" size="small">L1 低</el-tag></el-radio>
          <el-radio value="L2"><el-tag type="primary" size="small">L2 中</el-tag></el-radio>
          <el-radio value="L3"><el-tag type="warning" size="small">L3 高</el-tag></el-radio>
          <el-radio value="L4"><el-tag type="danger" size="small">L4 极高</el-tag></el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item prop="dataDimensions">
        <template #label><TooltipLabel label="数据维度" tooltip="该 API 涉及的数据范围：T=Tenant、C=Customer、F=Facility（无 Facility 的 Billing API 可只选 T/C）" required /></template>
        <el-checkbox-group v-model="form.dataDimensions">
          <el-checkbox value="TENANT" label="Tenant (T)" />
          <el-checkbox value="CUSTOMER" label="Customer (C)" />
          <el-checkbox value="FACILITY" label="Facility (F)" />
        </el-checkbox-group>
      </el-form-item>

      <!-- 可选字段 -->
      <div class="form-section-title">可选字段</div>

      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item>
            <template #label><TooltipLabel label="AI Mode" tooltip="AI Agent/Ontology 调用此 API 时的限制：READ_ONLY=只读，CONFIRM=需确认，DENY=禁止 AI 调用" /></template>
            <el-select v-model="form.aiMode" style="width:100%">
              <el-option value="READ_ONLY" label="READ_ONLY（只读）" />
              <el-option value="CONFIRM" label="CONFIRM（需确认）" />
              <el-option value="DENY" label="DENY（禁止）" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item>
            <template #label><TooltipLabel label="负责人" tooltip="该 API 的业务负责团队或人员" /></template>
            <el-input v-model="form.owner" placeholder="如: inventory-team" maxlength="50" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <template #label><TooltipLabel label="生命周期状态" tooltip="Draft=草稿，Active=激活（可生产调用），Deprecated=已弃用，Retired=已退役" /></template>
        <el-select v-model="form.lifecycle" style="width:100%">
          <el-option value="DRAFT" label="Draft（草稿）" />
          <el-option value="ACTIVE" label="Active（激活）" />
          <el-option value="DEPRECATED" label="Deprecated（已弃用）" />
          <el-option value="RETIRED" label="Retired（已退役）" />
        </el-select>
      </el-form-item>

      <!-- OpenAPI YAML 预览 -->
      <div class="form-section-title">OpenAPI 扩展字段预览（自动生成）</div>
      <YamlPreview :entry="form" />
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="save" :loading="saving">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import type { ApiEntry } from '@/types'
import { useCatalogStore } from '@/stores/catalog'
import { BUSINESS_DOMAINS } from '@/mock/apiCatalog'
import TooltipLabel from '@/components/common/TooltipLabel.vue'
import YamlPreview from '@/components/common/YamlPreview.vue'

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const
const PERMISSIONS = ['MENU_INVENTORY', 'MENU_ORDER', 'MENU_SHIPMENT', 'MENU_BILLING', 'MENU_EXCEPTION', 'MENU_REPORT']

const props = defineProps<{ visible: boolean; editEntry?: ApiEntry | null }>()
const emit = defineEmits<{ 'update:visible': [v: boolean]; saved: [] }>()

const catalogStore = useCatalogStore()
const formRef = ref<FormInstance>()
const saving = ref(false)
const isEdit = computed(() => !!props.editEntry)

const visible = computed({
  get: () => props.visible,
  set: v => emit('update:visible', v)
})

const defaultForm = (): Omit<ApiEntry, 'id' | 'policyVersion' | 'createdAt' | 'updatedAt'> => ({
  apiAction: '', method: 'GET', path: '', businessDomain: '',
  requiredBusinessPermissions: [], allowedChannels: [],
  riskLevel: 'L1', dataDimensions: [], aiMode: 'READ_ONLY',
  owner: '', lifecycle: 'DRAFT'
})

const form = ref(defaultForm())

watch(() => props.editEntry, entry => {
  if (entry) {
    form.value = { ...entry }
  } else {
    form.value = defaultForm()
  }
}, { immediate: true })

const rules = {
  apiAction: [{ required: true, message: '请输入 API Action 标识', trigger: 'blur' }],
  method: [{ required: true, message: '请选择 HTTP Method', trigger: 'change' }],
  path: [{ required: true, message: '请输入 URL 路径', trigger: 'blur' }],
  businessDomain: [{ required: true, message: '请选择业务域', trigger: 'change' }],
  requiredBusinessPermissions: [{ type: 'array', min: 1, message: '至少选择一个业务权限', trigger: 'change' }],
  allowedChannels: [{ type: 'array', min: 1, message: '至少选择一个允许渠道', trigger: 'change' }],
  riskLevel: [{ required: true, message: '请选择风险等级', trigger: 'change' }],
  dataDimensions: [{ type: 'array', min: 1, message: '至少选择一个数据维度', trigger: 'change' }],
}

async function save() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  // 激活时检查发布红线
  if (form.value.lifecycle === 'ACTIVE' && isEdit.value && props.editEntry) {
    const missing = catalogStore.validateForActivation(props.editEntry.id)
    if (missing.length) {
      await ElMessageBox.alert(
        `<div class="red-line-alert">以下字段缺失，无法激活：<br/><strong>${missing.join('、')}</strong></div>`,
        '🚫 发布红线：字段缺失',
        { dangerouslyUseHTMLString: true, type: 'error' }
      )
      return
    }
  }

  saving.value = true
  try {
    if (isEdit.value && props.editEntry) {
      const result = catalogStore.update(props.editEntry.id, form.value)
      if (!result.ok) { ElMessage.error(result.error ?? '保存失败'); return }
    } else {
      const result = catalogStore.create(form.value)
      if (!result.ok) { ElMessage.error(result.error ?? '保存失败'); return }
    }
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    emit('saved')
  } finally {
    saving.value = false
  }
}

function resetForm() {
  form.value = defaultForm()
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.drawer-form { padding-bottom: 80px; }
.form-section-title {
  font-size: 12px;
  font-weight: 600;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 16px 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--el-border-color-lighter, #f0f0f0);
}
.form-section-title:first-child { margin-top: 0; }
</style>
