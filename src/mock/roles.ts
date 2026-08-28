export interface Role {
  id: string
  name: string
  description: string
  modules: string[]
  userCount: number
  status: 'active' | 'inactive'
  lastModified: string
  menuPermissions: string[]   // 已选的菜单/功能节点 ID
  apiPermissions: string[]    // 已选的 API 节点 ID
}

export const mockRoles: Role[] = [
  {
    id: 'role-001',
    name: 'Admin-New',
    description: 'client portal的管理员角色，拥有Client portal3.0的所有操作权限',
    modules: ['Dashboards', 'Web Methods', 'International'],
    userCount: 1,
    status: 'active',
    lastModified: '2026-08-27 11:30',
    menuPermissions: ['dashboards', 'otif-dashboard', 'otif-view', 'kpi-dashboard', 'kpi-view', 'kpi-create-project', 'purchase-management', 'purchase-request', 'pr-view', 'pr-add-new'],
    apiPermissions: ['po-module', 'po-resource', 'po-list', 'po-detail', 'inventory-module', 'inv-onhand', 'inv-oh-read']
  },
  {
    id: 'role-002',
    name: 'yqtest',
    description: '',
    modules: ['Sales Order', 'Purchase Management', 'Dashboards'],
    userCount: 1,
    status: 'active',
    lastModified: '2026-08-25 14:38',
    menuPermissions: ['sales-order', 'wholesale-orders', 'wo-view', 'purchase-management', 'projects', 'projects-view'],
    apiPermissions: ['so-module', 'so-wholesale', 'so-ws-list']
  },
  {
    id: 'role-003',
    name: 'test',
    description: 'test123456',
    modules: ['Integrations', 'User Profile', 'System Management'],
    userCount: 7,
    status: 'active',
    lastModified: '2026-04-03 14:43',
    menuPermissions: ['system-management', 'integrations', 'int-view'],
    apiPermissions: ['finance-module', 'fin-invoice', 'fin-inv-list', 'fin-inv-download']
  },
  {
    id: 'role-004',
    name: '123',
    description: '234',
    modules: ['Purchase Management'],
    userCount: 1,
    status: 'inactive',
    lastModified: '2026-04-02 15:33',
    menuPermissions: ['purchase-management'],
    apiPermissions: []
  }
]
