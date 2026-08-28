<template>
  <div class="account-mgmt">
    <div class="page-header">
      <div>
        <h2>账户管理</h2>
        <p class="subtitle">管理所有用户的账户</p>
      </div>
    </div>

    <!-- 两个页签 -->
    <el-tabs v-model="activeTab" class="account-tabs">
      <!-- 租户主账号 -->
      <el-tab-pane label="租户主账号" name="tenant">
        <div class="filter-card">
          <el-row :gutter="16">
            <el-col :span="8">
              <div class="filter-label">租户</div>
              <el-input v-model="tenantFilter" placeholder="请输入租户名称" clearable />
            </el-col>
          </el-row>
          <div class="filter-actions">
            <el-button type="primary" @click="doSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>
        </div>

        <div class="table-card">
          <el-table :data="filteredTenantAccounts" border stripe style="width:100%">
            <el-table-column prop="tenant" label="租户" min-width="130" />
            <el-table-column prop="username" label="用户名" min-width="160" />
            <el-table-column prop="email" label="邮箱" min-width="200" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                  {{ row.status === 'active' ? '已激活' : '未激活' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="角色" width="90">
              <template #default="{ row }">
                <el-tag type="primary" size="small">{{ row.role }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="subAccounts" label="子账户" width="80" align="center" />
            <el-table-column prop="customers" label="客户" width="70" align="center" />
            <el-table-column prop="lastLogin" label="最后登录" width="150">
              <template #default="{ row }">
                <span :class="row.lastLogin === '从未登录' ? 'never-login' : ''">{{ row.lastLogin }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="70" fixed="right">
              <template #default="{ row }">
                <el-dropdown trigger="click">
                  <el-button size="small" text class="more-btn">···</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>查看详情</el-dropdown-item>
                      <el-dropdown-item>编辑</el-dropdown-item>
                      <el-dropdown-item :divided="true" style="color:#f56c6c">停用</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-bar">
            <span class="total-text">共 {{ tenantAccounts.length }} 条</span>
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="10"
              :total="tenantAccounts.length"
              layout="prev, pager, next"
              background
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- 客户主账号 -->
      <el-tab-pane label="客户主账号" name="customer">
        <div class="filter-card">
          <el-row :gutter="16">
            <el-col :span="8">
              <div class="filter-label">客户</div>
              <el-input v-model="customerFilter" placeholder="请输入客户名称" clearable />
            </el-col>
          </el-row>
          <div class="filter-actions">
            <el-button type="primary">搜索</el-button>
            <el-button>重置</el-button>
          </div>
        </div>
        <div class="table-card">
          <el-table :data="customerAccounts" border stripe style="width:100%">
            <el-table-column prop="tenant" label="租户" min-width="130" />
            <el-table-column prop="username" label="用户名" min-width="160" />
            <el-table-column prop="email" label="邮箱" min-width="200" />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                  {{ row.status === 'active' ? '已激活' : '未激活' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="角色" width="90">
              <template #default="{ row }">
                <el-tag type="primary" size="small">{{ row.role }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="subAccounts" label="子账户" width="80" align="center" />
            <el-table-column prop="customers" label="客户" width="70" align="center" />
            <el-table-column prop="lastLogin" label="最后登录" width="150" />
            <el-table-column label="操作" width="70" fixed="right">
              <template #default>
                <el-button size="small" text class="more-btn">···</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-bar">
            <span class="total-text">共 {{ customerAccounts.length }} 条</span>
            <el-pagination :page-size="10" :total="customerAccounts.length" layout="prev, pager, next" background />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeTab = ref('tenant')
const currentPage = ref(1)
const tenantFilter = ref('')
const customerFilter = ref('')
const appliedFilter = ref('')

function doSearch() { appliedFilter.value = tenantFilter.value }
function resetSearch() { tenantFilter.value = ''; appliedFilter.value = '' }

interface Account {
  id: string
  tenant: string
  username: string
  email: string
  status: 'active' | 'inactive'
  role: string
  subAccounts: number
  customers: number
  lastLogin: string
}

const tenantAccounts: Account[] = [
  { id: '1', tenant: '12Jessd', username: 'test1hjcfmkf@lxx.com', email: 'test1hjcfmkf@lxx.com', status: 'inactive', role: 'Admin', subAccounts: 0, customers: 0, lastLogin: '从未登录' },
  { id: '2', tenant: 'test123123780', username: '7c4c8a9c7c2@drmail.', email: '7c4c8a9c7c2@drmail.in', status: 'inactive', role: 'Admin', subAccounts: 0, customers: 0, lastLogin: '从未登录' },
  { id: '3', tenant: '1XXX0015', username: '62f4b77134b@tmpeml.', email: '62f74b77134b@tmpeml.com', status: 'inactive', role: 'Admin', subAccounts: 0, customers: 0, lastLogin: '从未登录' },
  { id: '4', tenant: 'kttest', username: 'kttest@drmail.in', email: 'kttest@drmail.in', status: 'inactive', role: 'Admin', subAccounts: 0, customers: 0, lastLogin: '2026-08-26 18:34' },
  { id: '5', tenant: 'AXXX0041', username: 'e64ceb6e4e7a9@tmpbox.', email: 'e64ceb6e4e7a9@tmpbox.net', status: 'inactive', role: 'Admin', subAccounts: 0, customers: 0, lastLogin: '2026-08-21 14:47' },
  { id: '6', tenant: '497051320', username: '497t2dd91563@drms', email: '497t2dd91560@drmail.in', status: 'inactive', role: 'Admin', subAccounts: 0, customers: 0, lastLogin: '从未登录' },
  { id: '7', tenant: '123459535', username: 'd1bf92a1f066@tmpbox.', email: 'd1bf92a1f066@tmpbox.net', status: 'inactive', role: 'Admin', subAccounts: 0, customers: 0, lastLogin: '从未登录' },
  { id: '8', tenant: 'TestCorp001', username: 'admin@testcorp.com', email: 'admin@testcorp.com', status: 'active', role: 'Admin', subAccounts: 3, customers: 2, lastLogin: '2026-08-25 09:12' },
  { id: '9', tenant: 'GlobalTrade', username: 'globaladmin@trade.io', email: 'globaladmin@trade.io', status: 'active', role: 'Admin', subAccounts: 5, customers: 4, lastLogin: '2026-08-24 16:30' },
  { id: '10', tenant: 'FastLogistics', username: 'ops@fastlog.com', email: 'ops@fastlog.com', status: 'active', role: 'Admin', subAccounts: 2, customers: 1, lastLogin: '2026-08-26 11:05' },
]

const customerAccounts: Account[] = [
  { id: 'c1', tenant: 'TestCorp001', username: 'user1@testcorp.com', email: 'user1@testcorp.com', status: 'active', role: 'Customer', subAccounts: 0, customers: 1, lastLogin: '2026-08-26 08:00' },
  { id: 'c2', tenant: 'GlobalTrade', username: 'buyer@trade.io', email: 'buyer@trade.io', status: 'active', role: 'Customer', subAccounts: 0, customers: 1, lastLogin: '2026-08-25 14:20' },
  { id: 'c3', tenant: 'FastLogistics', username: 'client@fastlog.com', email: 'client@fastlog.com', status: 'inactive', role: 'Customer', subAccounts: 0, customers: 1, lastLogin: '从未登录' },
]

const filteredTenantAccounts = computed(() => {
  if (!appliedFilter.value) return tenantAccounts
  return tenantAccounts.filter(a => a.tenant.toLowerCase().includes(appliedFilter.value.toLowerCase()))
})
</script>

<style scoped>
.account-mgmt { display: flex; flex-direction: column; gap: 0; }
.page-header { margin-bottom: 16px; }
.page-header h2 { font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 3px; }
.subtitle { font-size: 13px; color: #909399; }
.account-tabs { background: #fff; border: 1px solid var(--card-border); border-radius: 8px; overflow: hidden; }
.account-tabs :deep(.el-tabs__header) { padding: 0 20px; margin: 0; border-bottom: 1px solid var(--card-border); }
.account-tabs :deep(.el-tabs__content) { padding: 16px; }
.filter-card { background: #fff; border: 1px solid var(--card-border); border-radius: 8px; padding: 16px 16px 12px; margin-bottom: 14px; }
.filter-label { font-size: 13px; color: #606266; margin-bottom: 6px; }
.filter-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 12px; }
.table-card { background: #fff; border: 1px solid var(--card-border); border-radius: 8px; overflow: hidden; }
.never-login { color: #c0c4cc; font-size: 12px; }
.more-btn { font-size: 18px; font-weight: 700; letter-spacing: 1px; }
.pagination-bar { display: flex; align-items: center; justify-content: flex-end; gap: 12px; padding: 12px 16px; border-top: 1px solid var(--card-border); }
.total-text { font-size: 13px; color: #909399; margin-right: auto; }
</style>
