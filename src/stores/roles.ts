import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockRoles, type Role } from '@/mock/roles'

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<Role[]>(JSON.parse(JSON.stringify(mockRoles)))

  function create(role: Omit<Role, 'id' | 'lastModified'>): Role {
    const now = new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-')
    const newRole: Role = { ...role, id: `role-${Date.now()}`, lastModified: now }
    roles.value.push(newRole)
    return newRole
  }

  function update(id: string, patch: Partial<Role>) {
    const idx = roles.value.findIndex(r => r.id === id)
    if (idx !== -1) {
      const now = new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-')
      roles.value[idx] = { ...roles.value[idx], ...patch, lastModified: now }
    }
  }

  function remove(id: string) {
    roles.value = roles.value.filter(r => r.id !== id)
  }

  function getById(id: string) {
    return roles.value.find(r => r.id === id)
  }

  return { roles, create, update, remove, getById }
})
