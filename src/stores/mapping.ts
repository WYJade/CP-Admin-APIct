import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BusinessPermission, BusinessMapping, Channel } from '@/types'
import { mockBusinessPermissions, mockBusinessMappings, menuNodeToPermKey, nodeDirectMappings } from '@/mock/businessPermissions'
import { useCatalogStore } from './catalog'

export const useMappingStore = defineStore('mapping', () => {
  const permissions = ref<BusinessPermission[]>(JSON.parse(JSON.stringify(mockBusinessPermissions)))
  const mappings = ref<BusinessMapping[]>(JSON.parse(JSON.stringify(mockBusinessMappings)))

  // 节点直接映射（每个节点 ID -> 对应的 API 映射列表，可动态修改）
  const nodeDirectMappingsRef = ref<Record<string, BusinessMapping[]>>(
    JSON.parse(JSON.stringify(nodeDirectMappings))
  )

  const selectedPermissionKey = ref<string | null>(null)
  const selectedMenuNodeId = ref<string | null>(null)

  const mappedCountByPermission = computed(() => {
    const map = new Map<string, number>()
    permissions.value.forEach(p => map.set(p.key, 0))
    mappings.value.forEach(m => map.set(m.businessPermissionKey, (map.get(m.businessPermissionKey) ?? 0) + 1))
    return map
  })

  function getMappingsByPermission(key: string): BusinessMapping[] {
    return mappings.value.filter(m => m.businessPermissionKey === key)
  }

  // 通过菜单节点 ID 获取映射（优先节点直接数据，fallback 到 perm key 级）
  function getMappingsByMenuNodeId(nodeId: string): BusinessMapping[] {
    const directLocal = nodeDirectMappingsRef.value[nodeId]
    if (directLocal && directLocal.length > 0) return directLocal
    const permKey = menuNodeToPermKey[nodeId] ?? null
    if (!permKey) return []
    return getMappingsByPermission(permKey)
  }

  // 通过菜单节点 ID 获取对应的业务权限 key
  function getPermKeyByNodeId(nodeId: string): string | null {
    return menuNodeToPermKey[nodeId] ?? null
  }

  function channelSummary(key: string): Channel[] {
    const catalogStore = useCatalogStore()
    const actions = getMappingsByPermission(key).map(m => m.apiAction)
    const channels = new Set<Channel>()
    actions.forEach(action => {
      const entry = catalogStore.getByAction(action)
      if (entry) entry.allowedChannels.forEach(c => channels.add(c))
    })
    return Array.from(channels)
  }

  // 通过节点 ID 添加映射
  function addMappingsByNodeId(nodeId: string, apiActions: string[]): { added: number; skipped: number } {
    if (!nodeDirectMappingsRef.value[nodeId]) {
      nodeDirectMappingsRef.value[nodeId] = []
    }
    const existing = nodeDirectMappingsRef.value[nodeId].map(m => m.apiAction)
    let added = 0, skipped = 0
    const permKey = menuNodeToPermKey[nodeId] ?? `MENU_${nodeId.toUpperCase().replace(/-/g, '_')}`
    apiActions.forEach(action => {
      if (existing.includes(action)) { skipped++; return }
      nodeDirectMappingsRef.value[nodeId].push({
        id: `nmap-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        businessPermissionKey: permKey,
        apiAction: action,
        createdAt: new Date().toISOString()
      })
      added++
    })
    return { added, skipped }
  }

  function addMappings(permKey: string, apiActions: string[]): { added: number; skipped: number } {
    let added = 0, skipped = 0
    const existing = getMappingsByPermission(permKey).map(m => m.apiAction)
    apiActions.forEach(action => {
      if (existing.includes(action)) { skipped++; return }
      mappings.value.push({
        id: `map-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        businessPermissionKey: permKey,
        apiAction: action,
        createdAt: new Date().toISOString()
      })
      added++
    })
    return { added, skipped }
  }

  // 删除节点映射（先找节点直接映射，再找公共映射）
  function removeMapping(id: string) {
    // 从节点直接映射中找
    for (const nodeId in nodeDirectMappingsRef.value) {
      const arr = nodeDirectMappingsRef.value[nodeId]
      const idx = arr.findIndex(m => m.id === id)
      if (idx !== -1) {
        arr.splice(idx, 1)
        return
      }
    }
    // fallback：从公共映射中找
    mappings.value = mappings.value.filter(m => m.id !== id)
  }

  // 节点映射数量
  function nodeMappingCount(nodeId: string): number {
    const direct = nodeDirectMappingsRef.value[nodeId]
    if (direct && direct.length > 0) return direct.length
    const permKey = menuNodeToPermKey[nodeId]
    if (!permKey) return 0
    return getMappingsByPermission(permKey).length
  }

  return {
    permissions,
    mappings,
    nodeDirectMappingsRef,
    selectedPermissionKey,
    selectedMenuNodeId,
    mappedCountByPermission,
    getMappingsByPermission,
    getMappingsByMenuNodeId,
    getPermKeyByNodeId,
    channelSummary,
    addMappings,
    addMappingsByNodeId,
    removeMapping,
    nodeMappingCount
  }
})
