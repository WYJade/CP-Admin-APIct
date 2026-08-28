<template>
  <el-drawer v-model="visible" :title="isEdit ? '编辑 AI Profile' : '新建 AI Profile'" size="720px" :close-on-click-modal="false">
    <el-form :model="form" label-position="top" class="drawer-form">
      <el-row :gutter="12">
        <el-col :span="16">
          <el-form-item>
            <template #label><TooltipLabel label="Profile 名称" tooltip="AI Profile 的唯一标识，如 AGENT_INVENTORY_ADVISOR" required /></template>
            <el-input v-model="form.name" placeholder="如: AGENT_INVENTORY_ADVISOR" maxlength="100" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item>
            <template #label><TooltipLabel label="类型" tooltip="Agent=会话式 AI 代理，Ontology=语义本体" required /></template>
            <el-radio-group v-model="form.profileType">
              <el-radio value="AGENT">🤖 Agent</el-radio>
              <el-radio value="ONTOLOGY">🧠 Ontology</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="描述此 AI Profile 的能力范围" />
      </el-form-item>

      <el-form-item>
        <template #label><TooltipLabel label="默认 AI Mode" tooltip="READ_ONLY=只读，CONFIRM=需确认，DENY=禁止。具体 Tool 可覆盖此默认值" required /></template>
        <el-radio-group v-model="form.defaultAiMode">
          <el-radio value="READ_ONLY"><el-tag type="success" size="small">READ_ONLY</el-tag></el-radio>
          <el-radio value="CONFIRM"><el-tag type="warning" size="small">CONFIRM</el-tag></el-radio>
          <el-radio value="DENY"><el-tag type="danger" size="small">DENY</el-tag></el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- Tool → Action 映射 -->
      <div class="form-section-title">
        Tool → Action 映射
        <el-tooltip content="定义 AI 可使用的工具及对应的 API Action，只能使用开放了 Agent 渠道的 Active API" placement="top">
          <el-icon style="margin-left:4px;color:#c0c4cc"><QuestionFilled /></el-icon>
        </el-tooltip>
        <el-button size="small" type="primary" text @click="addTool" style="margin-left:auto">
          <el-icon><Plus /></el-icon> 添加工具
        </el-button>
      </div>

      <div v-for="(tool, idx) in form.tools" :key="idx" class="tool-row">
        <div class="tool-row-header">
          <span class="tool-idx">工具 {{ idx + 1 }}</span>
          <el-button size="small" type="danger" text @click="removeTool(idx)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="工具名称">
              <el-input v-model="tool.toolName" placeholder="如: query_inventory" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="关联 API Actions">
              <el-select v-model="tool.apiActions" multiple filterable placeholder="选择 API Action" style="width:100%">
                <el-option v-for="api in agentApis" :key="api.id" :label="api.apiAction" :value="api.apiAction" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <template #label><TooltipLabel label="AI Mode 覆盖" tooltip="覆盖此工具的 AI Mode，空=继承 Profile 默认值" /></template>
              <el-select v-model="tool.aiModeOverride" clearable placeholder="继承默认" style="width:100%">
                <el-option value="READ_ONLY" label="READ_ONLY" />
                <el-option value="CONFIRM" label="CONFIRM" />
                <el-option value="DENY" label="DENY" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- DENY 警告 -->
        <el-alert v-if="tool.aiModeOverride === 'DENY'" type="warning" :closable="false" show-icon
          title="设置为 DENY 后，AI 将完全无法使用该工具，请确认此操作符合预期" />

        <!-- CONFIRM 确认策略 -->
        <template v-if="tool.aiModeOverride === 'CONFIRM' || (!tool.aiModeOverride && form.defaultAiMode === 'CONFIRM')">
          <div class="confirm-policy">
            <span class="policy-title">确认策略配置</span>
            <el-row :gutter="12" style="margin-top:8px">
              <el-col :span="8">
                <el-form-item label="最低风险等级">
                  <el-select v-model="getPolicy(tool).minRiskLevel" style="width:100%">
                    <el-option value="L2" label="L2 中" />
                    <el-option value="L3" label="L3 高" />
                    <el-option value="L4" label="L4 极高" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="审批超时（分钟）">
                  <el-input-number v-model="getPolicy(tool).timeoutMinutes" :min="1" :max="1440" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="超时动作">
                  <el-select v-model="getPolicy(tool).timeoutAction" style="width:100%">
                    <el-option value="AUTO_DENY" label="自动拒绝" />
                    <el-option value="AUTO_APPROVE" label="自动批准" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </template>
      </div>

      <el-empty v-if="!form.tools.length" description="暂无工具映射，点击上方「添加工具」" :image-size="60" />

      <!-- 无效 Action 警告 -->
      <el-alert v-if="invalidActions.length" type="error" :closable="false" show-icon
        :title="`以下 API 未开放 Agent 渠道，无法在 AI Profile 中使用：${invalidActions.join(', ')}`" />
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="save" :disabled="!!invalidActions.length">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Plus, Delete, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAIProfileStore } from '@/stores/aiProfile'
import { useCatalogStore } from '@/stores/catalog'
import type { AiCapabilityProfile, ToolActionBinding, RiskConfirmPolicy } from '@/types'
import TooltipLabel from '@/components/common/TooltipLabel.vue'

