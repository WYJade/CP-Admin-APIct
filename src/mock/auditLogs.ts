import type { AuditLog, CallerType, DecisionResult } from '@/types'

const callerTypes: CallerType[] = ['PORTAL_USER', 'EXTERNAL_APP', 'AI_AGENT']
const apiActions = ['inventory.onhand.read', 'inventory.aging.export', 'order.read', 'order.update', 'shipment.cancel.execute', 'invoice.download']
const decisions: DecisionResult[] = ['ALLOW', 'ALLOW', 'ALLOW', 'ALLOW', 'DENY']
const errorCodes = ['CHANNEL_DENIED', 'CAPABILITY_DENIED', 'BUSINESS_PERMISSION_DENIED', 'DATA_SCOPE_DENIED']

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateLog(index: number): AuditLog {
  const decision = randomItem(decisions)
  const callerType = randomItem(callerTypes)
  const date = new Date('2026-08-26T00:00:00Z')
  date.setMinutes(date.getMinutes() - index * 17)
  const callerId = callerType === 'PORTAL_USER' ? `user-00${(index % 5) + 1}`
    : callerType === 'EXTERNAL_APP' ? randomItem(['sp-acme-bi-prod', 'sp-wms-integration'])
    : randomItem(['ai-001', 'ai-002'])
  return {
    id: `log-${String(index + 1).padStart(3, '0')}`,
    timestamp: date.toISOString(),
    callerType,
    callerId,
    apiAction: randomItem(apiActions),
    tenant: 'T1',
    customer: `C${(index % 3) + 1}`,
    facility: `F${(index % 4) + 1}`,
    decision,
    errorCode: decision === 'DENY' ? randomItem(errorCodes) : undefined,
    durationMs: Math.floor(Math.random() * 200) + 10
  }
}

export const mockAuditLogs: AuditLog[] = Array.from({ length: 50 }, (_, i) => generateLog(i))
