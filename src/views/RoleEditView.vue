<template>
  <div class="role-edit">
    <!-- 页头 -->
    <div class="edit-header">
      <div>
        <h2>{{ isNew ? '创建角色' : '编辑角色' }}</h2>
        <p class="subtitle">配置角色详情和权限</p>
      </div>
      <div class="header-actions">
        <el-button @click="router.push('/permission/roles')">取消</el-button>
        <el-button type="primary" @click="saveRole">{{ isNew ? '创建角色' : '保存更改' }}</el-button>
      </div>
    </div>

    <div class="edit-body">
      <!-- 左侧：角色详情 -->
      <div class="detail-panel">
        <div class="panel-title">角色详情</div>
        <el-form :model="form" label-position="top">
          <el-form-item label="角色名称" required>
            <el-input v-model="form.name" placeholder="yqtest" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.description" type="textarea" :rows="4" placeholder="描述角色的用途和权限范围..." />
          </el-form-item>
          <el-form-item label="* 状态">
            <el-radio-group v-model="form.status" class="status-group">
              <el-radio value="active">
                <span class="status-active">启用</span>
              </el-radio>
              <el-radio value="inactive">未启用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <!-- 右侧：权限配置 -->
      <div class="permission-panel">
        <div class="panel-header">
          <div class="panel-title">权限配置</div>
          <div class="panel-header-actions">
            <el-button size="small" text @click="selectAll">全选</el-button>
            <el-button size="small" text @click="clearAll">清空</el-button>
          </div>
        </div>

        <!-- 两个页签 -->
        <el-tabs v-model="activeTab" class="permission-tabs">
          <!-- 菜单功能 -->
          <el-tab-pane label="菜单功能" name="menu">
            <div class="tree-container">
              <el-tree
                ref="menuTreeRef"
                :data="cpMenuTree"
                show-checkbox
                node-key="id"
                :default-checked-keys="form.menuPermissions"
                :default-expanded-keys="expandedMenuKeys"
                :props="{ label: 'label', children: 'children' }"
                @check="onMenuCheck"
                class="cp-tree"
              >
                <template #default="{ node, data }">
                  <div class="tree-node" :class="`node-${data.type}`">
                    <span class="node-label">{{ node.label }}</span>
                  </div>
                </template>
              </el-tree>
            </div>
          </el-tab-pane>

          <!-- API权限 -->
          <el-tab-pane label="API权限" name="api">
            <div class="tree-container">
              <el-tree
                ref="apiTreeRef"
                :data="cpApiTree"
                show-checkbox
                node-key="id"
                :default-checked-keys="form.apiPermissions"
                :default-expanded-keys="expandedApiKeys"
                :props="{ label: 'label', children: 'children' }"
                @check="onApiCheck"
                class="cp-tree"
              >
                <template #default="{ node, data }">
                  <div class="tree-node" :class="`node-${data.type}`">
                    <span v-if="data.type === 'api'" class="method-badge" :class="`method-${data.method?.toLowerCase()}`">
                      {{ data.method }}
                    </span>
                    <span class="node-label">{{ data.type === 'api' ? data.path : node.label }}</span>
                    <span v-if="data.riskLevel" class="risk-badge" :class="`risk-${data.riskLevel?.toLowerCase()}`">
                      {{ data.riskLevel }}
                    </span>
                  </div>
                </template>
              </el-tree>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useRolesStore } from '@/stores/roles'
import { cpMenuTree, cpApiTree } from '@/mock/menuTree'

const router = useRouter()
const route = useRoute()
const rolesStore = useRolesStore()

const roleId = computed(() => route.params.id as string | undefined)
const isNew = computed(() => !roleId.value || roleId.value === 'new')

const menuTreeRef = ref()
const apiTreeRef = ref()
const activeTab = ref('menu')

const form = ref({
  name: '',
  description: '',
  status: 'active' as 'active' | 'inactive',
  modules: [] as string[],
  userCount: 0,
  menuPermissions: [] as string[],
  apiPermissions: [] as string[]
})

// 默认展开第一层
const expandedMenuKeys = cpMenuTree.map(n => n.id)
const expandedApiKeys = cpApiTree.map(n => n.id)

onMounted(() => {
  if (!isNew.value && roleId.value) {
    const existing = rolesStore.getById(roleId.value)
    if (existing) {
      form.value = {
        name: existing.name,
        description: existing.description,
        status: existing.status,
        modules: [...existing.modules],
        userCount: existing.userCount,
        menuPermissions: [...existing.menuPermissions],
        apiPermissions: [...existing.apiPermissions]
      }
    }
  }
})

function onMenuCheck(_: any, { checkedKeys }: { checkedKeys: string[] }) {
  form.value.menuPermissions = checkedKeys
}

function onApiCheck(_: any, { checkedKeys }: { checkedKeys: string[] }) {
  form.value.apiPermissions = checkedKeys
}

