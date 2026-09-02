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
        <div class="panel-section-title">角色详情</div>
        <el-form :model="form" label-position="top" class="role-form">
          <el-form-item required>
            <template #label><span class="form-label"><span class="req">*</span> 角色名称</span></template>
            <el-input v-model="form.name" placeholder="请输入角色名称" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.description" type="textarea" :rows="5" placeholder="描述角色的用途和权限范围..." />
          </el-form-item>
          <el-form-item required>
            <template #label><span class="form-label"><span class="req">*</span> 状态</span></template>
            <el-radio-group v-model="form.status">
              <el-radio value="active"><span class="status-active">启用</span></el-radio>
              <br />
              <el-radio value="inactive" style="margin-top:8px">未启用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>

      <!-- 右侧：权限配置 -->
      <div class="permission-panel">
        <div class="perm-panel-head">
          <span class="panel-section-title">权限配置</span>
          <div class="perm-panel-actions">
            <el-button size="small" text type="primary" @click="selectAll">全选</el-button>
            <el-button size="small" text @click="clearAll">清空</el-button>
          </div>
        </div>

        <!-- 单一页签：菜单功能/API权限 -->
        <div class="perm-tab-bar">
          <span class="perm-tab-label active">菜单功能/API权限</span>
          <span class="api-notice">
            <el-icon class="notice-icon"><InfoFilled /></el-icon>
            此处配置的 API 权限仅对 Client Portal 本体及 Agent 生效，不影响页面功能。
          </span>
        </div>

        <!-- 权限树 -->
        <el-scrollbar class="tree-scroll">
          <div class="tree-body">
            <TreeNode
              v-for="node in cpMenuTree"
              :key="node.id"
              :node="node"
              :checked-ids="form.menuPermissions"
              :depth="0"
              @toggle-check="onToggleCheck"
            />
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElCheckbox, ElIcon } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { useRolesStore } from '@/stores/roles'
import { cpMenuTree, type MenuNode } from '@/mock/menuTree'

const router = useRouter()
const route = useRoute()
const rolesStore = useRolesStore()

const roleId = computed(() => route.params.id as string | undefined)
const isNew = computed(() => !roleId.value || roleId.value === 'new')

const form = ref({
  name: '',
  description: '',
  status: 'active' as 'active' | 'inactive',
  modules: [] as string[],
  userCount: 0,
  menuPermissions: [] as string[],
  apiPermissions: [] as string[]
})

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

function onToggleCheck(id: string, checked: boolean) {
  const idx = form.value.menuPermissions.indexOf(id)
  if (checked && idx === -1) form.value.menuPermissions.push(id)
  else if (!checked && idx !== -1) form.value.menuPermissions.splice(idx, 1)
}

function getAllIds(nodes: MenuNode[]): string[] {
  return nodes.flatMap(n => [n.id, ...(n.children ? getAllIds(n.children) : []), ...(n.apiNames?.map(a => `api:${a.id}`) ?? [])])
}

function selectAll() {
  form.value.menuPermissions = getAllIds(cpMenuTree)
}

function clearAll() {
  form.value.menuPermissions = []
}

