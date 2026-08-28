import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiEntry, RiskLevel, LifecycleStatus, Channel } from '@/types'
import { mockApiCatalog } from '@/mock/apiCatalog'

export const useCatalogStore = defineStore('catalog', () => {
  const entries = ref<ApiEntry[]>(JSON.parse(JSON.stringify(mockApiCatalog)))
  const filterDomain = ref('')
  const filterRisk = ref<RiskLevel[]>([])
  const filterLifecycle = ref<LifecycleStatus[]>([])
  const filterChannels = ref<Channel[]>([])
  const searchKeyword = ref('')

  const filteredEntries = computed(() => {
    return entries.value.filter(e => {
      if (filterDomain.value && e.businessDomain !== filterDomain.value) return false
      if (filterRisk.value.length && !filterRisk.value.includes(e.riskLevel)) return false
      if (filterLifecycle.value.length && !filterLifecycle.value.includes(e.lifecycle)) return false
      if (filterChannels.value.length && !filterChannels.value.some(c => e.allowedChannels.includes(c))) return false
      if (searchKeyword.value) {
        const kw = searchKeyword.value.toLowerCase()
        if (!e.apiAction.toLowerCase().includes(kw) && !e.path.toLowerCase().includes(kw)) return false
      }
      return true
    })
  })

  function getByAction(action: string) {
    return entries.value.find(e => e.apiAction === action)
  }

  function create(entry: Omit<ApiEntry, 'id' | 'policyVersion' | 'createdAt' | 'updatedAt'>): { ok: boolean; error?: string } {
    if (entries.value.some(e => e.apiAction === entry.apiAction)) {
      return { ok: false, error: '该 Action 标识已存在，请修改' }
    }
    const now = new Date().toISOString()
    entries.value.push({
      ...entry,
      id: `api-${Date.now()}`,
      policyVersion: `cp-authz-${now.slice(0, 10)}`,
      createdAt: now,
      updatedAt: now
    })
    return { ok: true }
  }

  function update(id: string, patch: Partial<ApiEntry>): { ok: boolean; error?: string } {
    const idx = entries.value.findIndex(e => e.id === id)
    if (idx === -1) return { ok: false, error: '记录不存在' }
    if (patch.apiAction && patch.apiAction !== entries.value[idx].apiAction) {
      if (entries.value.some(e => e.apiAction === patch.apiAction)) {
        return { ok: false, error: '该 Action 标识已存在，请修改' }
      }
    }
    entries.value[idx] = { ...entries.value[idx], ...patch, updatedAt: new Date().toISOString() }
    return { ok: true }
  }

  function remove(id: string) {
    entries.value = entries.value.filter(e => e.id !== id)
  }

  function validateForActivation(id: string): string[] {
    const entry = entries.value.find(e => e.id === id)
    if (!entry) return ['记录不存在']
    const missing: string[] = []
    if (!entry.apiAction) missing.push('API Action')
    if (!entry.method) missing.push('HTTP Method')
    if (!entry.path) missing.push('Path')
    if (!entry.businessDomain) missing.push('业务域')
    if (!entry.requiredBusinessPermissions?.length) missing.push('业务权限')
    if (!entry.allowedChannels?.length) missing.push('允许渠道')
    if (!entry.riskLevel) missing.push('风险等级')
    return missing
  }

  function getDependencies(apiAction: string) {
    return { integrationProfiles: [] as string[], aiProfiles: [] as string[] }
  }

  function resetFilters() {
    filterDomain.value = ''
    filterRisk.value = []
    filterLifecycle.value = []
    filterChannels.value = []
    searchKeyword.value = ''
  }

  return {
    entries, filteredEntries, filterDomain, filterRisk, filterLifecycle,
    filterChannels, searchKeyword,
    getByAction, create, update, remove, validateForActivation, getDependencies, resetFilters
  }
})
