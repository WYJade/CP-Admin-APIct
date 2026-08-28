<template>
  <div class="role-mgmt">
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2>角色管理</h2>
        <p class="subtitle">管理系统中的角色及其权限</p>
      </div>
      <el-button type="primary" @click="router.push('/permission/roles/new')">
        <el-icon><Plus /></el-icon> 创建角色
      </el-button>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-card">
      <el-row :gutter="16">
        <el-col :span="8">
          <div class="filter-label">模块</div>
          <el-select v-model="filterModule" placeholder="请选择模块" clearable style="width:100%">
            <el-option value="Dashboards" label="Dashboards" />
            <el-option value="Sales Order" label="Sales Order" />
            <el-option value="Purchase Management" label="Purchase Management" />
            <el-option value="Inbound" label="Inbound" />
            <el-option value="Outbound" label="Outbound" />
            <el-option value="Inventory" label="Inventory" />
            <el-option value="Finance" label="Finance" />
            <el-option value="Integrations" label="Integrations" />
            <el-option value="User Profile" label="User Profile" />
            <el-option value="System Management" label="System Management" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <div class="filter-label">状态</div>
          <el-select v-model="filterStatus" placeholder="请选择状态" clearable style="width:100%">
            <el-option value="active" label="启用" />
            <el-option value="inactive" label="未启用" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <div class="filter-label">搜索</div>
          <el-input v-model="searchKeyword" placeholder="搜索角色..." clearable style="width:100%">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </el-col>
      </el-row>
      <div class="filter-actions">
        <el-button type="primary" @click="doSearch">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </div>
    </div>

    <!-- 角色表格 -->
    <div class="table-card">
      <el-table :data="filteredRoles" border style="width:100%">
        <el-table-column prop="name" label="角色名称" min-width="140" />
        <el-table-column prop="description" label="描述" min-width="240">
          <template #default="{ row }">
            <span class="desc-text">{{ row.description || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="模块" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="mod in row.modules.slice(0, 3)"
              :key="mod"
              size="small"
              class="module-tag"
            >{{ mod }}</el-tag>
            <el-tag v-if="row.modules.length > 3" size="small" type="info">+{{ row.modules.length - 3 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="80">
          <template #default="{ row }">
            <span class="user-count"><el-icon><User /></el-icon> {{ row.userCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
              {{ row.status === 'active' ? '启用' : '未启用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastModified" label="最后修改" width="150" />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-dropdown trigger="click">
              <el-button size="small" text class="more-btn">···</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="router.push(`/permission/roles/edit/${row.id}`)">编辑</el-dropdown-item>
                  <el-dropdown-item @click="toggleStatus(row)">{{ row.status === 'active' ? '禁用' : '启用' }}</el-dropdown-item>
                  <el-dropdown-item style="color:#f56c6c" @click="deleteRole(row.id)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-bar">
        <span class="total-text">共 {{ filteredRoles.length }} 条</span>
        <el-select v-model="pageSize" style="width:100px">
          <el-option :value="10" label="10条/页" />
          <el-option :value="20" label="20条/页" />
          <el-option :value="50" label="50条/页" />
        </el-select>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredRoles.length"
          layout="prev, pager, next"
          background
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, User } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRolesStore } from '@/stores/roles'

const router = useRouter()
const rolesStore = useRolesStore()

const filterModule = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const appliedFilter = ref({ module: '', status: '', keyword: '' })

const filteredRoles = computed(() => {
  return rolesStore.roles.filter(r => {
    if (appliedFilter.value.module && !r.modules.includes(appliedFilter.value.module)) return false
    if (appliedFilter.value.status && r.status !== appliedFilter.value.status) return false
    if (appliedFilter.value.keyword && !r.name.toLowerCase().includes(appliedFilter.value.keyword.toLowerCase())) return false
    return true
  })
})

function doSearch() {
  appliedFilter.value = { module: filterModule.value, status: filterStatus.value, keyword: searchKeyword.value }
  currentPage.value = 1
}

function resetSearch() {
  filterModule.value = ''
  filterStatus.value = ''
  searchKeyword.value = ''
  appliedFilter.value = { module: '', status: '', keyword: '' }
}

function toggleStatus(row: any) {
  rolesStore.update(row.id, { status: row.status === 'active' ? 'inactive' : 'active' })
  ElMessage.success('状态已更新')
}

async function deleteRole(id: string) {
  await ElMessageBox.confirm('确认删除该角色？', '删除确认', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消', confirmButtonClass: 'el-button--danger' })
  rolesStore.remove(id)
  ElMessage.success('已删除')
}
</script>

<style scoped>
.role-mgmt { display: flex; flex-direction: column; gap: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-header h2 { font-size: 18px; font-weight: 600; color: #303133; margin-bottom: 2px; }
.subtitle { font-size: 13px; color: #909399; }
.search-card { background: #fff; border: 1px solid var(--card-border); border-radius: 8px; padding: 20px 20px 16px; }
.filter-label { font-size: 13px; color: #606266; margin-bottom: 6px; }
.filter-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 16px; }
.table-card { background: #fff; border: 1px solid var(--card-border); border-radius: 8px; overflow: hidden; }
.module-tag { margin-right: 4px; margin-bottom: 2px; background: var(--el-color-primary-light-9); color: var(--el-color-primary); border: none; }
.user-count { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; color: #606266; }
.desc-text { font-size: 13px; color: #606266; }
.more-btn { font-size: 18px; font-weight: 700; letter-spacing: 1px; }
.pagination-bar { display: flex; align-items: center; justify-content: flex-end; gap: 12px; padding: 12px 16px; border-top: 1px solid var(--card-border); }
.total-text { font-size: 13px; color: #909399; margin-right: auto; }
</style>
