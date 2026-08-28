import type { ExternalApp, IntegrationProfile } from '@/types'

export const mockExternalApps: ExternalApp[] = [
  {
    id: 'app-001', name: 'ACME BI Platform', servicePrincipalId: 'sp-acme-bi-prod',
    status: 'ACTIVE', description: '商业智能平台，用于库存数据分析和报表',
    createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'app-002', name: 'WMS Integration Service', servicePrincipalId: 'sp-wms-integration',
    status: 'ACTIVE', description: '仓库管理系统集成，用于订单状态同步',
    createdAt: '2026-02-20T00:00:00Z', updatedAt: '2026-07-15T00:00:00Z'
  },
]

export const mockIntegrationProfiles: IntegrationProfile[] = [
  {
    id: 'prof-001', appId: 'app-001', name: 'EXT_INVENTORY_READONLY',
    description: '库存只读集成 - 允许查询库存在手数量和老化报表',
    actions: [
      { apiAction: 'inventory.onhand.read', dataDimensionOverride: null },
      { apiAction: 'inventory.aging.export', dataDimensionOverride: null },
    ],
    dataScope: ['TENANT', 'CUSTOMER', 'FACILITY'],
    credentialType: 'OAUTH2', qpsLimit: 100, dailyQuota: 10000,
    status: 'ACTIVE', version: 'v1.2',
    createdAt: '2026-01-20T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z',
    last7DayCalls: 8432, successRate: 99.2
  },
  {
    id: 'prof-002', appId: 'app-002', name: 'EXT_ORDER_WRITE',
    description: '订单读写集成 - 允许查询和更新订单状态',
    actions: [
      { apiAction: 'order.read', dataDimensionOverride: null },
      { apiAction: 'order.update', dataDimensionOverride: ['TENANT', 'CUSTOMER'] },
    ],
    dataScope: ['TENANT', 'CUSTOMER', 'FACILITY'],
    credentialType: 'MTLS', qpsLimit: 50, dailyQuota: 5000,
    status: 'ACTIVE', version: 'v2.0',
    createdAt: '2026-02-25T00:00:00Z', updatedAt: '2026-07-20T00:00:00Z',
    last7DayCalls: 3210, successRate: 98.7
  },
]
