import type { BusinessPermission, BusinessMapping } from '@/types'

export const mockBusinessPermissions: BusinessPermission[] = [
  { id: 'perm-001', key: 'MENU_INVENTORY', displayName: '库存管理', description: '访问库存查询、库存报表、老化导出等功能' },
  { id: 'perm-002', key: 'MENU_ORDER', displayName: '订单管理', description: '访问订单查询、订单详情、订单操作等功能' },
  { id: 'perm-003', key: 'MENU_SHIPMENT', displayName: '发货管理', description: '访问发货单查询、发货操作、取消发货等功能' },
  { id: 'perm-004', key: 'MENU_BILLING', displayName: '账单管理', description: '访问发票查询、账单下载等财务功能' },
  { id: 'perm-005', key: 'MENU_DASHBOARD', displayName: '仪表盘', description: '访问各类仪表盘和数据看板' },
  { id: 'perm-006', key: 'MENU_INBOUND', displayName: '入库管理', description: '访问入库询单、ASN等入库功能' },
  { id: 'perm-007', key: 'MENU_REPORTS', displayName: '报表管理', description: '访问报表查看和导出功能' },
  { id: 'perm-008', key: 'MENU_EXCEPTION', displayName: '异常管理', description: '访问异常查看和处理功能' },
]

export const mockBusinessMappings: BusinessMapping[] = [
  // ── Dashboards ──
  { id: 'map-d01', businessPermissionKey: 'MENU_DASHBOARD', apiAction: 'inventory.onhand.read', createdAt: '2026-01-10T00:00:00Z' },
  { id: 'map-d02', businessPermissionKey: 'MENU_DASHBOARD', apiAction: 'order.read', createdAt: '2026-01-10T00:00:00Z' },
  // ── Inventory ──
  { id: 'map-001', businessPermissionKey: 'MENU_INVENTORY', apiAction: 'inventory.onhand.read', createdAt: '2026-01-10T00:00:00Z' },
  { id: 'map-002', businessPermissionKey: 'MENU_INVENTORY', apiAction: 'inventory.aging.export', createdAt: '2026-01-10T00:00:00Z' },
  // ── Order ──
  { id: 'map-003', businessPermissionKey: 'MENU_ORDER', apiAction: 'order.read', createdAt: '2026-02-10T00:00:00Z' },
  { id: 'map-004', businessPermissionKey: 'MENU_ORDER', apiAction: 'order.update', createdAt: '2026-02-10T00:00:00Z' },
  // ── Shipment ──
  { id: 'map-005', businessPermissionKey: 'MENU_SHIPMENT', apiAction: 'shipment.cancel.execute', createdAt: '2026-03-10T00:00:00Z' },
  // ── Billing ──
  { id: 'map-006', businessPermissionKey: 'MENU_BILLING', apiAction: 'invoice.download', createdAt: '2026-04-10T00:00:00Z' },
  // ── Inbound ──
  { id: 'map-007', businessPermissionKey: 'MENU_INBOUND', apiAction: 'order.read', createdAt: '2026-03-01T00:00:00Z' },
]

