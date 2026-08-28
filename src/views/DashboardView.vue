<template>
  <div class="dashboard">
    <div class="page-header">
      <div><h2>首页</h2><p class="subtitle">CP API 权限管理平台概览</p></div>
    </div>
    <el-row :gutter="16">
      <el-col :span="6" v-for="card in stats" :key="card.label">
        <div class="stat-card">
          <div class="stat-icon" :style="{ background: card.bg }">
            <el-icon :style="{ color: card.color, fontSize: '22px' }"><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-num">{{ card.value }}</div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="12">
        <div class="info-card">
          <div class="info-title">快速导航</div>
          <div class="nav-list">
            <div v-for="item in quickNav" :key="item.path" class="nav-item" @click="router.push(item.path)">
              <el-icon :style="{ color: 'var(--el-color-primary)', fontSize: '16px' }"><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
              <el-icon style="margin-left:auto;color:#c0c4cc"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="info-card">
          <div class="info-title">授权算法说明</div>
          <div class="algo-steps">
            <div v-for="step in algoSteps" :key="step.id" class="algo-step">
              <span class="step-badge">{{ step.id }}</span>
              <span class="step-name">{{ step.name }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { List, Connection, Share, Cpu, MagicStick, DataAnalysis, UserFilled, ArrowRight } from '@element-plus/icons-vue'
import { useCatalogStore } from '@/stores/catalog'
import { useIntegrationStore } from '@/stores/integration'
import { useAIProfileStore } from '@/stores/aiProfile'
import { useRolesStore } from '@/stores/roles'
const router = useRouter()
const catalogStore = useCatalogStore()
const integrationStore = useIntegrationStore()
const aiStore = useAIProfileStore()
const rolesStore = useRolesStore()
const stats = computed(() => [
  { label: 'API 总数', value: catalogStore.entries.length, icon: List, color: '#7B5EA7', bg: '#ede9f5' },
  { label: '集成档案', value: integrationStore.profiles.length, icon: Share, color: '#409eff', bg: '#ecf5ff' },
  { label: 'AI Profile', value: aiStore.profiles.length, icon: Cpu, color: '#67c23a', bg: '#f0f9eb' },
  { label: '角色数量', value: rolesStore.roles.length, icon: UserFilled, color: '#e6a23c', bg: '#fdf6ec' },
])
const quickNav = [
  { path: '/api-admin/catalog', label: 'API Catalog - 管理 API 元数据', icon: List },
  { path: '/api-admin/mapping', label: '菜单-API 映射 - 配置权限映射', icon: Connection },
  { path: '/permission/roles', label: '角色管理 - 管理角色权限', icon: UserFilled },
  { path: '/authz-simulator', label: '授权模拟器 - 测试权限决策', icon: MagicStick },
  { path: '/audit', label: '审计与依赖 - 查看调用日志', icon: DataAnalysis },
]
const algoSteps = [
  { id: 'A', name: '身份验证' }, { id: 'B', name: 'API Catalog 检查' },
  { id: 'C', name: 'Channel 检查' }, { id: 'D', name: 'Caller Capability' },
  { id: 'E', name: '业务权限检查' }, { id: 'F', name: 'Data Scope 检查' },
  { id: 'G', name: '风险/上下文检查' }, { id: 'H', name: 'Obligation 输出' },
]
</script>
<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 16px; }
.stat-card { background: #fff; border: 1px solid var(--card-border); border-radius: 8px; padding: 18px; display: flex; align-items: center; gap: 14px; }
.stat-icon { width: 46px; height: 46px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-num { font-size: 26px; font-weight: 700; color: #1a1a2e; }
.stat-label { font-size: 13px; color: #909399; margin-top: 2px; }
.info-card { background: #fff; border: 1px solid var(--card-border); border-radius: 8px; padding: 18px; }
.info-title { font-size: 14px; font-weight: 700; color: #303133; margin-bottom: 14px; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 8px; border-radius: 6px; cursor: pointer; font-size: 13px; color: #303133; transition: background 0.15s; }
.nav-item:hover { background: var(--el-color-primary-light-9); color: var(--el-color-primary); }
.algo-steps { display: flex; flex-direction: column; gap: 8px; }
.algo-step { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #606266; }
.step-badge { width: 22px; height: 22px; border-radius: 50%; background: var(--el-color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
</style>
