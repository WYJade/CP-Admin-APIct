// CP3.0 菜单功能树（用于角色管理 > 菜单功能/API权限 配置）
export interface MenuNode {
  id: string
  label: string
  type: 'module' | 'menu' | 'action'
  children?: MenuNode[]
  // 每个 action 节点对应的 API 名称列表（用于右侧 API 勾选列）
  apiNames?: ApiNameItem[]
}

// API 名称条目
export interface ApiNameItem {
  id: string          // 唯一 ID，用于权限勾选
  name: string        // 对外显示的 API 名称（业务语言）
  action: string      // 对应的 API Action 标识
}

export const cpMenuTree: MenuNode[] = [
  {
    id: 'dashboards', label: 'Dashboards', type: 'module', children: [
      { id: 'otif-dashboard', label: 'OTIF Dashboard', type: 'menu', children: [
        { id: 'otif-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-otif-view', name: 'OTIF Dashboard View', action: 'inventory.onhand.read' }
        ]}
      ]},
      { id: 'kpi-dashboard', label: 'KPI Dashboard', type: 'menu', children: [
        { id: 'kpi-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-kpi-view', name: 'KPI Dashboard View', action: 'inventory.onhand.read' },
          { id: 'api-kpi-order', name: 'KPI Order Summary Query', action: 'order.read' }
        ]},
        { id: 'kpi-create-project', label: 'Create Project', type: 'action', apiNames: [
          { id: 'api-kpi-create', name: 'Create KPI Project', action: 'order.update' }
        ]}
      ]},
      { id: 'ticket-insights', label: 'Ticket Insights', type: 'menu', children: [
        { id: 'ticket-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-ticket-view', name: 'Ticket Insights Query', action: 'order.read' }
        ]}
      ]}
    ]
  },
  {
    id: 'purchase-management', label: 'Purchase Management', type: 'module', children: [
      { id: 'projects', label: 'Projects', type: 'menu', children: [
        { id: 'projects-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-proj-view', name: 'Project List Query', action: 'order.read' }
        ]}
      ]},
      { id: 'purchase-request', label: 'Purchase Request', type: 'menu', children: [
        { id: 'pr-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-pr-view', name: 'Purchase Request List Query', action: 'order.read' }
        ]},
        { id: 'pr-add-new', label: 'Add New', type: 'action', apiNames: [
          { id: 'api-pr-create', name: 'Create Purchase Request', action: 'order.update' }
        ]},
        { id: 'pr-create-po', label: 'Create PO', type: 'action', apiNames: [
          { id: 'api-pr-po', name: 'Create Purchase Order', action: 'order.update' },
          { id: 'api-pr-inv', name: 'Inventory Availability Query', action: 'inventory.onhand.read' }
        ]},
        { id: 'pr-export', label: 'Export', type: 'action', apiNames: [
          { id: 'api-pr-export', name: 'Export Purchase Request Report', action: 'inventory.aging.export' }
        ]}
      ]},
      { id: 'purchase-order', label: 'Purchase Order', type: 'menu', children: [
        { id: 'po-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-po-view', name: 'Purchase Order List Query', action: 'order.read' }
        ]}
      ]}
    ]
  },
  {
    id: 'sales-order', label: 'Sales Order', type: 'module', children: [
      { id: 'wholesale-orders', label: 'Wholesale Orders', type: 'menu', children: [
        { id: 'wo-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-wo-view', name: 'Wholesale Order List Query', action: 'order.read' }
        ]}
      ]},
      { id: 'retail-orders', label: 'Retail Orders', type: 'menu', children: [
        { id: 'ro-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-ro-view', name: 'Retail Order List Query', action: 'order.read' },
          { id: 'api-ro-update', name: 'Update Retail Order Status', action: 'order.update' }
        ]}
      ]},
      { id: 'work-order', label: 'Work Order', type: 'menu' }
    ]
  },
  {
    id: 'inbound', label: 'Inbound', type: 'module', children: [
      { id: 'inquiry', label: 'Inquiry', type: 'menu', children: [
        { id: 'inq-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-inq-view1', name: 'Inbound Receipt Query', action: 'order.read' },
          { id: 'api-inq-view2', name: 'Inbound SKU Detail Query', action: 'inventory.onhand.read' }
        ]},
        { id: 'inq-export', label: 'Export', type: 'action', apiNames: [
          { id: 'api-inq-exp', name: 'Export Inbound Inquiry Details', action: 'inventory.aging.export' }
        ]},
        { id: 'inq-download', label: 'Download Item Level', type: 'action', apiNames: [
          { id: 'api-inq-dl1', name: 'Download Inbound Item Level Report', action: 'inventory.aging.export' },
          { id: 'api-inq-dl2', name: 'Download SKU Quantity Breakdown', action: 'inventory.onhand.read' }
        ]},
        { id: 'inq-edit', label: 'Edit', type: 'action', apiNames: [
          { id: 'api-inq-edit', name: 'Update Inbound Inquiry Record', action: 'order.update' }
        ]}
      ]},
      { id: 'asn', label: 'ASN', type: 'menu', children: [
        { id: 'asn-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-asn-view', name: 'ASN List Query', action: 'order.read' }
        ]},
        { id: 'asn-create', label: 'Create', type: 'action', apiNames: [
          { id: 'api-asn-create1', name: 'Create ASN Record', action: 'order.update' },
          { id: 'api-asn-create2', name: 'Validate ASN Inventory', action: 'inventory.onhand.read' }
        ]}
      ]}
    ]
  },
  {
    id: 'outbound', label: 'Outbound', type: 'module', children: [
      { id: 'shipment', label: 'Shipment', type: 'menu', children: [
        { id: 'ship-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-ship-view', name: 'Shipment List Query', action: 'order.read' }
        ]},
        { id: 'ship-create', label: 'Create', type: 'action', apiNames: [
          { id: 'api-ship-create1', name: 'Create Shipment Order', action: 'order.update' },
          { id: 'api-ship-create2', name: 'Check Outbound Inventory', action: 'inventory.onhand.read' }
        ]},
        { id: 'ship-cancel', label: 'Cancel', type: 'action', apiNames: [
          { id: 'api-ship-cancel', name: 'Cancel Shipment Execution', action: 'shipment.cancel.execute' }
        ]},
        { id: 'ship-export', label: 'Export', type: 'action', apiNames: [
          { id: 'api-ship-export', name: 'Export Shipment Report', action: 'inventory.aging.export' }
        ]}
      ]},
      { id: 'delivery', label: 'Delivery', type: 'menu', children: [
        { id: 'del-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-del-view', name: 'Delivery Order List Query', action: 'order.read' }
        ]}
      ]}
    ]
  },
  {
    id: 'inventory', label: 'Inventory', type: 'module', children: [
      { id: 'stock-overview', label: 'Stock Overview', type: 'menu', children: [
        { id: 'stock-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-stk-view', name: 'On-Hand Inventory Query', action: 'inventory.onhand.read' }
        ]},
        { id: 'stock-export', label: 'Export', type: 'action', apiNames: [
          { id: 'api-stk-exp', name: 'Export On-Hand Inventory Report', action: 'inventory.aging.export' }
        ]}
      ]},
      { id: 'aging-report', label: 'Aging Report', type: 'menu', children: [
        { id: 'aging-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-age-view1', name: 'Inventory Aging Report Query', action: 'inventory.onhand.read' },
          { id: 'api-age-view2', name: 'Aging Analysis by SKU', action: 'inventory.aging.export' }
        ]},
        { id: 'aging-export', label: 'Export', type: 'action', apiNames: [
          { id: 'api-age-exp', name: 'Export Inventory Aging Report', action: 'inventory.aging.export' }
        ]}
      ]}
    ]
  },
  {
    id: 'finance', label: 'Finance', type: 'module', children: [
      { id: 'invoice', label: 'Invoice', type: 'menu', children: [
        { id: 'inv-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-inv-view', name: 'Invoice List Query', action: 'invoice.download' }
        ]},
        { id: 'inv-download', label: 'Download', type: 'action', apiNames: [
          { id: 'api-inv-dl', name: 'Download Invoice PDF', action: 'invoice.download' }
        ]}
      ]},
      { id: 'billing', label: 'Billing', type: 'menu', children: [
        { id: 'bill-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-bill-view1', name: 'Billing Statement Query', action: 'invoice.download' },
          { id: 'api-bill-view2', name: 'Billing Detail by Customer', action: 'order.read' }
        ]}
      ]}
    ]
  },
  {
    id: 'exception-management', label: 'Exception Management', type: 'module', children: [
      { id: 'exceptions', label: 'Exceptions', type: 'menu', children: [
        { id: 'exc-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-exc-view', name: 'Exception Alert List Query', action: 'order.read' }
        ]},
        { id: 'exc-resolve', label: 'Resolve', type: 'action', apiNames: [
          { id: 'api-exc-res1', name: 'Resolve Exception Record', action: 'order.update' },
          { id: 'api-exc-res2', name: 'Cancel Shipment for Exception', action: 'shipment.cancel.execute' }
        ]}
      ]}
    ]
  },
  {
    id: 'reports', label: 'Reports', type: 'module', children: [
      { id: 'report-list', label: 'Report List', type: 'menu', children: [
        { id: 'rep-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-rep-view1', name: 'Report Dashboard Query', action: 'inventory.onhand.read' },
          { id: 'api-rep-view2', name: 'Order Summary Report Query', action: 'order.read' }
        ]},
        { id: 'rep-export', label: 'Export', type: 'action', apiNames: [
          { id: 'api-rep-exp', name: 'Export Custom Report', action: 'inventory.aging.export' }
        ]}
      ]}
    ]
  },
  {
    id: 'user-profile', label: 'User Profile', type: 'module', children: [
      { id: 'profile-settings', label: 'Settings', type: 'menu', children: [
        { id: 'prof-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-prof-view', name: 'User Profile Query', action: 'order.read' }
        ]},
        { id: 'prof-edit', label: 'Edit', type: 'action', apiNames: [
          { id: 'api-prof-edit', name: 'Update User Profile', action: 'order.update' }
        ]}
      ]}
    ]
  },
  {
    id: 'system-management', label: 'System Management', type: 'module', children: [
      { id: 'integrations', label: 'Integrations', type: 'menu', children: [
        { id: 'int-view', label: 'View', type: 'action', apiNames: [
          { id: 'api-int-view', name: 'Integration Configuration Query', action: 'order.read' }
        ]},
        { id: 'int-configure', label: 'Configure', type: 'action', apiNames: [
          { id: 'api-int-cfg1', name: 'Update Integration Settings', action: 'order.update' },
          { id: 'api-int-cfg2', name: 'Verify Integration Connectivity', action: 'inventory.onhand.read' }
        ]}
      ]}
    ]
  }
]

