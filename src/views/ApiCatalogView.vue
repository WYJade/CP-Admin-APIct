<template>
  <div class="api-catalog-view">
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2>API Catalog <span class="api-count">{{ catalogStore.filteredEntries.length }} 个 API</span></h2>
        <p>管理 Client Portal 3.0 所有 API 的元数据，是授权决策的单一技术事实源</p>
      </div>
      <el-button type="primary" @click="openDrawer(null)">
        <el-icon><Plus /></el-icon> 新建 API
      </el-button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-card">
      <el-input v-model="catalogStore.searchKeyword" placeholder="搜索 API Action 或 Path..." clearable style="width:260px">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select v-model="catalogStore.filterDomain" placeholder="业务域" clearable style="width:140px">
        <el-option v-for="d in BUSINESS_DOMAINS" :key="d" :label="d" :value="d" />
      </el-select>
      <el-select v-model="catalogStore.filterRisk" placeholder="风险等级" clearable multiple style="width:160px">
        <el-option v-for="r in ['L1','L2','L3','L4']" :key="r" :label="r" :value="r" />
      </el-select>
      <el-select v-model="catalogStore.filterLifecycle" placeholder="生命周期" clearable multiple style="width:160px">
        <el-option v-for="s in ['DRAFT','ACTIVE','DEPRECATED','RETIRED']" :key="s" :label="s" :value="s" />
      </el-select>
      <el-button text @click="catalogStore.resetFilters()"><el-icon><RefreshLeft /></el-icon> 重置</el-button>
    </div>

    <!-- 数据表格 -->
    <div class="table-card">
      <el-table :data="catalogStore.filteredEntries" stripe border row-key="id" style="width:100%">
        <el-table-column prop="apiAction" label="API Action" min-width="200">
          <template #default="{ row }">
            <el-tooltip :content="row.apiAction" placement="top">
              <code class="action-code">{{ row.apiAction }}</code>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="Method" width="80">
          <template #default="{ row }"><MethodTag :method="row.method" /></template>
        </el-table-column>
        <el-table-column prop="path" label="Path" min-width="180">
          <template #default="{ row }">
            <el-tooltip :content="row.path" placement="top">
              <span class="path-text">{{ row.path }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="businessDomain" label="业务域" width="100" />
        <el-table-column label="风险等级" width="90">
          <template #default="{ row }"><RiskLevelTag :level="row.riskLevel" /></template>
        </el-table-column>
        <el-table-column label="生命周期" width="100">
          <template #default="{ row }"><StatusBadge :status="row.lifecycle" /></template>
        </el-table-column>
        <el-table-column label="允许渠道" width="130">
          <template #default="{ row }"><ChannelTag :channels="row.allowedChannels" /></template>
        </el-table-column>
        <el-table-column prop="owner" label="负责人" width="120" />
        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" text @click="openDrawer(row)">编辑</el-button>
            <el-button size="small" text @click="showYaml(row)">OpenAPI</el-button>
            <el-popconfirm title="确认删除此 API？" @confirm="catalogStore.remove(row.id)">
              <template #reference>
                <el-button size="small" type="danger" text>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新建/编辑抽屉 -->
    <ApiCatalogDrawer v-model:visible="drawerVisible" :edit-entry="editEntry" @saved="drawerVisible = false" />

    <!-- OpenAPI YAML Modal -->
    <el-dialog v-model="yamlModalVisible" title="OpenAPI 扩展字段预览" width="560px" append-to-body>
      <YamlPreview v-if="yamlEntry" :entry="yamlEntry" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Search, RefreshLeft } from '@element-plus/icons-vue'
import { useCatalogStore } from '@/stores/catalog'
import type { ApiEntry } from '@/types'
import { BUSINESS_DOMAINS } from '@/mock/apiCatalog'
import MethodTag from '@/components/common/MethodTag.vue'
import RiskLevelTag from '@/components/common/RiskLevelTag.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ChannelTag from '@/components/common/ChannelTag.vue'
import YamlPreview from '@/components/common/YamlPreview.vue'
import ApiCatalogDrawer from '@/components/catalog/ApiCatalogDrawer.vue'

const catalogStore = useCatalogStore()
const drawerVisible = ref(false)
const editEntry = ref<ApiEntry | null>(null)
const yamlModalVisible = ref(false)
const yamlEntry = ref<ApiEntry | null>(null)

function openDrawer(entry: ApiEntry | null) {
  editEntry.value = entry
  drawerVisible.value = true
}

function showYaml(entry: ApiEntry) {
  yamlEntry.value = entry
  yamlModalVisible.value = true
}
</script>

<style scoped>
.api-catalog-view { display: flex; flex-direction: column; gap: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-header h2 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.api-count { font-size: 13px; font-weight: 400; color: #909399; margin-left: 8px; }
.page-header p { font-size: 13px; color: #909399; }
.filter-card { background: #fff; border: 1px solid var(--card-border); border-radius: 8px; padding: 14px 20px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.table-card { background: #fff; border: 1px solid var(--card-border); border-radius: 8px; overflow: hidden; }
.action-code { font-family: monospace; font-size: 12px; color: var(--el-color-primary); background: var(--el-color-primary-light-9); padding: 2px 6px; border-radius: 3px; }
.path-text { font-family: monospace; font-size: 12px; color: #606266; }
</style>
