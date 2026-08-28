<template>
  <div class="sidebar" :class="{ collapsed }">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-wrap" @click="router.push('/')">
        <span class="logo-icon">🔑</span>
        <span v-if="!collapsed" class="logo-text">Client Portal</span>
      </div>
      <el-icon class="collapse-trigger" @click="collapsed = !collapsed">
        <component :is="collapsed ? ArrowRight : ArrowLeft" />
      </el-icon>
    </div>

    <el-scrollbar class="sidebar-scroll">
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :default-openeds="collapsed ? [] : openedMenus"
        background-color="transparent"
        text-color="var(--sidebar-text)"
        active-text-color="var(--sidebar-active-text)"
        router
        class="sidebar-menu"
        :collapse-transition="false"
      >
        <!-- 首页 -->
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <!-- 优惠券 -->
        <el-sub-menu index="coupon">
          <template #title>
            <el-icon><Ticket /></el-icon>
            <span>优惠券</span>
          </template>
          <el-menu-item index="/coupon/analysis">优惠券分析</el-menu-item>
          <el-menu-item index="/coupon/rules">优惠券规则</el-menu-item>
          <el-menu-item index="/coupon/list">优惠券列表</el-menu-item>
        </el-sub-menu>

        <!-- 权限管理 -->
        <el-sub-menu index="permission">
          <template #title>
            <el-icon><Lock /></el-icon>
            <span>权限管理</span>
          </template>

          <el-menu-item index="/permission/roles">
            <el-icon><UserFilled /></el-icon>
            角色权限管理
          </el-menu-item>
          <el-menu-item index="/permission/users">
            <el-icon><User /></el-icon>
            用户管理
          </el-menu-item>
          <el-menu-item index="/permission/portal-settings">
            <el-icon><Monitor /></el-icon>
            客户 Portal 设置
          </el-menu-item>
          <el-menu-item index="/permission/accounts">
            <el-icon><OfficeBuilding /></el-icon>
            账户管理
          </el-menu-item>
          <el-menu-item index="/permission/role-management">
            <el-icon><Key /></el-icon>
            角色管理
          </el-menu-item>
        </el-sub-menu>

        <!-- API Admin -->
        <el-sub-menu index="api-admin">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>API Admin</span>
          </template>
          <el-menu-item index="/api-admin/catalog">
            <el-icon><List /></el-icon>
            API Catalog
          </el-menu-item>
          <el-menu-item index="/api-admin/mapping">
            <el-icon><Connection /></el-icon>
            菜单-API 映射
          </el-menu-item>
        </el-sub-menu>

        <!-- Integration Admin -->
        <el-sub-menu index="integration">
          <template #title>
            <el-icon><Share /></el-icon>
            <span>Integration Admin</span>
          </template>
          <el-menu-item index="/integration/apps">
            <el-icon><Grid /></el-icon>
            外部应用
          </el-menu-item>
          <el-menu-item index="/integration/profiles">
            <el-icon><Document /></el-icon>
            集成档案
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/ai-capability">
          <el-icon><Cpu /></el-icon>
          <template #title>AI 能力档案</template>
        </el-menu-item>

        <el-menu-item index="/authz-simulator">
          <el-icon><MagicStick /></el-icon>
          <template #title>授权模拟器</template>
        </el-menu-item>

        <el-menu-item index="/audit">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>审计与依赖</template>
        </el-menu-item>

        <el-menu-item index="/notifications">
          <el-icon><Bell /></el-icon>
          <template #title>公告/营销通知</template>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>

    <div v-if="!collapsed" class="sidebar-footer">v1.0.0</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled, Ticket, Lock, UserFilled, User, Setting, OfficeBuilding,
  List, Connection, Share, Grid, Document, Cpu, MagicStick,
  DataAnalysis, Bell, ArrowLeft, ArrowRight, Monitor, Key
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)
const activeMenu = computed(() => route.path)
const openedMenus = ['permission', 'api-admin', 'integration']
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.25s ease, min-width 0.25s ease;
  overflow: hidden;
  border-right: 1px solid var(--sidebar-border);
}
.sidebar.collapsed { width: 64px; min-width: 64px; }

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  height: 52px;
  border-bottom: 1px solid var(--sidebar-border);
  flex-shrink: 0;
}
.logo-wrap {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  flex: 1;
  overflow: hidden;
}
.logo-icon { font-size: 18px; flex-shrink: 0; }
.logo-text {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a2e;
  white-space: nowrap;
}
.collapse-trigger {
  color: #9ca3af;
  cursor: pointer;
  font-size: 15px;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s, background 0.2s;
  flex-shrink: 0;
}
.collapse-trigger:hover { color: var(--el-color-primary); background: var(--sidebar-active-bg); }

.sidebar-scroll { flex: 1; overflow: hidden; }

/* ===== Menu 样式 ===== */
.sidebar-menu { border-right: none !important; background: transparent !important; }

/* 一级菜单项和子菜单标题 */
.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  height: 40px;
  line-height: 40px;
  margin: 1px 6px;
  border-radius: 6px;
  padding-left: 14px !important;
  font-size: 13px;
  color: var(--sidebar-text) !important;
  transition: background 0.15s, color 0.15s;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background: var(--sidebar-hover-bg) !important;
  color: var(--el-color-primary) !important;
}

/* 激活状态 */
.sidebar-menu :deep(.el-menu-item.is-active) {
  background: var(--sidebar-active-bg) !important;
  color: var(--sidebar-active-text) !important;
  font-weight: 600;
  position: relative;
}
.sidebar-menu :deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 7px;
  bottom: 7px;
  width: 3px;
  background: var(--el-color-primary);
  border-radius: 0 3px 3px 0;
}

/* 子菜单容器 */
.sidebar-menu :deep(.el-sub-menu .el-menu) {
  background: transparent !important;
}
/* 二级子菜单项 */
.sidebar-menu :deep(.el-sub-menu .el-menu .el-menu-item) {
  padding-left: 42px !important;
  height: 36px;
  line-height: 36px;
  font-size: 13px;
  color: #6b7280 !important;
}
/* 三级子菜单项（账户管理下的角色管理） */
.sidebar-menu :deep(.el-sub-menu .el-sub-menu .el-menu .el-menu-item) {
  padding-left: 62px !important;
  height: 34px;
  line-height: 34px;
  font-size: 12.5px;
  color: #9ca3af !important;
}

/* 展开箭头颜色 */
.sidebar-menu :deep(.el-sub-menu__icon-arrow) {
  color: #9ca3af !important;
}

.sidebar-menu :deep(.el-icon) { font-size: 15px; color: inherit; }

/* 折叠状态 */
.sidebar.collapsed .sidebar-menu :deep(.el-menu-item),
.sidebar.collapsed .sidebar-menu :deep(.el-sub-menu__title) {
  margin: 1px 4px;
  padding: 0 !important;
  justify-content: center;
}

.sidebar-footer {
  padding: 10px 16px;
  font-size: 11px;
  color: #d1d5db;
  border-top: 1px solid var(--sidebar-border);
  text-align: center;
}
</style>
