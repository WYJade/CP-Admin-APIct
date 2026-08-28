# CP API 权限管理平台

Client Portal 3.0 API 权限控制配置管理系统 — 业务权限驱动 API · 调用端能力设上限 · 数据权限做最终边界

## 快速启动

```bash
cd cp-api-permission-admin
npm install
npm run dev
```

浏览器访问 http://localhost:5173

## 功能模块

| 模块 | 路径 | 说明 |
|------|------|------|
| API Catalog | `/api-admin/catalog` | 注册和管理所有 API 元数据（Action、渠道、风险等级、数据维度） |
| 业务映射 | `/api-admin/mapping` | 维护 CP-Admin 业务权限与 API Action 的映射关系 |
| 外部应用 | `/integration/apps` | 注册外部系统的 Service Principal 和应用信息 |
| 集成档案 | `/integration/profiles` | 为外部应用配置 Integration Profile（业务场景化的 API 权限包） |
| AI 能力档案 | `/ai-capability` | 配置 Agent/Ontology 的 Tool→Action 映射和 AI Mode 策略 |
| 授权模拟器 | `/authz-simulator` | 模拟八步授权算法决策，支持 ALLOW/DENY 路径追踪 |
| 审计与依赖 | `/audit` | 调用日志查询、API 依赖分析、Deprecated API 消费者监控 |

## 目录结构

```
src/
├── types/          # TypeScript 类型定义
├── mock/           # Mock 种子数据
├── stores/         # Pinia 状态管理（6个 Store）
├── router/         # Vue Router 路由配置
├── layout/         # AppLayout、AppSidebar、AppTopBar
├── components/
│   ├── common/     # 共享组件（TooltipLabel、RiskLevelTag 等）
│   ├── catalog/    # API Catalog 组件
│   ├── mapping/    # 业务映射组件
│   ├── integration/# 集成档案组件
│   └── ai-capability/ # AI 能力档案组件
├── views/          # 页面视图组件
└── styles/         # 主题（#7B5EA7 紫色）+ 全局样式
```

## Mock 数据说明

系统使用 Pinia Store 内存作为 Mock 数据层（无后端）：

- **6 个 API Action**：inventory.onhand.read (L1)、inventory.aging.export (L2)、order.read (L1)、order.update (L3)、shipment.cancel.execute (L4)、invoice.download (L2)
- **4 个 Business Permission**：MENU_INVENTORY、MENU_ORDER、MENU_SHIPMENT、MENU_BILLING
- **2 个外部应用**：ACME BI Platform、WMS Integration Service
- **2 个 Integration Profile**：EXT_INVENTORY_READONLY、EXT_ORDER_WRITE
- **3 个 AI Profile**：AGENT_INVENTORY_ADVISOR、AGENT_ORDER_ASSISTANT、ONTOLOGY_INVENTORY_SEARCH
- **50 条审计日志**

页面刷新后所有数据恢复初始状态。

## 授权决策算法

AuthZ Simulator 实现了完整的八步统一授权算法：

```
A. 身份验证 → B. API Catalog 检查 → C. Channel 检查 → D. Caller Capability
→ E. 业务权限检查 → F. Data Scope 检查 → G. 风险/上下文检查 → H. Obligation 输出
```

有效权限公式：
```
Effective API Access = API is ACTIVE
  AND Channel is allowed
  AND Caller capability permits API Action
  AND (if delegated user) CP-Admin business entitlement permits the Action
  AND requested resource ∈ Effective Tenant/Customer/Facility scope
  AND context/risk controls pass
  AND no explicit deny applies
```

## 技术栈

- **Vue 3** + Composition API (`<script setup>`)
- **TypeScript** (strict mode)
- **Vite** 5
- **Element Plus** 2.7（主题色 #7B5EA7）
- **Pinia** 2（状态管理 + Mock 数据层）
- **Vue Router** 4