// ─────────────────────────────────────────────────────────────────
// 菜单节点 ID → 业务权限 key（全量覆盖所有节点）
// ─────────────────────────────────────────────────────────────────
export const menuNodeToPermKey: Record<string, string> = {
  // ── Dashboards 模块 ──
  'dashboards': 'MENU_DASHBOARD',
  'otif-dashboard': 'MENU_DASHBOARD',
  'otif-view': 'MENU_DASHBOARD',
  'kpi-dashboard': 'MENU_DASHBOARD',
  'kpi-view': 'MENU_DASHBOARD',
  'kpi-create-project': 'MENU_DASHBOARD',
  'ticket-insights': 'MENU_DASHBOARD',
  'ticket-view': 'MENU_DASHBOARD',

  // ── Purchase Management 模块 ──
  'purchase-management': 'MENU_ORDER',
  'projects': 'MENU_ORDER',
  'projects-view': 'MENU_ORDER',
  'purchase-request': 'MENU_ORDER',
  'pr-view': 'MENU_ORDER',
  'pr-add-new': 'MENU_ORDER',
  'pr-create-po': 'MENU_ORDER',
  'pr-export': 'MENU_ORDER',
  'purchase-order': 'MENU_ORDER',
  'po-view': 'MENU_ORDER',

  // ── Sales Order 模块 ──
  'sales-order': 'MENU_ORDER',
  'wholesale-orders': 'MENU_ORDER',
  'wo-view': 'MENU_ORDER',
  'retail-orders': 'MENU_ORDER',
  'ro-view': 'MENU_ORDER',
  'work-order': 'MENU_ORDER',

  // ── Inbound 模块 ──
  'inbound': 'MENU_INBOUND',
  'inquiry': 'MENU_INBOUND',
  'inq-view': 'MENU_INBOUND',
  'inq-export': 'MENU_INBOUND',
  'inq-download': 'MENU_INBOUND',
  'inq-edit': 'MENU_INBOUND',
  'asn': 'MENU_INBOUND',
  'asn-view': 'MENU_INBOUND',
  'asn-create': 'MENU_INBOUND',

  // ── Outbound 模块 ──
  'outbound': 'MENU_SHIPMENT',
  'shipment': 'MENU_SHIPMENT',
  'ship-view': 'MENU_SHIPMENT',
  'ship-create': 'MENU_SHIPMENT',
  'ship-cancel': 'MENU_SHIPMENT',
  'ship-export': 'MENU_SHIPMENT',
  'delivery': 'MENU_SHIPMENT',
  'del-view': 'MENU_SHIPMENT',

  // ── Inventory 模块 ──
  'inventory': 'MENU_INVENTORY',
  'stock-overview': 'MENU_INVENTORY',
  'stock-view': 'MENU_INVENTORY',
  'stock-export': 'MENU_INVENTORY',
  'aging-report': 'MENU_INVENTORY',
  'aging-view': 'MENU_INVENTORY',
  'aging-export': 'MENU_INVENTORY',

  // ── Finance 模块 ──
  'finance': 'MENU_BILLING',
  'invoice': 'MENU_BILLING',
  'inv-view': 'MENU_BILLING',
  'inv-download': 'MENU_BILLING',
  'billing': 'MENU_BILLING',
  'bill-view': 'MENU_BILLING',

  // ── Exception 模块 ──
  'exception-management': 'MENU_EXCEPTION',
  'exceptions': 'MENU_EXCEPTION',
  'exc-view': 'MENU_EXCEPTION',
  'exc-resolve': 'MENU_EXCEPTION',

  // ── Reports 模块 ──
  'reports': 'MENU_REPORTS',
  'report-list': 'MENU_REPORTS',
  'rep-view': 'MENU_REPORTS',
  'rep-export': 'MENU_REPORTS',

  // ── User Profile 模块 ──
  'user-profile': 'MENU_DASHBOARD',
  'profile-settings': 'MENU_DASHBOARD',
  'prof-view': 'MENU_DASHBOARD',
  'prof-edit': 'MENU_DASHBOARD',

  // ── System Management 模块 ──
  'system-management': 'MENU_DASHBOARD',
  'integrations': 'MENU_DASHBOARD',
  'int-view': 'MENU_DASHBOARD',
  'int-configure': 'MENU_DASHBOARD',
}