function saveRole() {
  if (!form.value.name.trim()) { ElMessage.warning('请填写角色名称'); return }
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

// ─────────────────────────────────────────────────
// TreeNode 组件（递归渲染，支持 action 节点的左右两栏）
// ─────────────────────────────────────────────────
const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: { type: Object as () => MenuNode, required: true },
    checkedIds: { type: Array as () => string[], required: true },
    depth: { type: Number, default: 0 }
  },
  emits: ['toggle-check'],
  setup(props, { emit }) {
    const expanded = ref(props.depth < 2) // 默认展开前两层

    function isChecked(id: string) { return props.checkedIds.includes(id) }

    function isIndeterminate(node: MenuNode): boolean {
      if (!node.children?.length) return false
      const allIds = getAllIds(node.children)
      const checkedCount = allIds.filter(id => props.checkedIds.includes(id)).length
      return checkedCount > 0 && checkedCount < allIds.length
    }

    function isAllChecked(node: MenuNode): boolean {
      if (!node.children?.length) return isChecked(node.id)
      return getAllIds(node.children).every(id => props.checkedIds.includes(id))
    }

    function toggleNode(node: MenuNode) {
      const allIds = getAllIds(node.children || [])
      const selfId = node.id
      const shouldCheck = !isAllChecked(node)
      ;[selfId, ...allIds].forEach(id => emit('toggle-check', id, shouldCheck))
    }

    function toggleSelf(id: string, checked: boolean) {
      emit('toggle-check', id, checked)
    }

    return () => {
      const { node, depth } = props
      const hasChildren = !!(node.children?.length)
      const isModule = node.type === 'module'
      const isMenu = node.type === 'menu'
      const isAction = node.type === 'action'

      // ── 行容器样式 ──
      const rowStyle: Record<string, string> = {
        display: 'flex',
        alignItems: 'center',
        minHeight: '34px',
        padding: '2px 0',
        paddingLeft: `${depth * 20 + 8}px`,
        cursor: 'pointer',
        userSelect: 'none',
      }
      if (isModule) {
        rowStyle.background = 'var(--el-color-primary-light-9)'
        rowStyle.borderBottom = '1px solid var(--el-color-primary-light-7)'
        rowStyle.fontWeight = '700'
        rowStyle.fontSize = '13.5px'
      }

      // ── 展开/折叠箭头 ──
      const arrow = hasChildren
        ? h('span', {
            style: { width: '16px', flexShrink: '0', textAlign: 'center', color: '#909399', fontSize: '12px', transition: 'transform 0.2s', display: 'inline-block', transform: expanded.value ? 'rotate(90deg)' : 'rotate(0deg)' },
            onClick: (e: Event) => { e.stopPropagation(); expanded.value = !expanded.value }
          }, '▶')
        : h('span', { style: { width: '16px', flexShrink: '0' } })

      // ── 复选框 ──
      const checkbox = h(ElCheckbox, {
        modelValue: isAllChecked(node),
        indeterminate: isIndeterminate(node),
        style: { marginRight: '6px' },
        onClick: (e: Event) => e.stopPropagation(),
        onChange: () => toggleNode(node),
      })

      // ── 标签 ──
      const label = h('span', {
        style: { fontSize: isModule ? '13.5px' : '13px', color: isModule ? '#1a1a2e' : isAction ? '#606266' : '#303133' },
        onClick: () => { if (hasChildren) expanded.value = !expanded.value }
      }, node.label)

      // ── 当前节点行 ──
      const row = h('div', { style: rowStyle }, [arrow, checkbox, label])

      // ── 子节点渲染 ──
      if (!expanded.value || !hasChildren) return h('div', [row])

      // 如果当前节点是 menu，且子节点都是 action，使用左右双栏布局
      const allActions = node.children!.every(c => c.type === 'action')

      if (isMenu && allActions) {
        // 如果该 menu 节点标记 noApi，只显示左栏（无 API 权限列）
        const noApi = !!(node as any).noApi
        // 左栏：功能按钮；右栏：对应 API 名称
        const leftCol = h('div', {
          style: { flex: '1', borderRight: noApi ? 'none' : '1px solid #f0f2f5', padding: '6px 0 6px 0' }
        }, node.children!.map(action =>
          h('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              minHeight: '32px',
              padding: `2px 8px 2px ${(depth + 1) * 20 + 8}px`,
              borderBottom: '1px solid #fafafa',
            }
          }, [
            h(ElCheckbox, {
              modelValue: isChecked(action.id),
              style: { marginRight: '6px' },
              onChange: (v: boolean) => emit('toggle-check', action.id, v)
            }),
            h('span', { style: { fontSize: '13px', color: '#303133' } }, action.label)
          ])
        ))

        const rightCol = h('div', {
          style: { flex: '1', padding: '6px 0 6px 0' }
        }, node.children!.map(action => {
          const apis = action.apiNames ?? []
          return h('div', {
            style: {
              minHeight: '32px',
              padding: `2px 8px`,
              borderBottom: '1px solid #fafafa',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '2px'
            }
          }, apis.length > 0
            ? apis.map(api =>
                h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0' } }, [
                  h(ElCheckbox, {
                    modelValue: isChecked(`api:${api.id}`),
                    onChange: (v: boolean) => emit('toggle-check', `api:${api.id}`, v)
                  }),
                  h('span', { style: { fontSize: '12px', color: '#606266' } }, api.name)
                ])
              )
            : [h('span', { style: { fontSize: '12px', color: '#c0c4cc', paddingLeft: '4px' } }, '—')]
          )
        }))

        // 表头行
        const colHeader = h('div', {
          style: {
            display: 'flex',
            borderBottom: '1px solid #ebeef5',
            background: '#fafbfc',
          }
        }, noApi ? [
          h('div', { style: { flex: '1', padding: '5px 8px 5px ' + ((depth + 1) * 20 + 8 + 28) + 'px', fontSize: '12px', fontWeight: '600', color: '#909399' } }, '页面功能'),
        ] : [
          h('div', { style: { flex: '1', padding: '5px 8px 5px ' + ((depth + 1) * 20 + 8 + 28) + 'px', fontSize: '12px', fontWeight: '600', color: '#909399', borderRight: '1px solid #f0f2f5' } }, '页面功能'),
          h('div', { style: { flex: '1', padding: '5px 8px', fontSize: '12px', fontWeight: '600', color: '#909399' } }, 'API 权限'),
        ])

        const twoCol = h('div', {
          style: { border: '1px solid #ebeef5', borderRadius: '4px', margin: `4px ${(depth + 1) * 20 - 12}px 6px ${(depth + 1) * 20 + 8}px`, overflow: 'hidden' }
        }, [
          colHeader,
          noApi
            ? h('div', [leftCol])
            : h('div', { style: { display: 'flex' } }, [leftCol, rightCol])
        ])

        return h('div', [row, twoCol])
      }

      // 普通递归渲染
      const children = node.children!.map(child =>
        h(TreeNode, {
          key: child.id,
          node: child,
          checkedIds: props.checkedIds,
          depth: depth + 1,
          onToggleCheck: (id: string, checked: boolean) => emit('toggle-check', id, checked)
        })
      )

      return h('div', [row, ...children])
    }
  }
})
</script>

