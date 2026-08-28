import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SimulatorInput, SimulatorResult, DecisionStep } from '@/types'
import { useCatalogStore } from './catalog'
import { useMappingStore } from './mapping'
import { useIntegrationStore } from './integration'
import { useAIProfileStore } from './aiProfile'

// Mock 用户授权范围（演示数据）
const MOCK_USER_SCOPE = { tenants: ['T1', 'T2'], customers: ['C1', 'C2', 'C3'], facilities: ['F1', 'F2', 'F3', 'F4'] }

function callerTypeToChannel(callerType: string): string {
  if (callerType === 'PORTAL_USER') return 'PORTAL'
  if (callerType === 'EXTERNAL_APP') return 'EXTERNAL'
  if (callerType === 'AI_AGENT') return 'AGENT'
  return 'PORTAL'
}

export const useSimulatorStore = defineStore('simulator', () => {
  const history = ref<SimulatorResult[]>([])
  const lastResult = ref<SimulatorResult | null>(null)

  function simulate(input: SimulatorInput): SimulatorResult {
    const catalogStore = useCatalogStore()
    const mappingStore = useMappingStore()
    const integrationStore = useIntegrationStore()
    const aiStore = useAIProfileStore()
    const steps: DecisionStep[] = []
    let denied = false

    // A: 身份验证
    steps.push({ stepId: 'A', stepName: '身份验证', result: 'PASS', evidence: `caller_id: ${input.callerId}`, description: 'Token/Session 有效，身份识别成功' })

    // B: API Catalog 检查
    const apiEntry = catalogStore.getByAction(input.apiAction)
    if (!apiEntry || apiEntry.lifecycle !== 'ACTIVE') {
      steps.push({ stepId: 'B', stepName: 'API Catalog 检查', result: 'FAIL', evidence: `apiAction: ${input.apiAction} → 未找到或未激活`, description: '该 API 未在 Catalog 中注册或未处于 Active 状态', fixSuggestion: '请在 API Catalog 中注册该 API 并将状态设置为 Active' })
      denied = true
    } else {
      steps.push({ stepId: 'B', stepName: 'API Catalog 检查', result: 'PASS', evidence: `${input.apiAction}, lifecycle: ${apiEntry.lifecycle}`, description: 'API 已注册且处于激活状态' })
    }

    // C: Channel 检查
    if (!denied) {
      const channel = callerTypeToChannel(input.callerType)
      const allowed = apiEntry!.allowedChannels.includes(channel as any)
      if (!allowed) {
        steps.push({ stepId: 'C', stepName: 'Channel 检查', result: 'FAIL', evidence: `调用渠道: ${channel}，允许渠道: [${apiEntry!.allowedChannels.join(', ')}]`, description: '调用渠道未在 API 允许渠道列表中', fixSuggestion: `请在 API Catalog 中将 ${channel} 添加到 ${input.apiAction} 的 allowed_channels` })
        denied = true
      } else {
        steps.push({ stepId: 'C', stepName: 'Channel 检查', result: 'PASS', evidence: `${channel} ∈ [${apiEntry!.allowedChannels.join(', ')}]`, description: '调用渠道已授权' })
      }
    } else { steps.push({ stepId: 'C', stepName: 'Channel 检查', result: 'SKIP', evidence: '', description: '前序步骤失败，跳过' }) }

    // D: Caller Capability 检查
    if (!denied) {
      if (input.callerType === 'PORTAL_USER') {
        steps.push({ stepId: 'D', stepName: 'Caller Capability 检查', result: 'SKIP', evidence: 'Portal 渠道无需 Profile 检查', description: 'Portal SaaS 用户直接使用业务权限映射，跳过 Profile 检查' })
      } else if (input.callerType === 'EXTERNAL_APP') {
        const profile = integrationStore.profiles.find(p => p.actions.some(a => a.apiAction === input.apiAction) && p.status === 'ACTIVE')
        if (!profile) {
          steps.push({ stepId: 'D', stepName: 'Caller Capability 检查', result: 'FAIL', evidence: `未找到包含 ${input.apiAction} 的 Integration Profile`, description: '外部应用没有可用的 Integration Profile 包含该 API', fixSuggestion: '请在 Integration Admin 中为该应用创建包含此 API Action 的 Profile' })
          denied = true
        } else {
          steps.push({ stepId: 'D', stepName: 'Caller Capability 检查', result: 'PASS', evidence: `Integration Profile: ${profile.name}`, description: '外部应用集成档案验证通过' })
        }
      } else if (input.callerType === 'AI_AGENT') {
        const profile = aiStore.profiles.find(p => p.tools.some(t => t.apiActions.includes(input.apiAction)) && p.status === 'ACTIVE')
        if (!profile) {
          steps.push({ stepId: 'D', stepName: 'Caller Capability 检查', result: 'FAIL', evidence: `未找到包含 ${input.apiAction} 的 AI Capability Profile`, description: 'AI Agent 没有可用的 Capability Profile 包含该工具', fixSuggestion: '请在 AI Capability Admin 中为 Agent 创建包含此 API Action 的 Profile' })
          denied = true
        } else {
          steps.push({ stepId: 'D', stepName: 'Caller Capability 检查', result: 'PASS', evidence: `AI Profile: ${profile.name}`, description: 'AI 能力档案验证通过' })
        }
      }
    } else { steps.push({ stepId: 'D', stepName: 'Caller Capability 检查', result: 'SKIP', evidence: '', description: '前序步骤失败，跳过' }) }

    // E: 业务权限检查
    if (!denied) {
      if (input.callerType === 'EXTERNAL_APP') {
        steps.push({ stepId: 'E', stepName: '业务权限检查', result: 'SKIP', evidence: '外部应用使用 Service Principal，不检查 User Menu 权限', description: '外部应用通过 Integration Profile 控制权限，跳过业务权限检查' })
      } else {
        const mappedPermissions = mappingStore.mappings.filter(m => m.apiAction === input.apiAction).map(m => m.businessPermissionKey)
        if (mappedPermissions.length === 0) {
          steps.push({ stepId: 'E', stepName: '业务权限检查', result: 'FAIL', evidence: `${input.apiAction} 未映射到任何 Business Permission`, description: 'API Action 未配置业务权限映射', fixSuggestion: '请在业务映射页面为该 API Action 配置对应的 Business Permission 映射' })
          denied = true
        } else {
          steps.push({ stepId: 'E', stepName: '业务权限检查', result: 'PASS', evidence: `所需权限: [${mappedPermissions.join(', ')}]，用户权限: Mock 预设 ✓`, description: '用户持有所需业务权限' })
        }
      }
    } else { steps.push({ stepId: 'E', stepName: '业务权限检查', result: 'SKIP', evidence: '', description: '前序步骤失败，跳过' }) }

    // F: Data Scope 检查
    if (!denied) {
      const tenantOk = MOCK_USER_SCOPE.tenants.includes(input.tenant)
      const customersOk = input.customers.every(c => MOCK_USER_SCOPE.customers.includes(c))
      const facilitiesOk = input.facilities.every(f => MOCK_USER_SCOPE.facilities.includes(f))
      if (!tenantOk || !customersOk || !facilitiesOk) {
        const issues = []
        if (!tenantOk) issues.push(`Tenant ${input.tenant} 超出授权范围`)
        if (!customersOk) issues.push(`Customer 超出授权范围`)
        if (!facilitiesOk) issues.push(`Facility 超出授权范围`)
        steps.push({ stepId: 'F', stepName: 'Data Scope 检查', result: 'FAIL', evidence: issues.join('; '), description: '请求的数据范围超出用户授权范围（请求范围只能缩小，不能扩大）', fixSuggestion: '请在 CP-Admin 中检查并调整用户的 Tenant/Customer/Facility 数据权限' })
        denied = true
      } else {
        steps.push({ stepId: 'F', stepName: 'Data Scope 检查', result: 'PASS', evidence: `T:${input.tenant}/C:[${input.customers.join(',')}]/F:[${input.facilities.join(',')}] ⊆ 用户授权范围`, description: '请求数据范围在授权范围内' })
      }
    } else { steps.push({ stepId: 'F', stepName: 'Data Scope 检查', result: 'SKIP', evidence: '', description: '前序步骤失败，跳过' }) }

    // G: 风险/上下文检查
    if (!denied) {
      const risk = apiEntry!.riskLevel
      if (risk === 'L4' && input.callerType === 'AI_AGENT') {
        steps.push({ stepId: 'G', stepName: '风险/上下文检查', result: 'FAIL', evidence: `风险等级: ${risk}，AI Agent 调用高风险操作需要确认`, description: 'L4 高风险操作由 AI 调用时需要人工确认', fixSuggestion: '请在 AI Capability Profile 中将此 Action 的 AI Mode 设置为 CONFIRM 并配置审批流程' })
        denied = true
      } else {
        steps.push({ stepId: 'G', stepName: '风险/上下文检查', result: 'PASS', evidence: `风险等级: ${risk}，调用方: ${input.callerType}`, description: '风险等级检查通过，无需额外确认' })
      }
    } else { steps.push({ stepId: 'G', stepName: '风险/上下文检查', result: 'SKIP', evidence: '', description: '前序步骤失败，跳过' }) }

    // H: Obligation 输出
    if (!denied) {
      const maxRows = apiEntry!.riskLevel === 'L1' ? 10000 : apiEntry!.riskLevel === 'L2' ? 5000 : 1000
      steps.push({ stepId: 'H', stepName: 'Obligation 输出', result: 'PASS', evidence: `max_rows: ${maxRows}, field_mask: [], scope_filter: T:${input.tenant}`, description: `授权通过，附加约束条件已下发给业务服务` })
    } else { steps.push({ stepId: 'H', stepName: 'Obligation 输出', result: 'SKIP', evidence: '', description: '授权被拒绝，无 Obligation 输出' }) }

    const result: SimulatorResult = {
      id: `sim-${Date.now()}`,
      input,
      steps,
      finalDecision: denied ? 'DENY' : 'ALLOW',
      policyVersion: apiEntry?.policyVersion ?? 'cp-authz-unknown',
      simulatedAt: new Date().toISOString()
    }
    lastResult.value = result
    history.value.unshift(result)
    if (history.value.length > 20) history.value.pop()
    return result
  }

  const PRESETS = {
    'inventory-query': { callerType: 'PORTAL_USER' as const, callerId: 'user-001', apiAction: 'inventory.onhand.read', tenant: 'T1', customers: ['C1'], facilities: ['F1', 'F2'] },
    'order-query': { callerType: 'PORTAL_USER' as const, callerId: 'user-002', apiAction: 'order.read', tenant: 'T1', customers: ['C1', 'C2'], facilities: ['F1'] },
    'order-update': { callerType: 'EXTERNAL_APP' as const, callerId: 'sp-wms-integration', apiAction: 'order.update', tenant: 'T1', customers: ['C1'], facilities: [] },
    'billing-query': { callerType: 'PORTAL_USER' as const, callerId: 'user-003', apiAction: 'invoice.download', tenant: 'T1', customers: ['C1'], facilities: [] },
  }

  function loadPreset(scenario: keyof typeof PRESETS): SimulatorInput {
    return { ...PRESETS[scenario] }
  }

  function clearHistory() { history.value = [] }

  return { history, lastResult, simulate, loadPreset, clearHistory }
})