// ─────────────────────────────────────────────────────────────────
// 节点级 API 映射示例数据（直接按节点 ID 存储，优先级高于 perm key 映射）
// 功能按钮节点点击时直接显示这里的数据
// ─────────────────────────────────────────────────────────────────
export const nodeDirectMappings: Record<string, BusinessMapping[]> = {
  // Dashboards
  'otif-view': [
    { id: 'nd-d01', businessPermissionKey: 'MENU_DASHBOARD', apiAction: 'inventory.onhand.read', createdAt: '2026-01-10T00:00:00Z' },
    { id: 'nd-d02', businessPermissionKey: 'MENU_DASHBOARD', apiAction: 'order.read', createdAt: '2026-01-10T00:00:00Z' },
  ],
  'kpi-view': [
    { id: 'nd-d03', businessPermissionKey: 'MENU_DASHBOARD', apiAction: 'inventory.onhand.read', createdAt: '2026-01-10T00:00:00Z' },
  ],
  'kpi-create-project': [
    { id: 'nd-d04', businessPermissionKey: 'MENU_DASHBOARD', apiAction: 'order.update', createdAt: '2026-01-10T00:00:00Z' },
  ],
  'ticket-view': [
    { id: 'nd-d05', businessPermissionKey: 'MENU_DASHBOARD', apiAction: 'order.read', createdAt: '2026-01-10T00:00:00Z' },
  ],

  // Purchase Request
  'pr-view': [
    { id: 'nd-pr01', businessPermissionKey: 'MENU_ORDER', apiAction: 'order.read', createdAt: '2026-02-10T00:00:00Z' },
  ],
  'pr-add-new': [
    { id: 'nd-pr02', businessPermissionKey: 'MENU_ORDER', apiAction: 'order.update', createdAt: '2026-02-10T00:00:00Z' },
  ],
  'pr-create-po': [
    { id: 'nd-pr03', businessPermissionKey: 'MENU_ORDER', apiAction: 'order.update', createdAt: '2026-02-10T00:00:00Z' },
    { id: 'nd-pr04', businessPermissionKey: 'MENU_ORDER', apiAction: 'inventory.onhand.read', createdAt: '2026-02-10T00:00:00Z' },
  ],
  'pr-export': [
    { id: 'nd-pr05', businessPermissionKey: 'MENU_ORDER', apiAction: 'inventory.aging.export', createdAt: '2026-02-10T00:00:00Z' },
  ],
  'po-view': [
    { id: 'nd-po01', businessPermissionKey: 'MENU_ORDER', apiAction: 'order.read', createdAt: '2026-02-10T00:00:00Z' },
  ],
  'projects-view': [
    { id: 'nd-pj01', businessPermissionKey: 'MENU_ORDER', apiAction: 'order.read', createdAt: '2026-02-10T00:00:00Z' },
  ],

  // Sales Order
  'wo-view': [
    { id: 'nd-so01', businessPermissionKey: 'MENU_ORDER', apiAction: 'order.read', createdAt: '2026-02-10T00:00:00Z' },
  ],
  'ro-view': [
    { id: 'nd-so02', businessPermissionKey: 'MENU_ORDER', apiAction: 'order.read', createdAt: '2026-02-10T00:00:00Z' },
    { id: 'nd-so03', businessPermissionKey: 'MENU_ORDER', apiAction: 'order.update', createdAt: '2026-02-10T00:00:00Z' },
  ],

  // Inbound
  'inq-view': [
    { id: 'nd-ib01', businessPermissionKey: 'MENU_INBOUND', apiAction: 'order.read', createdAt: '2026-03-01T00:00:00Z' },
  ],
  'inq-export': [
    { id: 'nd-ib02', businessPermissionKey: 'MENU_INBOUND', apiAction: 'inventory.aging.export', createdAt: '2026-03-01T00:00:00Z' },
  ],
  'inq-download': [
    { id: 'nd-ib03', businessPermissionKey: 'MENU_INBOUND', apiAction: 'inventory.aging.export', createdAt: '2026-03-01T00:00:00Z' },
    { id: 'nd-ib04', businessPermissionKey: 'MENU_INBOUND', apiAction: 'inventory.onhand.read', createdAt: '2026-03-01T00:00:00Z' },
  ],
  'inq-edit': [
    { id: 'nd-ib05', businessPermissionKey: 'MENU_INBOUND', apiAction: 'order.update', createdAt: '2026-03-01T00:00:00Z' },
  ],
  'asn-view': [
    { id: 'nd-ib06', businessPermissionKey: 'MENU_INBOUND', apiAction: 'order.read', createdAt: '2026-03-01T00:00:00Z' },
  ],
  'asn-create': [
    { id: 'nd-ib07', businessPermissionKey: 'MENU_INBOUND', apiAction: 'order.update', createdAt: '2026-03-01T00:00:00Z' },
    { id: 'nd-ib08', businessPermissionKey: 'MENU_INBOUND', apiAction: 'inventory.onhand.read', createdAt: '2026-03-01T00:00:00Z' },
  ],

  // Outbound / Shipment
  'ship-view': [
    { id: 'nd-ob01', businessPermissionKey: 'MENU_SHIPMENT', apiAction: 'order.read', createdAt: '2026-03-10T00:00:00Z' },
  ],
  'ship-create': [
    { id: 'nd-ob02', businessPermissionKey: 'MENU_SHIPMENT', apiAction: 'order.update', createdAt: '2026-03-10T00:00:00Z' },
    { id: 'nd-ob03', businessPermissionKey: 'MENU_SHIPMENT', apiAction: 'inventory.onhand.read', createdAt: '2026-03-10T00:00:00Z' },
  ],
  'ship-cancel': [
    { id: 'nd-ob04', businessPermissionKey: 'MENU_SHIPMENT', apiAction: 'shipment.cancel.execute', createdAt: '2026-03-10T00:00:00Z' },
  ],
  'ship-export': [
    { id: 'nd-ob05', businessPermissionKey: 'MENU_SHIPMENT', apiAction: 'inventory.aging.export', createdAt: '2026-03-10T00:00:00Z' },
  ],
  'del-view': [
    { id: 'nd-ob06', businessPermissionKey: 'MENU_SHIPMENT', apiAction: 'order.read', createdAt: '2026-03-10T00:00:00Z' },
  ],

  // Inventory
  'stock-view': [
    { id: 'nd-inv01', businessPermissionKey: 'MENU_INVENTORY', apiAction: 'inventory.onhand.read', createdAt: '2026-01-10T00:00:00Z' },
  ],
  'stock-export': [
    { id: 'nd-inv02', businessPermissionKey: 'MENU_INVENTORY', apiAction: 'inventory.aging.export', createdAt: '2026-01-10T00:00:00Z' },
  ],
  'aging-view': [
    { id: 'nd-inv03', businessPermissionKey: 'MENU_INVENTORY', apiAction: 'inventory.onhand.read', createdAt: '2026-01-10T00:00:00Z' },
    { id: 'nd-inv04', businessPermissionKey: 'MENU_INVENTORY', apiAction: 'inventory.aging.export', createdAt: '2026-01-10T00:00:00Z' },
  ],
  'aging-export': [
    { id: 'nd-inv05', businessPermissionKey: 'MENU_INVENTORY', apiAction: 'inventory.aging.export', createdAt: '2026-01-10T00:00:00Z' },
  ],

  // Finance
  'inv-view': [
    { id: 'nd-fi01', businessPermissionKey: 'MENU_BILLING', apiAction: 'invoice.download', createdAt: '2026-04-10T00:00:00Z' },
  ],
  'inv-download': [
    { id: 'nd-fi02', businessPermissionKey: 'MENU_BILLING', apiAction: 'invoice.download', createdAt: '2026-04-10T00:00:00Z' },
  ],
  'bill-view': [
    { id: 'nd-fi03', businessPermissionKey: 'MENU_BILLING', apiAction: 'invoice.download', createdAt: '2026-04-10T00:00:00Z' },
    { id: 'nd-fi04', businessPermissionKey: 'MENU_BILLING', apiAction: 'order.read', createdAt: '2026-04-10T00:00:00Z' },
  ],

  // Exception
  'exc-view': [
    { id: 'nd-ex01', businessPermissionKey: 'MENU_EXCEPTION', apiAction: 'order.read', createdAt: '2026-05-01T00:00:00Z' },
  ],
  'exc-resolve': [
    { id: 'nd-ex02', businessPermissionKey: 'MENU_EXCEPTION', apiAction: 'order.update', createdAt: '2026-05-01T00:00:00Z' },
    { id: 'nd-ex03', businessPermissionKey: 'MENU_EXCEPTION', apiAction: 'shipment.cancel.execute', createdAt: '2026-05-01T00:00:00Z' },
  ],

  // Reports
  'rep-view': [
    { id: 'nd-rp01', businessPermissionKey: 'MENU_REPORTS', apiAction: 'inventory.onhand.read', createdAt: '2026-05-10T00:00:00Z' },
    { id: 'nd-rp02', businessPermissionKey: 'MENU_REPORTS', apiAction: 'order.read', createdAt: '2026-05-10T00:00:00Z' },
  ],
  'rep-export': [
    { id: 'nd-rp03', businessPermissionKey: 'MENU_REPORTS', apiAction: 'inventory.aging.export', createdAt: '2026-05-10T00:00:00Z' },
  ],

  // Profile
  'prof-view': [
    { id: 'nd-pf01', businessPermissionKey: 'MENU_DASHBOARD', apiAction: 'order.read', createdAt: '2026-06-01T00:00:00Z' },
  ],
  'prof-edit': [
    { id: 'nd-pf02', businessPermissionKey: 'MENU_DASHBOARD', apiAction: 'order.update', createdAt: '2026-06-01T00:00:00Z' },
  ],
  'int-view': [
    { id: 'nd-sy01', businessPermissionKey: 'MENU_DASHBOARD', apiAction: 'order.read', createdAt: '2026-06-01T00:00:00Z' },
  ],
  'int-configure': [
    { id: 'nd-sy02', businessPermissionKey: 'MENU_DASHBOARD', apiAction: 'order.update', createdAt: '2026-06-01T00:00:00Z' },
    { id: 'nd-sy03', businessPermissionKey: 'MENU_DASHBOARD', apiAction: 'inventory.onhand.read', createdAt: '2026-06-01T00:00:00Z' },
  ],
}