const props = defineProps<{ visible: boolean; editProfile?: AiCapabilityProfile | null }>()
const emit = defineEmits<{ 'update:visible': [v: boolean]; saved: [] }>()
const aiStore = useAIProfileStore()
const catalogStore = useCatalogStore()

const visible = computed({ get: () => props.visible, set: v => emit('update:visible', v) })
const isEdit = computed(() => !!props.editProfile)

const agentApis = computed(() =>
  catalogStore.entries.filter(e => e.lifecycle === 'ACTIVE' && e.allowedChannels.includes('AGENT'))
)

const invalidActions = computed(() => {
  const all: string[] = form.value.tools.flatMap(t => t.apiActions)
  return all.filter(a => {
    const e = catalogStore.getByAction(a)
    return !e || !e.allowedChannels.includes('AGENT')
  })
})

const defaultForm = (): Omit<AiCapabilityProfile, 'id' | 'createdAt' | 'updatedAt'> => ({
  name: '', profileType: 'AGENT', description: '', defaultAiMode: 'READ_ONLY',
  tools: [], status: 'ACTIVE'
})

const form = ref(defaultForm())

watch(() => props.editProfile, p => {
  form.value = p ? JSON.parse(JSON.stringify(p)) : defaultForm()
}, { immediate: true })

function addTool() {
  form.value.tools.push({ toolName: '', apiActions: [], aiModeOverride: null, confirmPolicy: null })
}

function removeTool(idx: number) {
  form.value.tools.splice(idx, 1)
}

function getPolicy(tool: ToolActionBinding): RiskConfirmPolicy {
  if (!tool.confirmPolicy) {
    tool.confirmPolicy = { minRiskLevel: 'L3', timeoutMinutes: 60, timeoutAction: 'AUTO_DENY' }
  }
  return tool.confirmPolicy
}

function save() {
  if (!form.value.name) { ElMessage.warning('请填写 Profile 名称'); return }
  if (isEdit.value && props.editProfile) {
    aiStore.update(props.editProfile.id, form.value)
  } else {
    aiStore.create(form.value)
  }
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
  emit('saved')
}
</script>

<style scoped>
.drawer-form { padding-bottom: 80px; }
.form-section-title { font-size: 13px; font-weight: 600; color: #606266; padding: 12px 0 8px; border-top: 1px solid #f0f0f0; margin-top: 8px; display: flex; align-items: center; }
.tool-row { background: #fafbfc; border: 1px solid #e4e7ed; border-radius: 6px; padding: 16px; margin-bottom: 12px; }
.tool-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.tool-idx { font-size: 12px; font-weight: 600; color: var(--el-color-primary); }
.confirm-policy { background: #fff8ec; border: 1px solid #ffd591; border-radius: 6px; padding: 12px; margin-top: 8px; }
.policy-title { font-size: 12px; font-weight: 600; color: #e6a23c; }
</style>
