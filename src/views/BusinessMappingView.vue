<template>
  <div class="mapping-view">
    <div class="page-header">
      <div>
        <h2>菜单-API 映射管理</h2>
        <p class="subtitle">维护 CP-Admin 菜单功能与 API Action 的映射关系，SaaS 用户角色权限变化自动影响 API 访问</p>
      </div>
    </div>

    <div class="mapping-body">
      <!-- ===== 左侧：菜单功能树 ===== -->
      <div class="menu-panel">
        <div class="panel-head">
          <span class="panel-title">菜单功能</span>
          <el-tooltip content="点击菜单或功能按钮名称，右侧展示对应的 API 映射配置" placement="top">
            <el-icon class="help-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>

        <div class="tree-search-wrap">
          <el-input
            v-model="treeSearch"
            placeholder="搜索菜单功能..."
            clearable
            size="small"
            @input="onSearchInput"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>

        <el-scrollbar class="tree-scroll">
          <el-tree
            ref="menuTreeRef"
            :data="cpMenuTree"
            :filter-node-method="filterNode"
            node-key="id"
            :props="treeProps"
            :default-expanded-keys="defaultExpandedKeys"
            highlight-current
            @node-click="onNodeClick"
            class="menu-tree"
          >
            <template #default="{ data }">
              <div
                class="tree-row"
                :class="{
                  'is-active': selectedNodeId === data.id,
                  [`node-type-${data.type}`]: true
                }"
              >
                <!-- 图标 -->
                <el-icon v-if="data.type === 'module'" class="node-icon module-icon"><Grid /></el-icon>
                <el-icon v-else-if="data.type === 'menu'" class="node-icon menu-icon"><Document /></el-icon>
                <el-icon v-else class="node-icon action-icon"><Lightning /></el-icon>

                <span class="node-label">{{ data.label }}</span>

                <!-- 映射数量徽标 -->
                <span
                  v-if="mappingStore.nodeMappingCount(data.id) > 0"
                  class="count-badge"
                >{{ mappingStore.nodeMappingCount(data.id) }}</span>
              </div>
            </template>
          </el-tree>
        </el-scrollbar>
      </div>

      <!-- ===== 右侧：API 映射列表 ===== -->
      <div class="api-panel">
        <template v-if="selectedNodeId">
          <div class="panel-head">
            <div class="panel-head-left">
              <!-- 当前选中节点路径 -->
              <span class="selected-path">
                <span
                  v-for="(crumb, i) in selectedCrumbs"
                  :key="crumb.id"
                >
                  <span v-if="i > 0" class="crumb-sep"> / </span>
                  <span
                    class="crumb-item"
                    :class="{ 'crumb-active': i === selectedCrumbs.length - 1 }"
                  >{{ crumb.label }}</span>
                </span>
              </span>
              <span class="mapping-count">的 API 映射</span>
              <el-tag size="small" style="margin-left:8px">{{ currentMappings.length }} 个</el-tag>
            </div>
            <div class="panel-head-right">
              <el-button size="small" plain @click="showRefDialog = true">
                <el-icon><User /></el-icon> 查看引用
              </el-button>
              <el-button type="primary" size="small" @click="showSelectorDialog = true">
                <el-icon><Plus /></el-icon> 添加映射
              </el-button>
            </div>
          </div>

          <!-- 权限 key 提示 -->
          <div v-if="currentPermKey" class="perm-key-bar">
            <span class="perm-key-label">关联业务权限：</span>
            <code class="perm-key-code">{{ currentPermKey }}</code>
            <el-tooltip content="该菜单/功能节点对应的业务权限标识，Portal 用户需持有此权限才能调用对应 API" placement="top">
              <el-icon class="help-icon" style="margin-left:4px"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <div v-else class="perm-key-bar perm-key-warn">
            <el-icon><Warning /></el-icon>
            <span>该节点暂未关联业务权限标识，添加映射后将自动创建</span>
          </div>

          <!-- API 映射表格 -->
          <el-table :data="currentMappings" stripe border size="small" style="width:100%">
            <el-table-column label="API Action" min-width="200">
              <template #default="{ row }">
                <code class="action-code">{{ row.apiAction }}</code>
              </template>
            </el-table-column>
            <el-table-column label="Method" width="90">
              <template #default="{ row }">
                <span v-if="getApi(row.apiAction)" class="method-badge" :class="`method-${getApi(row.apiAction)?.method?.toLowerCase()}`">
                  {{ getApi(row.apiAction)?.method }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="Path" min-width="200">
              <template #default="{ row }">
                <span class="path-text">{{ getApi(row.apiAction)?.path ?? '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="风险等级" width="100">
              <template #default="{ row }">
                <el-tag v-if="getApi(row.apiAction)" :type="riskTagType(getApi(row.apiAction)!.riskLevel)" size="small">
                  {{ getApi(row.apiAction)!.riskLevel }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="渠道" width="120">
              <template #default="{ row }">
                <template v-if="getApi(row.apiAction)">
                  <span
                    v-for="ch in getApi(row.apiAction)!.allowedChannels"
                    :key="ch"
                    class="ch-tag"
                    :class="`ch-${ch.toLowerCase()}`"
                  >{{ ch.charAt(0) }}</span>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="danger" text @click="confirmDelete(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-empty v-if="currentMappings.length === 0" description="暂无 API 映射，点击「添加映射」配置" :image-size="60" style="padding:30px 0" />
        </template>

        <!-- 未选中状态 -->
        <div v-else class="empty-state">
          <el-icon style="font-size:48px;color:#ddd"><Connection /></el-icon>
          <p>请点击左侧菜单或功能按钮查看 API 映射</p>
          <p class="empty-hint">支持对菜单模块、子菜单、功能按钮分别配置 API 映射</p>
        </div>
      </div>
    </div>

    <!-- ===== API Action 选择器 Dialog ===== -->
    <el-dialog v-model="showSelectorDialog" title="添加 API Action 映射" width="740px" append-to-body>
      <div class="selector-toolbar">
        <el-input v-model="selectorSearch" placeholder="搜索 API Action 或 Path..." clearable style="width:260px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="selectorDomain" placeholder="业务域" clearable style="width:140px">
          <el-option v-for="d in BUSINESS_DOMAINS" :key="d" :label="d" :value="d" />
        </el-select>
        <span class="selector-hint">已选 {{ selectedApis.length }} 个 API</span>
      </div>
      <el-table
        :data="availableApis"
        @selection-change="selectedApis = $event.map((r: any) => r.apiAction)"
        row-key="id"
        max-height="380px"
        stripe
        border
      >
        <el-table-column type="selection" width="48" />
        <el-table-column label="API Action" min-width="200">
          <template #default="{ row }"><code class="action-code">{{ row.apiAction }}</code></template>
        </el-table-column>
        <el-table-column label="Method" width="86">
          <template #default="{ row }">
            <span class="method-badge" :class="`method-${row.method?.toLowerCase()}`">{{ row.method }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Path" min-width="180">
          <template #default="{ row }"><span class="path-text">{{ row.path }}</span></template>
        </el-table-column>
        <el-table-column label="风险" width="72">
          <template #default="{ row }">
            <el-tag :type="riskTagType(row.riskLevel)" size="small">{{ row.riskLevel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="业务域" width="100" prop="businessDomain" />
      </el-table>
      <template #footer>
        <el-button @click="showSelectorDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedApis.length" @click="addMappings">
          确认添加 {{ selectedApis.length > 0 ? `(${selectedApis.length})` : '' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- ===== 查看引用 Dialog ===== -->
    <el-dialog v-model="showRefDialog" title="查看权限引用" width="380px" append-to-body>
      <div class="ref-stats">
        <div class="ref-item">
          <div class="ref-num">{{ refData.roles }}</div>
          <div class="ref-label">个角色持有该权限</div>
        </div>
        <div class="ref-item">
          <div class="ref-num">{{ refData.users }}</div>
          <div class="ref-label">个用户受影响</div>
        </div>
      </div>
      <el-alert type="info" :closable="false" title="修改 API 映射关系将影响持有该菜单权限的所有角色" show-icon style="margin-top:16px" />
    </el-dialog>

    <!-- ===== 删除确认 Dialog ===== -->
    <el-dialog v-model="showDeleteDialog" title="确认删除映射" width="420px" append-to-body>
      <div class="delete-body">
        <el-icon style="font-size:26px;color:#e6a23c;flex-shrink:0"><Warning /></el-icon>
        <div>
          <p>删除后，访问 <code class="action-code">{{ deletingAction }}</code> 的</p>
          <p>API 调用权限将从该菜单功能中移除</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDeleteDialog = false">取消</el-button>
        <el-button type="danger" @click="doDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Plus, Delete, Search, User, QuestionFilled, Warning, Connection, Grid, Document, Promotion } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useMappingStore } from '@/stores/mapping'
import { useCatalogStore } from '@/stores/catalog'
import type { BusinessMapping, RiskLevel } from '@/types'
import { BUSINESS_DOMAINS } from '@/mock/apiCatalog'
import { cpMenuTree, type MenuNode } from '@/mock/menuTree'

// Lightning icon fallback
const Lightning = Promotion // use Promotion as action icon substitute

const mappingStore = useMappingStore()
const catalogStore = useCatalogStore()

const menuTreeRef = ref()
const treeSearch = ref('')
const selectedNodeId = ref<string>('')
const selectedNodeData = ref<MenuNode | null>(null)

const showSelectorDialog = ref(false)
const showRefDialog = ref(false)
const showDeleteDialog = ref(false)
const deletingMappingId = ref('')
const deletingAction = ref('')
const selectorSearch = ref('')
const selectorDomain = ref('')
const selectedApis = ref<string[]>([])
const refData = ref({ roles: 0, users: 0 })

const treeProps = { label: 'label', children: 'children' }
const defaultExpandedKeys = cpMenuTree.map(n => n.id)

// Tree 搜索
function onSearchInput(v: string) {
  menuTreeRef.value?.filter(v)
}
function filterNode(value: string, data: MenuNode) {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

// 点击节点
function onNodeClick(data: MenuNode) {
  selectedNodeId.value = data.id
  selectedNodeData.value = data
  // 更新引用数据（mock）
  refData.value = {
    roles: Math.floor(Math.random() * 8) + 2,
    users: Math.floor(Math.random() * 40) + 8
  }
}

// 当前选中节点的业务权限 key
const currentPermKey = computed(() => {
  if (!selectedNodeId.value) return null
  return mappingStore.getPermKeyByNodeId(selectedNodeId.value)
})

// 当前选中节点的映射列表
const currentMappings = computed<BusinessMapping[]>(() => {
  if (!selectedNodeId.value) return []
  return mappingStore.getMappingsByMenuNodeId(selectedNodeId.value)
})

// 面包屑路径
const selectedCrumbs = computed(() => {
  if (!selectedNodeId.value) return []
  const crumbs: { id: string; label: string }[] = []
  function findPath(nodes: MenuNode[], targetId: string): boolean {
    for (const node of nodes) {
      if (node.id === targetId) {
        crumbs.push({ id: node.id, label: node.label })
        return true
      }
      if (node.children) {
        crumbs.push({ id: node.id, label: node.label })
        if (findPath(node.children, targetId)) return true
        crumbs.pop()
      }
    }
    return false
  }
  findPath(cpMenuTree, selectedNodeId.value)
  return crumbs
})

// 可选 API（未映射 + 符合筛选）
const availableApis = computed(() => {
  const existingActions = currentMappings.value.map(m => m.apiAction)
  return catalogStore.entries.filter(e => {
    if (e.lifecycle !== 'ACTIVE') return false
    if (existingActions.includes(e.apiAction)) return false
    if (selectorDomain.value && e.businessDomain !== selectorDomain.value) return false
    if (selectorSearch.value) {
      const kw = selectorSearch.value.toLowerCase()
      if (!e.apiAction.toLowerCase().includes(kw) && !e.path.toLowerCase().includes(kw)) return false
    }
    return true
  })
})

function getApi(action: string) { return catalogStore.getByAction(action) }

function riskTagType(level: RiskLevel): string {
  return { L1: 'success', L2: 'primary', L3: 'warning', L4: 'danger' }[level] ?? 'info'
}

function addMappings() {
  if (!selectedNodeId.value) return
  const result = mappingStore.addMappingsByNodeId(selectedNodeId.value, selectedApis.value)
  if (result) {
    ElMessage.success(`添加 ${result.added} 个映射${result.skipped > 0 ? `，已过滤 ${result.skipped} 条重复` : ''}`)
  }
  showSelectorDialog.value = false
  selectedApis.value = []
}

function confirmDelete(row: BusinessMapping) {
  deletingMappingId.value = row.id
  deletingAction.value = row.apiAction
  showDeleteDialog.value = true
}

function doDelete() {
  mappingStore.removeMapping(deletingMappingId.value)
  ElMessage.success('已删除映射关系')
  showDeleteDialog.value = false
}
</script>

<style scoped>
.mapping-view { display: flex; flex-direction: column; gap: 16px; height: 100%; }

.mapping-body {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

/* ===== 左侧菜单树面板 ===== */
.menu-panel {
  width: 290px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid #f0f2f5;
  background: #fafbfc;
  flex-shrink: 0;
}
.panel-head-left { display: flex; align-items: center; gap: 8px; }
.panel-head-right { display: flex; gap: 8px; }
.panel-title { font-size: 13px; font-weight: 700; color: #303133; }
.help-icon { color: #c0c4cc; cursor: help; font-size: 14px; }

.tree-search-wrap { padding: 8px 10px 4px; flex-shrink: 0; }
.tree-scroll { flex: 1; }

/* 树 */
.menu-tree { padding: 4px 4px; }
.menu-tree :deep(.el-tree-node__content) {
  height: auto;
  min-height: 34px;
  border-radius: 5px;
  margin: 1px 0;
  padding: 2px 6px;
}
.menu-tree :deep(.el-tree-node__content:hover) {
  background: var(--el-color-primary-light-9);
}
.menu-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: var(--el-color-primary-light-8);
}

.tree-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 2px 2px;
  cursor: pointer;
  user-select: none;
}
.tree-row.is-active .node-label { color: var(--el-color-primary); font-weight: 600; }

.node-icon { font-size: 13px; flex-shrink: 0; }
.module-icon { color: #7B5EA7; }
.menu-icon { color: #409eff; }
.action-icon { color: #67c23a; }

.node-label { font-size: 13px; color: #303133; flex: 1; }
.node-type-module .node-label { font-weight: 700; color: #1a1a2e; }
.node-type-action .node-label { color: #606266; font-size: 12.5px; }

.count-badge {
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: var(--el-color-primary);
  color: #fff;
  text-align: center;
  line-height: 18px;
  padding: 0 5px;
  flex-shrink: 0;
}

/* ===== 右侧 API 面板 ===== */
.api-panel {
  flex: 1;
  background: #fff;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
.api-panel .panel-head {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 1;
}

.selected-path { font-size: 14px; font-weight: 600; color: #303133; }
.crumb-sep { color: #c0c4cc; margin: 0 2px; }
.crumb-item { color: #909399; }
.crumb-active { color: #303133; font-weight: 700; }
.mapping-count { font-size: 13px; color: #909399; margin-left: 4px; }

/* 权限 key 提示条 */
.perm-key-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: #f8f9ff;
  border-bottom: 1px solid #eef0fa;
  font-size: 12px;
  color: #606266;
  flex-shrink: 0;
}
.perm-key-label { color: #909399; }
.perm-key-code {
  font-family: monospace;
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 1px 7px;
  border-radius: 4px;
  font-weight: 700;
}
.perm-key-warn { background: #fffbe6; color: #7c5a00; border-color: #ffe58f; }
.perm-key-warn .el-icon { color: #e6a23c; }

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #c0c4cc;
  padding: 60px 0;
}
.empty-state p { font-size: 14px; color: #909399; margin: 0; }
.empty-hint { font-size: 12px; color: #c0c4cc !important; }

/* 渠道标签 */
.ch-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  margin-right: 2px;
}
.ch-portal  { background: #ede9f5; color: #7B5EA7; }
.ch-external { background: #ecf5ff; color: #409eff; }
.ch-ontology { background: #f0f9eb; color: #67c23a; }
.ch-agent   { background: #fdf6ec; color: #e6a23c; }

/* Method */
.method-badge {
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  min-width: 48px;
  text-align: center;
  display: inline-block;
}
.method-get    { background: #e8f5e9; color: #2e7d32; }
.method-post   { background: #e3f2fd; color: #1565c0; }
.method-patch  { background: #f3e5f5; color: #6a1b9a; }
.method-put    { background: #fff3e0; color: #e65100; }
.method-delete { background: #ffebee; color: #c62828; }

.action-code {
  font-family: monospace;
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 2px 6px;
  border-radius: 3px;
}
.path-text { font-family: monospace; font-size: 12px; color: #606266; }

/* Dialog */
.selector-toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
.selector-hint { font-size: 13px; color: var(--el-color-primary); font-weight: 600; margin-left: auto; }

.ref-stats { display: flex; gap: 40px; justify-content: center; padding: 20px 0; }
.ref-item { text-align: center; }
.ref-num { font-size: 34px; font-weight: 700; color: var(--el-color-primary); }
.ref-label { font-size: 13px; color: #909399; }

.delete-body { display: flex; align-items: flex-start; gap: 14px; padding: 4px 0; }
.delete-body p { font-size: 14px; color: #303133; line-height: 1.8; margin: 0; }
</style>
