import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AiCapabilityProfile, AiMode } from '@/types'
import { mockAiProfiles } from '@/mock/aiProfiles'
import { useCatalogStore } from './catalog'

export const useAIProfileStore = defineStore('aiProfile', () => {
  const profiles = ref<AiCapabilityProfile[]>(JSON.parse(JSON.stringify(mockAiProfiles)))

  function validateProfileActions(profile: Pick<AiCapabilityProfile, 'tools'>): string[] {
    const catalogStore = useCatalogStore()
    const invalid: string[] = []
    profile.tools.forEach(tool => {
      tool.apiActions.forEach(action => {
        const entry = catalogStore.getByAction(action)
        if (!entry || !entry.allowedChannels.includes('AGENT')) {
          if (!invalid.includes(action)) invalid.push(action)
        }
      })
    })
    return invalid
  }

  function getModeDistribution(id: string): Record<AiMode, number> {
    const profile = profiles.value.find(p => p.id === id)
    if (!profile) return { READ_ONLY: 0, CONFIRM: 0, DENY: 0 }
    const dist: Record<AiMode, number> = { READ_ONLY: 0, CONFIRM: 0, DENY: 0 }
    profile.tools.forEach(tool => {
      const mode = tool.aiModeOverride ?? profile.defaultAiMode
      dist[mode]++
    })
    return dist
  }

  function create(profile: Omit<AiCapabilityProfile, 'id' | 'createdAt' | 'updatedAt'>): { ok: boolean; invalidActions?: string[] } {
    const invalid = validateProfileActions(profile)
    if (invalid.length) return { ok: false, invalidActions: invalid }
    const now = new Date().toISOString()
    profiles.value.push({ ...profile, id: `ai-${Date.now()}`, createdAt: now, updatedAt: now })
    return { ok: true }
  }

  function update(id: string, patch: Partial<AiCapabilityProfile>): { ok: boolean; invalidActions?: string[] } {
    const idx = profiles.value.findIndex(p => p.id === id)
    if (idx === -1) return { ok: false }
    if (patch.tools) {
      const invalid = validateProfileActions({ tools: patch.tools })
      if (invalid.length) return { ok: false, invalidActions: invalid }
    }
    profiles.value[idx] = { ...profiles.value[idx], ...patch, updatedAt: new Date().toISOString() }
    return { ok: true }
  }

  function remove(id: string) {
    profiles.value = profiles.value.filter(p => p.id !== id)
  }

  function exportConfig(id: string): string {
    const profile = profiles.value.find(p => p.id === id)
    if (!profile) return '{}'
    return JSON.stringify(profile, null, 2)
  }

  return { profiles, validateProfileActions, getModeDistribution, create, update, remove, exportConfig }
})
