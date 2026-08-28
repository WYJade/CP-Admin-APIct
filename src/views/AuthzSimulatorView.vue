<template>
  <div class="simulator-view">
    <div class="page-header">
      <div>
        <h2>授权模拟器</h2>
        <p>验证特定用户或应用调用特定 API 时的权限计算结果，无需理解 API 或策略 DSL</p>
      </div>
    </div>

    <div class="simulator-body">
      <!-- 左侧输入面板 -->
      <div class="input-panel">
        <div class="panel-title">模拟输入</div>

        <!-- 预设场景 -->
        <div class="presets">
          <div class="presets-label">快速填充场景：</div>
          <div class="preset-btns">
            <el-button size="small" @click="loadPreset('inventory-query')">📦 库存查询</el-button>
            <el-button size="small" @click="loadPreset('order-query')">📋 订单查询</el-button>
            <el-button size="small" @click="loadPreset('order-update')">✏️ 订单操作</el-button>
            <el-button size="small" @click="loadPreset('billing-query')">💰 账单查询</el-button>
          </div>
        </div>

        <el-form :model="input" label-position="top" size="default">
          <el-form-item>
            <template #label><TooltipLabel label="调用方类型" tooltip="Portal User=SaaS 页面用户，External App=外部系统，AI Agent=AI 代理" required /></template>
            <el-radio-group v-model="input.callerType" class="caller-type-group">
              <el-radio value="PORTAL_USER">🖥 Portal User</el-radio>
              <el-radio value="EXTERNAL_APP">🔌 External App</el-radio>
              <el-radio value="AI_AGENT">🤖 AI Agent</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <template #label><TooltipLabel label="调用方标识" tooltip="用户 ID、应用 Service Principal ID 或 Agent ID" required /></template>
            <el-input v-model="input.callerId" :placeholder="callerIdPlaceholder" />
          </el-form-item>

          <el-form-item>
            <template #label><TooltipLabel label="目标 API Action" tooltip="要模拟调用的 API Action 标识" required /></template>
            <el-select v-model="input.apiAction" filterable placeholder="选择 API Action" style="width:100%">
              <el-option v-for="api in catalogStore.entries" :key="api.id" :label="api.apiAction" :value="api.apiAction">
                <div style="display:flex;justify-content:space-between">
                  <code>{{ api.apiAction }}</code>
                  <RiskLevelTag :level="api.riskLevel" size="small" />
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item>
            <template #label><TooltipLabel label="目标 Tenant" tooltip="请求访问的 Tenant（租户隔离，跨 Tenant 直接拒绝）" required /></template>
            <el-select v-model="input.tenant" placeholder="选择 Tenant" style="width:100%">
              <el-option value="T1" label="T1 - Tenant One" />
              <el-option value="T2" label="T2 - Tenant Two" />
              <el-option value="T99" label="T99 - 未授权 Tenant（测试拒绝）" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <template #label><TooltipLabel label="目标 Customer（可选）" tooltip="请求访问的客户集合，留空则不进行 Customer 维度校验" /></template>
            <el-select v-model="input.customers" multiple placeholder="选择 Customer（可留空）" style="width:100%">
              <el-option v-for="c in ['C1','C2','C3','C99']" :key="c" :label="c === 'C99' ? 'C99 - 未授权 Customer（测试拒绝）' : c" :value="c" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <template #label><TooltipLabel label="目标 Facility（可选）" tooltip="请求访问的仓库集合，留空则不进行 Facility 维度校验" /></template>
            <el-select v-model="input.facilities" multiple placeholder="选择 Facility（可留空）" style="width:100%">
              <el-option v-for="f in ['F1','F2','F3','F4','F99']" :key="f" :label="f === 'F99' ? 'F99 - 未授权 Facility（测试拒绝）' : f" :value="f" />
            </el-select>
          </el-form-item>

          <el-button type="primary" @click="runSimulate" :loading="running" style="width:100%">
            <el-icon><VideoPlay /></el-icon> 运行模拟
          </el-button>
        </el-form>
      </div>

      <!-- 右侧决策结果面板 -->
      <div class="trace-panel">
        <div class="panel-title">Decision Trace</div>

        <template v-if="result">
          <!-- 步骤列表 -->
          <div class="steps">
            <div
              v-for="step in result.steps"
              :key="step.stepId"
              class="step-card"
              :class="[`step-${step.result.toLowerCase()}`, { 'step-failed': step.result === 'FAIL' }]"
            >
              <div class="step-header">
                <div class="step-id">{{ step.stepId }}</div>
                <div class="step-name">{{ step.stepName }}</div>
                <div class="step-badge" :class="step.result.toLowerCase()">
                  {{ step.result === 'PASS' ? '✓ PASS' : step.result === 'FAIL' ? '✗ FAIL' : '— SKIP' }}
                </div>
              </div>
              <div class="step-evidence">{{ step.evidence }}</div>
              <div class="step-desc">{{ step.description }}</div>
              <div v-if="step.fixSuggestion" class="step-fix">
                <el-icon><Pointer /></el-icon> 修复建议：{{ step.fixSuggestion }}
              </div>
            </div>
          </div>

          <!-- 最终决策 -->
          <div class="final-decision" :class="result.finalDecision.toLowerCase()">
            <div class="decision-icon">{{ result.finalDecision === 'ALLOW' ? '✅' : '❌' }}</div>
            <div class="decision-text">{{ result.finalDecision }}</div>
            <div class="decision-meta">
              <span>policy: {{ result.policyVersion }}</span>
              <span>{{ result.simulatedAt.slice(0, 19).replace('T', ' ') }}</span>
            </div>
          </div>
        </template>

        <el-empty v-else description="点击「运行模拟」查看授权决策路径" :image-size="80" style="margin-top:60px" />
      </div>
    </div>

    <!-- 历史记录 -->
    <el-collapse v-if="simulatorStore.history.length" class="history-collapse">
      <el-collapse-item title="📋 历史记录（最近 20 条）" name="history">
        <el-table :data="simulatorStore.history" size="small" style="width:100%">
          <el-table-column label="调用方" width="140">
            <template #default="{ row }"><StatusBadge :status="row.input.callerType" /> {{ row.input.callerId }}</template>
          </el-table-column>
          <el-table-column label="API Action" min-width="180">
            <template #default="{ row }"><code>{{ row.input.apiAction }}</code></template>
          </el-table-column>
          <el-table-column label="结果" width="100">
            <template #default="{ row }">
              <el-tag :type="row.finalDecision === 'ALLOW' ? 'success' : 'danger'" size="small">{{ row.finalDecision }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="时间" width="160">
            <template #default="{ row }">{{ row.simulatedAt.slice(0, 19).replace('T', ' ') }}</template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-button size="small" text @click="reloadHistory(row)">重新运行</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VideoPlay, Pointer } from '@element-plus/icons-vue'
import { useSimulatorStore } from '@/stores/simulator'
import { useCatalogStore } from '@/stores/catalog'
import type { SimulatorInput, SimulatorResult } from '@/types'
import TooltipLabel from '@/components/common/TooltipLabel.vue'
import RiskLevelTag from '@/components/common/RiskLevelTag.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const simulatorStore = useSimulatorStore()
const catalogStore = useCatalogStore()
const running = ref(false)
const result = ref<SimulatorResult | null>(null)

const input = ref<SimulatorInput>({
  callerType: 'PORTAL_USER', callerId: 'user-001',
  apiAction: '', tenant: 'T1', customers: [], facilities: []
})

const callerIdPlaceholder = computed(() => {
  if (input.value.callerType === 'PORTAL_USER') return '例如: user-001'
  if (input.value.callerType === 'EXTERNAL_APP') return '例如: sp-acme-bi-prod'
  return '例如: ai-001'
})

function loadPreset(scenario: 'inventory-query' | 'order-query' | 'order-update' | 'billing-query') {
  input.value = simulatorStore.loadPreset(scenario)
}

function runSimulate() {
  if (!input.value.apiAction || !input.value.callerId || !input.value.tenant) return
  running.value = true
  setTimeout(() => {
    result.value = simulatorStore.simulate(input.value)
    running.value = false
  }, 600)
}

function reloadHistory(r: SimulatorResult) {
  input.value = { ...r.input }
  result.value = r
}
</script>

<style scoped>
.simulator-view { display: flex; flex-direction: column; gap: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-header h2 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.page-header p { font-size: 13px; color: #909399; }
.simulator-body { display: flex; gap: 16px; align-items: flex-start; }
.input-panel { width: 360px; flex-shrink: 0; background: #fff; border: 1px solid var(--card-border); border-radius: 8px; padding: 20px; }
.trace-panel { flex: 1; background: #fff; border: 1px solid var(--card-border); border-radius: 8px; padding: 20px; min-height: 400px; }
.panel-title { font-size: 14px; font-weight: 600; color: #303133; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
.presets { margin-bottom: 16px; }
.presets-label { font-size: 12px; color: #909399; margin-bottom: 8px; }
.preset-btns { display: flex; flex-wrap: wrap; gap: 8px; }
.caller-type-group { display: flex; flex-direction: column; gap: 8px; }
.steps { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.step-card { padding: 12px 14px; border-radius: 6px; background: #f8f9fa; border-left: 4px solid #e4e7ed; }
.step-card.step-pass { border-left-color: #67c23a; background: #f0f9eb; }
.step-card.step-fail { border-left-color: #f56c6c; background: #fef0f0; }
.step-card.step-skip { border-left-color: #d0d3d9; background: #f5f7fa; }
.step-card.step-failed { box-shadow: 0 0 0 2px #f56c6c; }
.step-header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.step-id { width: 24px; height: 24px; border-radius: 50%; background: #909399; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.step-card.step-pass .step-id { background: #67c23a; }
.step-card.step-fail .step-id { background: #f56c6c; }
.step-name { font-size: 13px; font-weight: 600; color: #303133; flex: 1; }
.step-badge { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 10px; }
.step-badge.pass { color: #67c23a; background: #f0f9eb; }
.step-badge.fail { color: #f56c6c; background: #fef0f0; }
.step-badge.skip { color: #909399; background: #f5f7fa; }
.step-evidence { font-family: monospace; font-size: 11px; color: #606266; margin: 4px 0; }
.step-desc { font-size: 12px; color: #909399; }
.step-fix { font-size: 12px; color: var(--el-color-primary); margin-top: 6px; display: flex; align-items: flex-start; gap: 4px; }
.final-decision { text-align: center; padding: 20px; border-radius: 8px; margin-top: 8px; }
.final-decision.allow { background: #f0f9eb; border: 2px solid #67c23a; }
.final-decision.deny { background: #fef0f0; border: 2px solid #f56c6c; }
.decision-icon { font-size: 36px; }
.decision-text { font-size: 28px; font-weight: 700; margin: 4px 0; }
.final-decision.allow .decision-text { color: #67c23a; }
.final-decision.deny .decision-text { color: #f56c6c; }
.decision-meta { display: flex; justify-content: center; gap: 16px; font-size: 11px; color: #909399; font-family: monospace; }
.history-collapse { background: #fff; border: 1px solid var(--card-border); border-radius: 8px; }
</style>
