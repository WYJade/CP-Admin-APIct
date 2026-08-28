import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ExternalApp, IntegrationProfile } from '@/types'
import { mockExternalApps, mockIntegrationProfiles } from '@/mock/integrationApps'
import { useCatalogStore } from './catalog'

export const useIntegrationStore = defineStore('integration', () => {
  const apps = ref<ExternalApp[]>(JSON.parse(JSON.stringify(mockExternalApps)))
  const profiles = ref<IntegrationProfile[]>(JSON.parse(JSON.stringify(mockIntegrationProfiles)))

  const appsWithProfiles = computed(() =>
    apps.value.map(app => ({
      ...app,
      profiles: profiles.value.filter(p => p.appId === app.id)
    }))
  )

  function getProfilesByApp(appId: string) {
    return profiles.value.filter(p => p.appId === appId)
  }

  function validateProfileActions(profile: Pick<IntegrationProfile, 'actions'>): string[] {
    const catalogStore = useCatalogStore()
    const invalid: string[] = []
    profile.actions.forEach(a => {
      const entry = catalogStore.getByAction(a.apiAction)
      if (!entry || !entry.allowedChannels.includes('EXTERNAL')) {
        invalid.push(a.apiAction)
      }
    })
    return invalid
  }

  function createApp(app: Omit<ExternalApp, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    apps.value.push({ ...app, id: `app-${Date.now()}`, createdAt: now, updatedAt: now })
  }

  function createProfile(profile: Omit<IntegrationProfile, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'last7DayCalls' | 'successRate'>): { ok: boolean; invalidActions?: string[] } {
    const invalid = validateProfileActions(profile)
    if (invalid.length) return { ok: false, invalidActions: invalid }
    const now = new Date().toISOString()
    profiles.value.push({
      ...profile, id: `prof-${Date.now()}`,
      version: 'v1.0', last7DayCalls: 0, successRate: 100,
      createdAt: now, updatedAt: now
    })
    return { ok: true }
  }

  function updateProfile(id: string, patch: Partial<IntegrationProfile>): { ok: boolean; invalidActions?: string[] } {
    const idx = profiles.value.findIndex(p => p.id === id)
    if (idx === -1) return { ok: false }
    if (patch.actions) {
      const invalid = validateProfileActions({ actions: patch.actions })
      if (invalid.length) return { ok: false, invalidActions: invalid }
    }
    profiles.value[idx] = { ...profiles.value[idx], ...patch, updatedAt: new Date().toISOString() }
    return { ok: true }
  }

  function cloneProfile(id: string) {
    const profile = profiles.value.find(p => p.id === id)
    if (!profile) return
    const now = new Date().toISOString()
    profiles.value.push({
      ...JSON.parse(JSON.stringify(profile)),
      id: `prof-${Date.now()}`,
      name: `${profile.name}-copy`,
      status: 'INACTIVE',
      last7DayCalls: 0, successRate: 100,
      createdAt: now, updatedAt: now
    })
  }

  function deactivateProfile(id: string) {
    const idx = profiles.value.findIndex(p => p.id === id)
    if (idx !== -1) profiles.value[idx].status = 'INACTIVE'
  }

  function removeApp(id: string) {
    apps.value = apps.value.filter(a => a.id !== id)
    profiles.value = profiles.value.filter(p => p.appId !== id)
  }

  return {
    apps, profiles, appsWithProfiles,
    getProfilesByApp, validateProfileActions,
    createApp, createProfile, updateProfile, cloneProfile, deactivateProfile, removeApp
  }
})
