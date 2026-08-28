import type { ApiEntry } from '@/types'

export const mockApiCatalog: ApiEntry[] = [
  {
    id: 'api-001', apiAction: 'inventory.onhand.read', method: 'GET',
    path: '/api/v3/inventory/on-hand', businessDomain: 'Inventory',
    requiredBusinessPermissions: ['MENU_INVENTORY'],
    allowedChannels: ['PORTAL', 'EXTERNAL', 'ONTOLOGY', 'AGENT'],
    riskLevel: 'L1', dataDimensions: ['TENANT', 'CUSTOMER', 'FACILITY'],
    aiMode: 'READ_ONLY', owner: 'inventory-team', lifecycle: 'ACTIVE',
    policyVersion: 'cp-authz-2026.08.26.1',
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'api-002', apiAction: 'inventory.aging.export', method: 'POST',
    path: '/api/v3/inventory/aging/export', businessDomain: 'Inventory',
    requiredBusinessPermissions: ['MENU_INVENTORY'],
    allowedChannels: ['PORTAL', 'EXTERNAL', 'AGENT'],
    riskLevel: 'L2', dataDimensions: ['TENANT', 'CUSTOMER', 'FACILITY'],
    aiMode: 'CONFIRM', owner: 'inventory-team', lifecycle: 'ACTIVE',
    policyVersion: 'cp-authz-2026.08.26.1',
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'api-003', apiAction: 'order.read', method: 'GET',
    path: '/api/v3/orders/{id}', businessDomain: 'Order',
    requiredBusinessPermissions: ['MENU_ORDER'],
    allowedChannels: ['PORTAL', 'EXTERNAL', 'ONTOLOGY', 'AGENT'],
    riskLevel: 'L1', dataDimensions: ['TENANT', 'CUSTOMER', 'FACILITY'],
    aiMode: 'READ_ONLY', owner: 'order-team', lifecycle: 'ACTIVE',
    policyVersion: 'cp-authz-2026.08.26.1',
    createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'api-004', apiAction: 'order.update', method: 'PATCH',
    path: '/api/v3/orders/{id}', businessDomain: 'Order',
    requiredBusinessPermissions: ['MENU_ORDER'],
    allowedChannels: ['PORTAL', 'EXTERNAL', 'AGENT'],
    riskLevel: 'L3', dataDimensions: ['TENANT', 'CUSTOMER', 'FACILITY'],
    aiMode: 'CONFIRM', owner: 'order-team', lifecycle: 'ACTIVE',
    policyVersion: 'cp-authz-2026.08.26.1',
    createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'api-005', apiAction: 'shipment.cancel.execute', method: 'POST',
    path: '/api/v3/shipments/{id}/cancel', businessDomain: 'Shipment',
    requiredBusinessPermissions: ['MENU_SHIPMENT'],
    allowedChannels: ['PORTAL', 'AGENT'],
    riskLevel: 'L4', dataDimensions: ['TENANT', 'CUSTOMER', 'FACILITY'],
    aiMode: 'DENY', owner: 'shipment-team', lifecycle: 'ACTIVE',
    policyVersion: 'cp-authz-2026.08.26.1',
    createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'api-006', apiAction: 'invoice.download', method: 'GET',
    path: '/api/v3/invoices/{id}/download', businessDomain: 'Billing',
    requiredBusinessPermissions: ['MENU_BILLING'],
    allowedChannels: ['PORTAL', 'EXTERNAL', 'AGENT'],
    riskLevel: 'L2', dataDimensions: ['TENANT', 'CUSTOMER'],
    aiMode: 'READ_ONLY', owner: 'billing-team', lifecycle: 'ACTIVE',
    policyVersion: 'cp-authz-2026.08.26.1',
    createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z'
  }
]

export function generateOpenApiYaml(entry: Partial<ApiEntry>): string {
  return [
    `x-cp-action: ${entry.apiAction ?? ''}`,
    `x-cp-business-permissions: [${(entry.requiredBusinessPermissions ?? []).join(', ')}]`,
    `x-cp-channels: [${(entry.allowedChannels ?? []).join(', ')}]`,
    `x-cp-data-scope: [${(entry.dataDimensions ?? []).map(d => d.toLowerCase()).join(', ')}]`,
    `x-cp-risk-level: ${entry.riskLevel ?? ''}`,
    `x-cp-ai-mode: ${entry.aiMode ?? ''}`,
    `x-cp-owner: ${entry.owner ?? ''}`,
  ].join('\n')
}

export const BUSINESS_DOMAINS = ['Inventory', 'Order', 'Shipment', 'Billing', 'Exception', 'Report']
