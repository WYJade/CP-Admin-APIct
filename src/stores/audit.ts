import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuditLog, CallerType, DecisionResult, ApiDependency } from '@/types'
import { mockAuditLogs } from '@/mock/auditLogs'
import { useIntegrationStore } from './integration'
import { useAIProfileStore } from './aiProfile'
import { useCatalogStore } from './catalog'

export const useAuditStore = defineStore('audit', () => {
  const logs = ref<AuditLog[]>(JSON.parse(JSON.stringify(mockAuditLogs)))
  const filterCallerType = ref<CallerType | null>(null)
  const filterApiAction = ref('')
  const filterDecision = ref<DecisionResult | 'ALL'>('ALL')
  const dateRange = ref<[string, string] | null>(null)

  const filteredLogs = computed(() => {
    return logs.value.filter(log => {
      if (filterCallerType.value && log.callerType !== filterCallerType.value) return false
      if (filterApiAction.value && !log.apiAction.includes(filterApiAction.value)) return false
      if (filterDecision.value !== 'ALL' && log.decision !== filterDecision.value) return false
      if (dateRange.value) {
        const ts = new Date(log.timestamp).getTime()
        const from = new Date(dateRange.value[0]).getTime()
        const to = new Date(dateRange.value[1]).getTime() + 86400000
        if (ts < from || ts > to) return false
      }
      return true
    })
  })

  function getDependencies(apiAction: string): ApiDependency {
    const integrationStore = useIntegrationStore()
    const aiStore = useAIProfileStore()
    const consumers: ApiDependency['consumers'] = []
    integrationStore.profiles.forEach(p => {
      if (p.actions.some(a => a.apiAction === apiAction)) {
        consumers.push({ profileId: p.id, profileName: p.name, profileType: 'INTEGRATION', last7DayCalls: p.last7DayCalls, lastCalledAt: new Date().toISOString() })
      }
    })
    aiStore.profiles.forEach(p => {
      if (p.tools.some(t => t.apiActions.includes(apiAction))) {
        const calls = Math.floor(Math.random() * 1000)
        consumers.push({ profileId: p.id, profileName: p.name, profileType: 'AI', last7DayCalls: calls, lastCalledAt: new Date().toISOString() })
      }
    })
    return { apiAction, consumers }
  }

  function getDeprecatedApis() {
    const catalogStore = useCatalogStore()
    return catalogStore.entries
      .filter(e => e.lifecycle === 'DEPRECATED')
      .map(e => ({ ...e, dependency: getDependencies(e.apiAction) }))
  }

  function resetFilters() {
    filterCallerType.value = null
    filterApiAction.value = ''
    filterDecision.value = 'ALL'
    dateRange.value = null
  }

  return {
    logs, filteredLogs, filterCallerType, filterApiAction, filterDecision, dateRange,
    getDependencies, getDeprecatedApis, resetFilters
  }
})