// CP3.0 API 目录树（用于角色管理 > API权限 页签）
export interface ApiTreeNode {
  id: string
  label: string
  type: 'module' | 'resource' | 'api'
  method?: string
  path?: string
  riskLevel?: string
  children?: ApiTreeNode[]
}

export const cpApiTree: ApiTreeNode[] = [
  {
    id: 'po-module', label: 'PO（采购订单）', type: 'module', children: [
      { id: 'po-resource', label: 'Purchase Orders', type: 'resource', children: [
        { id: 'po-list', label: 'GET /api/v3/purchase-orders', type: 'api', method: 'GET', path: '/api/v3/purchase-orders', riskLevel: 'L1' },
        { id: 'po-detail', label: 'GET /api/v3/purchase-orders/{id}', type: 'api', method: 'GET', path: '/api/v3/purchase-orders/{id}', riskLevel: 'L1' },
        { id: 'po-create', label: 'POST /api/v3/purchase-orders', type: 'api', method: 'POST', path: '/api/v3/purchase-orders', riskLevel: 'L2' },
        { id: 'po-update', label: 'PATCH /api/v3/purchase-orders/{id}', type: 'api', method: 'PATCH', path: '/api/v3/purchase-orders/{id}', riskLevel: 'L3' },
        { id: 'po-export', label: 'POST /api/v3/purchase-orders/export', type: 'api', method: 'POST', path: '/api/v3/purchase-orders/export', riskLevel: 'L2' }
      ]}
    ]
  },
  {
    id: 'so-module', label: 'SO（销售订单）', type: 'module', children: [
      { id: 'so-wholesale', label: 'Wholesale Orders', type: 'resource', children: [
        { id: 'so-ws-list', label: 'GET /api/v3/sales-orders/wholesale', type: 'api', method: 'GET', path: '/api/v3/sales-orders/wholesale', riskLevel: 'L1' },
        { id: 'so-ws-detail', label: 'GET /api/v3/sales-orders/wholesale/{id}', type: 'api', method: 'GET', path: '/api/v3/sales-orders/wholesale/{id}', riskLevel: 'L1' }
      ]},
      { id: 'so-retail', label: 'Retail Orders', type: 'resource', children: [
        { id: 'so-rt-list', label: 'GET /api/v3/sales-orders/retail', type: 'api', method: 'GET', path: '/api/v3/sales-orders/retail', riskLevel: 'L1' },
        { id: 'so-rt-update', label: 'PATCH /api/v3/sales-orders/retail/{id}', type: 'api', method: 'PATCH', path: '/api/v3/sales-orders/retail/{id}', riskLevel: 'L3' }
      ]}
    ]
  },
  {
    id: 'inbound-module', label: 'Inbound（入库）', type: 'module', children: [
      { id: 'inbound-inquiry', label: 'Inquiry', type: 'resource', children: [
        { id: 'inb-inq-list', label: 'GET /api/v3/inbound/inquiries', type: 'api', method: 'GET', path: '/api/v3/inbound/inquiries', riskLevel: 'L1' },
        { id: 'inb-inq-export', label: 'POST /api/v3/inbound/inquiries/export', type: 'api', method: 'POST', path: '/api/v3/inbound/inquiries/export', riskLevel: 'L2' },
        { id: 'inb-inq-edit', label: 'PATCH /api/v3/inbound/inquiries/{id}', type: 'api', method: 'PATCH', path: '/api/v3/inbound/inquiries/{id}', riskLevel: 'L3' }
      ]},
      { id: 'inbound-asn', label: 'ASN', type: 'resource', children: [
        { id: 'inb-asn-list', label: 'GET /api/v3/inbound/asn', type: 'api', method: 'GET', path: '/api/v3/inbound/asn', riskLevel: 'L1' },
        { id: 'inb-asn-create', label: 'POST /api/v3/inbound/asn', type: 'api', method: 'POST', path: '/api/v3/inbound/asn', riskLevel: 'L2' }
      ]}
    ]
  },
  {
    id: 'outbound-module', label: 'Outbound（出库）', type: 'module', children: [
      { id: 'outb-shipment', label: 'Shipment', type: 'resource', children: [
        { id: 'outb-ship-list', label: 'GET /api/v3/shipments', type: 'api', method: 'GET', path: '/api/v3/shipments', riskLevel: 'L1' },
        { id: 'outb-ship-create', label: 'POST /api/v3/shipments', type: 'api', method: 'POST', path: '/api/v3/shipments', riskLevel: 'L2' },
        { id: 'outb-ship-cancel', label: 'POST /api/v3/shipments/{id}/cancel', type: 'api', method: 'POST', path: '/api/v3/shipments/{id}/cancel', riskLevel: 'L4' },
        { id: 'outb-ship-export', label: 'POST /api/v3/shipments/export', type: 'api', method: 'POST', path: '/api/v3/shipments/export', riskLevel: 'L2' }
      ]}
    ]
  },
  {
    id: 'inventory-module', label: 'Inventory（库存）', type: 'module', children: [
      { id: 'inv-onhand', label: 'On-Hand', type: 'resource', children: [
        { id: 'inv-oh-read', label: 'GET /api/v3/inventory/on-hand', type: 'api', method: 'GET', path: '/api/v3/inventory/on-hand', riskLevel: 'L1' },
        { id: 'inv-oh-export', label: 'POST /api/v3/inventory/on-hand/export', type: 'api', method: 'POST', path: '/api/v3/inventory/on-hand/export', riskLevel: 'L2' }
      ]},
      { id: 'inv-aging', label: 'Aging Report', type: 'resource', children: [
        { id: 'inv-aging-read', label: 'GET /api/v3/inventory/aging', type: 'api', method: 'GET', path: '/api/v3/inventory/aging', riskLevel: 'L1' },
        { id: 'inv-aging-export', label: 'POST /api/v3/inventory/aging/export', type: 'api', method: 'POST', path: '/api/v3/inventory/aging/export', riskLevel: 'L2' }
      ]}
    ]
  },
  {
    id: 'shipping-module', label: 'Shipping（发货）', type: 'module', children: [
      { id: 'ship-tracking', label: 'Tracking', type: 'resource', children: [
        { id: 'trk-list', label: 'GET /api/v3/shipping/tracking', type: 'api', method: 'GET', path: '/api/v3/shipping/tracking', riskLevel: 'L1' },
        { id: 'trk-detail', label: 'GET /api/v3/shipping/tracking/{id}', type: 'api', method: 'GET', path: '/api/v3/shipping/tracking/{id}', riskLevel: 'L1' }
      ]},
      { id: 'ship-labels', label: 'Labels', type: 'resource', children: [
        { id: 'lbl-print', label: 'POST /api/v3/shipping/labels/print', type: 'api', method: 'POST', path: '/api/v3/shipping/labels/print', riskLevel: 'L2' }
      ]}
    ]
  },
  {
    id: 'finance-module', label: 'Finance（财务）', type: 'module', children: [
      { id: 'fin-invoice', label: 'Invoice', type: 'resource', children: [
        { id: 'fin-inv-list', label: 'GET /api/v3/invoices', type: 'api', method: 'GET', path: '/api/v3/invoices', riskLevel: 'L1' },
        { id: 'fin-inv-download', label: 'GET /api/v3/invoices/{id}/download', type: 'api', method: 'GET', path: '/api/v3/invoices/{id}/download', riskLevel: 'L2' }
      ]},
      { id: 'fin-billing', label: 'Billing', type: 'resource', children: [
        { id: 'fin-bill-list', label: 'GET /api/v3/billing', type: 'api', method: 'GET', path: '/api/v3/billing', riskLevel: 'L1' }
      ]}
    ]
  },
  {
    id: 'exception-module', label: 'Exception（异常）', type: 'module', children: [
      { id: 'exc-alerts', label: 'Alerts', type: 'resource', children: [
        { id: 'exc-list', label: 'GET /api/v3/exceptions', type: 'api', method: 'GET', path: '/api/v3/exceptions', riskLevel: 'L1' },
        { id: 'exc-resolve', label: 'POST /api/v3/exceptions/{id}/resolve', type: 'api', method: 'POST', path: '/api/v3/exceptions/{id}/resolve', riskLevel: 'L3' }
      ]}
    ]
  },
  {
    id: 'reporting-module', label: 'Reporting（报表）', type: 'module', children: [
      { id: 'rep-reports', label: 'Reports', type: 'resource', children: [
        { id: 'rep-list', label: 'GET /api/v3/reports', type: 'api', method: 'GET', path: '/api/v3/reports', riskLevel: 'L1' },
        { id: 'rep-export', label: 'POST /api/v3/reports/export', type: 'api', method: 'POST', path: '/api/v3/reports/export', riskLevel: 'L2' }
      ]}
    ]
  }
]