function selectAll() {
  if (activeTab.value === 'menu') {
    menuTreeRef.value?.setCheckedNodes(getAllNodes(cpMenuTree))
    form.value.menuPermissions = getAllIds(cpMenuTree)
  } else {
    apiTreeRef.value?.setCheckedNodes(getAllNodes(cpApiTree))
    form.value.apiPermissions = getAllIds(cpApiTree)
  }
}

function clearAll() {
  if (activeTab.value === 'menu') {
    menuTreeRef.value?.setCheckedKeys([])
    form.value.menuPermissions = []
  } else {
    apiTreeRef.value?.setCheckedKeys([])
    form.value.apiPermissions = []
  }
}

function getAllNodes(nodes: any[]): any[] {
  return nodes.flatMap(n => [n, ...(n.children ? getAllNodes(n.children) : [])])
}

function getAllIds(nodes: any[]): string[] {
  return nodes.flatMap(n => [n.id, ...(n.children ? getAllIds(n.children) : [])])
}

function saveRole() {
  if (!form.value.name.trim()) {
    ElMessage.warning('请填写角色名称')
    return
  }
  // Derive modules from selected menu permissions
  const moduleLabels = cpMenuTree
    .filter(m => form.value.menuPermissions.some(id => id === m.id || getAllIds(m.children || []).includes(id)))
    .map(m => m.label)

  if (isNew.value) {
    rolesStore.create({ ...form.value, modules: moduleLabels })
    ElMessage.success('角色创建成功')
  } else if (roleId.value) {
    rolesStore.update(roleId.value, { ...form.value, modules: moduleLabels })
    ElMessage.success('保存成功')
  }
  router.push('/permission/roles')
}
</script>

<style scoped>
.role-edit { display: flex; flex-direction: column; gap: 0; height: 100%; }
.edit-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.edit-header h2 { font-size: 18px; font-weight: 600; color: #303133; margin-bottom: 2px; }
.subtitle { font-size: 13px; color: #909399; }
.header-actions { display: flex; gap: 10px; }
.edit-body { display: flex; gap: 20px; flex: 1; }
.detail-panel { width: 280px; flex-shrink: 0; background: #fff; border: 1px solid var(--card-border); border-radius: 8px; padding: 20px; }
.permission-panel { flex: 1; background: #fff; border: 1px solid var(--card-border); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; }
.panel-title { font-size: 15px; font-weight: 600; color: #303133; margin-bottom: 16px; }
.panel-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 0; }
.panel-header-actions { display: flex; gap: 8px; }
.status-group { display: flex; flex-direction: column; gap: 8px; }
.status-active { color: var(--el-color-primary); font-weight: 500; }
.permission-tabs { flex: 1; display: flex; flex-direction: column; }
.permission-tabs :deep(.el-tabs__header) { padding: 0 20px; margin: 0; }
.permission-tabs :deep(.el-tabs__content) { flex: 1; overflow: hidden; }
.permission-tabs :deep(.el-tab-pane) { height: 100%; }
.tree-container { height: calc(100vh - 320px); overflow-y: auto; padding: 12px 20px; }
.cp-tree :deep(.el-tree-node__content) { height: auto; min-height: 34px; padding: 4px 0; }
.cp-tree :deep(.el-tree-node__content:hover) { background: var(--el-color-primary-light-9); }
.cp-tree :deep(.el-checkbox__input.is-checked .el-checkbox__inner) { background: var(--el-color-primary); border-color: var(--el-color-primary); }
.cp-tree :deep(.el-tree-node.is-current > .el-tree-node__content) { background: var(--el-color-primary-light-9); }

/* 模块级节点 (module) — 加粗白底 */
.cp-tree :deep(.el-tree > .el-tree-node > .el-tree-node__content) {
  background: var(--el-color-primary-light-9);
  border-bottom: 1px solid var(--el-color-primary-light-7);
  font-weight: 700;
  font-size: 14px;
}
.cp-tree :deep(.el-tree > .el-tree-node > .el-tree-node__content:hover) {
  background: var(--el-color-primary-light-8);
}

.tree-node { display: flex; align-items: center; gap: 8px; width: 100%; }
.node-label { font-size: 13px; color: #303133; }
.node-module > .node-label { font-weight: 700; color: #1a1a2e; }
.node-action > .node-label { color: #606266; }

.method-badge { font-family: monospace; font-size: 11px; font-weight: 700; padding: 1px 6px; border-radius: 3px; min-width: 46px; text-align: center; flex-shrink: 0; }
.method-get { background: #e8f5e9; color: #2e7d32; }
.method-post { background: #e3f2fd; color: #1565c0; }
.method-patch { background: #f3e5f5; color: #6a1b9a; }
.method-put { background: #fff3e0; color: #e65100; }
.method-delete { background: #ffebee; color: #c62828; }

.risk-badge { font-size: 11px; font-weight: 600; padding: 1px 6px; border-radius: 10px; margin-left: auto; flex-shrink: 0; }
.risk-l1 { background: #e8f5e9; color: #2e7d32; }
.risk-l2 { background: #e3f2fd; color: #1565c0; }
.risk-l3 { background: #fff3e0; color: #e65100; }
.risk-l4 { background: #ffebee; color: #c62828; }
</style>