<style scoped>
.role-edit { display: flex; flex-direction: column; height: 100%; }
.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}
.edit-header h2 { font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 2px; }
.subtitle { font-size: 13px; color: #909399; }
.header-actions { display: flex; gap: 10px; }

.edit-body { display: flex; gap: 20px; flex: 1; min-height: 0; }

/* ── 左侧详情面板 ── */
.detail-panel {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  padding: 20px;
}
.panel-section-title { font-size: 14px; font-weight: 700; color: #303133; display: block; margin-bottom: 16px; }
.role-form :deep(.el-form-item__label) { font-size: 13px; color: #606266; }
.form-label { font-size: 13px; color: #303133; }
.req { color: #f56c6c; margin-right: 2px; }
.status-active { color: var(--el-color-primary); font-weight: 500; }

/* ── 右侧权限面板 ── */
.permission-panel {
  flex: 1;
  background: #fff;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
.perm-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px 0;
  flex-shrink: 0;
}
.perm-panel-actions { display: flex; gap: 6px; }

/* 单一 tab 标签样式 */
.perm-tab-bar {
  padding: 0 20px;
  border-bottom: 1px solid var(--card-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-top: 10px;
}

/* API 权限说明文案 */
.api-notice {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  color: var(--el-color-primary);
  font-weight: 500;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 4px;
  padding: 4px 10px;
  margin-bottom: 10px;
  line-height: 1.5;
  max-width: 520px;
}
.notice-icon {
  font-size: 13px;
  margin-right: 5px;
  flex-shrink: 0;
  color: var(--el-color-primary);
}
.perm-tab-label {
  display: inline-block;
  padding: 8px 2px 10px;
  font-size: 13.5px;
  font-weight: 600;
  color: #909399;
  cursor: default;
  border-bottom: 2px solid transparent;
  margin-right: 24px;
}
.perm-tab-label.active {
  color: var(--el-color-primary);
  border-bottom-color: var(--el-color-primary);
}

/* ── 树 ── */
.tree-scroll { flex: 1; }
.tree-body { padding: 8px 0 16px; }

/* 覆盖 element checkbox 样式使其紫色 */
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
}
:deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  background-color: var(--el-color-primary) !important;
  border-color: var(--el-color-primary) !important;
}
</style>
