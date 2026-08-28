import type { AiCapabilityProfile } from '@/types'

export const mockAiProfiles: AiCapabilityProfile[] = [
  {
    id: 'ai-001', name: 'AGENT_INVENTORY_ADVISOR', profileType: 'AGENT',
    description: '库存顾问 Agent - 提供库存查询和老化分析能力',
    defaultAiMode: 'READ_ONLY',
    tools: [
      {
        toolName: 'query_inventory', apiActions: ['inventory.onhand.read'],
        aiModeOverride: 'READ_ONLY', confirmPolicy: null
      },
      {
        toolName: 'export_aging_report', apiActions: ['inventory.aging.export'],
        aiModeOverride: 'CONFIRM',
        confirmPolicy: { minRiskLevel: 'L2', timeoutMinutes: 30, timeoutAction: 'AUTO_DENY' }
      },
    ],
    status: 'ACTIVE', createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'ai-002', name: 'AGENT_ORDER_ASSISTANT', profileType: 'AGENT',
    description: '订单助手 Agent - 提供订单查询和状态更新能力',
    defaultAiMode: 'READ_ONLY',
    tools: [
      {
        toolName: 'get_order', apiActions: ['order.read'],
        aiModeOverride: 'READ_ONLY', confirmPolicy: null
      },
      {
        toolName: 'update_order_status', apiActions: ['order.update'],
        aiModeOverride: 'CONFIRM',
        confirmPolicy: { minRiskLevel: 'L3', timeoutMinutes: 60, timeoutAction: 'AUTO_DENY' }
      },
    ],
    status: 'ACTIVE', createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-07-15T00:00:00Z'
  },
  {
    id: 'ai-003', name: 'ONTOLOGY_INVENTORY_SEARCH', profileType: 'ONTOLOGY',
    description: '库存本体 - 提供语义化库存查询能力',
    defaultAiMode: 'READ_ONLY',
    tools: [
      {
        toolName: 'semantic_inventory_query', apiActions: ['inventory.onhand.read'],
        aiModeOverride: 'READ_ONLY', confirmPolicy: null
      },
    ],
    status: 'ACTIVE', createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
]
