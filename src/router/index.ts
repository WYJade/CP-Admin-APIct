import { createRouter, createWebHistory } from 'vue-router'
import { ElNotification } from 'element-plus'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layout/AppLayout.vue'),
      redirect: '/permission/roles',
      children: [
        // ===== 仪表盘 =====
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue'),
          meta: { title: '首页' }
        },

        // ===== 权限管理（CP-Admin 原有） =====
        {
          path: 'permission/roles',
          name: 'RoleManagement',
          component: () => import('@/views/RoleManagementView.vue'),
          meta: { title: '角色管理', parent: 'permission' }
        },
        {
          path: 'permission/roles/new',
          name: 'RoleCreate',
          component: () => import('@/views/RoleEditView.vue'),
          meta: { title: '创建角色', parent: 'permission' }
        },
        {
          path: 'permission/roles/edit/:id',
          name: 'RoleEdit',
          component: () => import('@/views/RoleEditView.vue'),
          meta: { title: '编辑角色', parent: 'permission' }
        },
        {
          path: 'permission/users',
          name: 'UserManagement',
          component: () => import('@/views/PlaceholderView.vue'),
          meta: { title: '用户管理', parent: 'permission' }
        },
        {
          path: 'permission/portal-settings',
          name: 'PortalSettings',
          component: () => import('@/views/PlaceholderView.vue'),
          meta: { title: '客户 Portal 设置', parent: 'permission' }
        },
        {
          path: 'permission/accounts',
          name: 'Accounts',
          component: () => import('@/views/AccountManagementView.vue'),
          meta: { title: '账户管理', parent: 'permission' }
        },
        {
          path: 'permission/role-management',
          name: 'RoleManagement2',
          component: () => import('@/views/RoleManagementView.vue'),
          meta: { title: '角色管理', parent: 'permission' }
        },

        // ===== API Admin =====
        {
          path: 'api-admin/catalog',
          name: 'ApiCatalog',
          component: () => import('@/views/ApiCatalogView.vue'),
          meta: { title: 'API Catalog', parent: 'api-admin' }
        },
        {
          path: 'api-admin/mapping',
          name: 'BusinessMapping',
          component: () => import('@/views/BusinessMappingView.vue'),
          meta: { title: '菜单-API 映射', parent: 'api-admin' }
        },

        // ===== Integration Admin =====
        {
          path: 'integration/apps',
          name: 'IntegrationApps',
          component: () => import('@/views/IntegrationAppsView.vue'),
          meta: { title: '外部应用', parent: 'integration' }
        },
        {
          path: 'integration/profiles',
          name: 'IntegrationProfiles',
          component: () => import('@/views/IntegrationProfilesView.vue'),
          meta: { title: '集成档案', parent: 'integration' }
        },

        // ===== AI 能力档案 =====
        {
          path: 'ai-capability',
          name: 'AiCapability',
          component: () => import('@/views/AiCapabilityView.vue'),
          meta: { title: 'AI 能力档案' }
        },

        // ===== 授权模拟器 =====
        {
          path: 'authz-simulator',
          name: 'AuthzSimulator',
          component: () => import('@/views/AuthzSimulatorView.vue'),
          meta: { title: '授权模拟器' }
        },

        // ===== 审计与依赖 =====
        {
          path: 'audit',
          name: 'Audit',
          component: () => import('@/views/AuditView.vue'),
          meta: { title: '审计与依赖' }
        },

        // ===== 占位页面 =====
        {
          path: 'coupon/analysis',
          name: 'CouponAnalysis',
          component: () => import('@/views/PlaceholderView.vue'),
          meta: { title: '优惠券分析', parent: 'coupon' }
        },
        {
          path: 'coupon/rules',
          name: 'CouponRules',
          component: () => import('@/views/PlaceholderView.vue'),
          meta: { title: '优惠券规则', parent: 'coupon' }
        },
        {
          path: 'coupon/list',
          name: 'CouponList',
          component: () => import('@/views/PlaceholderView.vue'),
          meta: { title: '优惠券列表', parent: 'coupon' }
        },
        {
          path: 'notifications',
          name: 'Notifications',
          component: () => import('@/views/PlaceholderView.vue'),
          meta: { title: '公告/营销通知' }
        },
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: () => {
        ElNotification({ title: '提示', message: '页面不存在，已重定向到首页', type: 'warning', duration: 3000 })
        return '/permission/roles'
      }
    }
  ]
})

export default router
