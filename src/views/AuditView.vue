<template>
  <div class="audit-view">
    <div class="page-header">
      <div>
        <h2>审计与依赖分析</h2>
        <p>查看 API 调用日志、配置依赖关系和 Deprecated API 消费者，支持变更前评估影响范围</p>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="audit-tabs">
      <!-- 调用日志 -->
      <el-tab-pane label="📋 调用日志" name="logs">
        <div class="filter-card">
          <el-select v-model="auditStore.filterCallerType" placeholder="调用方类型" clearable style="width:160px">
            <el-option value="PORTAL_USER" label="Portal User" />
            <el-option value="EXTERNAL_APP" label="External App" />
            <el-option value="AI_AGENT" label="AI Agent" />
          </el-select>
          <el-select v-model="auditStore.filterApiAction" filterable clearable placeholder="API Action" style="width:220px">
            <el-option v-for="api in catalogStore.entries" :key="api.id" :label="api.apiAction" :value="api.apiAction" />
          </el-select>
          <el-select v-model="auditStore.filterDecision" placeholder="决策结果" style="width:130px">
            <el-option value="ALL" label="全部" />
            <el-option value="ALLOW" label="ALLOW" />
            <el-option value="DENY" label="DENY" />
          </el-select>
          <el-date-picker
            v-model="dateRangeVal"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="onDateChange"
            clearable
            style="width:240px"
          />
          <el-button text @click="auditStore.resetFilters(); dateRangeVal = null">
            <el-icon><RefreshLeft /></el-icon> 重置
          </el-button>
        </div>

        <el-table :data="pagedLogs" stripe border style="width:100%">
          <el-table-column label="时间" width="160">
            <template #default="{ row }">{{ row.timestamp.slice(0, 19).replace('T', ' ') }}</template>
          </el-table-column>
          <el-table-column label="调用方类型" width="120">
            <template #default="{ row }"><StatusBadge :status="row.callerType" /></template>
          </el-table-column>
          <el-table-column prop="callerId" label="调用方 ID" width="140" />
          <el-table-column label="API Action" min-width="180">
            <template #default="{ row }"><code class="action-code">{{ row.apiAction }}</code></template>
          </el-table-column>
          <el-table-column label="资源范围" width="150">
            <template #default="{ row }">
              <span class="scope-text">T:{{ row.tenant }}/C:{{ row.customer }}/F:{{ row.facility }}</span>
            </template>
          </el-table-column>
          <el-table-column label="决策" width="90">
            <template #default="{ row }">
              <el-tag :type="row.decision === 'ALLOW' ? 'success' : 'danger'" size="small">{{ row.decision }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="原因码" width="200">
            <template #default="{ row }">
              <code v-if="row.errorCode" class="error-code">{{ row.errorCode }}</code>
              <span v-else class="allow-text">—</span>
            </template>
          </el-table-column>
          <el-table-column label="耗时" width="80">
            <template #default="{ row }">{{ row.durationMs }} ms</template>
          </el-table-column>
        </el-table>

        <div class="pagination-bar">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="20"
            :total="auditStore.filteredLogs.length"
            layout="total, prev, pager, next"
            background
          />
        </div>
      </el-tab-pane>

      <!-- 依赖分析 -->
      <el-tab-pane label="🔗 依赖分析" name="dependency">
        <div class="dep-layout">
          <div class="dep-api-list">
            <div class="dep-panel-title">API Actions</div>
            <div
              v-for="api in catalogStore.entries.filter(e => e.lifecycle === 'ACTIVE')"
              :key="api.id"
              class="dep-api-item"
              :class="{ active: selectedDepApi === api.apiAction }"
              @click="selectedDepApi = api.apiAction"
            >
              <code>{{ api.apiAction }}</code>
              <RiskLevelTag :level="api.riskLevel" size="small" />
            </div>
          </div>
          <div class="dep-detail">
            <template v-if="selectedDepApi">
              <div class="dep-panel-title">{{ selectedDepApi }} 的消费者</div>
              <el-table :data="currentDependency.consumers" stripe border style="width:100%">
                <el-table-column label="Profile 名称" min-width="180">
                  <template #default="{ row }"><code>{{ row.profileName }}</code></template>
                </el-table-column>
                <el-table-column label="类型" width="120">
                  <template #default="{ row }">
                    <el-tag :type="row.profileType === 'INTEGRATION' ? '' : 'warning'" size="small">
                      {{ row.profileType === 'INTEGRATION' ? '🔌 集成档案' : '🤖 AI 档案' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="近 7 天调用" width="120">
                  <template #default="{ row }">{{ row.last7DayCalls.toLocaleString() }}</template>
                </el-table-column>
                <el-table-column label="最后调用" width="160">
                  <template #default="{ row }">{{ row.lastCalledAt.slice(0, 16).replace('T', ' ') }}</template>
                </el-table-column>
              </el-table>
              <el-empty v-if="!currentDependency.consumers.length" description="暂无消费者引用此 API" :image-size="60" />
            </template>
            <el-empty v-else description="请选择左侧 API Action 查看依赖关系" :image-size="80" />
          </div>
        </div>
      </el-tab-pane>

      <!-- Deprecated 监控 -->
      <el-tab-pane label="⚠️ Deprecated 监控" name="deprecated">
        <el-alert type="warning" :closable="false" show-icon
          title="以下 API 已标记为 Deprecated，但仍有消费者在调用。请在下线前通知相关团队完成迁移。"
          style="margin-bottom:16px"
        />
        <template v-if="deprecatedApis.length">
          <div v-for="item in deprecatedApis" :key="item.id" class="deprecated-item">
            <div class="dep-api-header">
              <code class="action-code">{{ item.apiAction }}</code>
              <StatusBadge status="DEPRECATED" />
              <span class="dep-owner">负责人: {{ item.owner }}</span>
            </div>
            <el-table v-if="item.dependency.consumers.length" :data="item.dependency.consumers" size="small" border style="width:100%;margin-top:8px">
              <el-table-column prop="profileName" label="消费者" min-width="180" />
              <el-table-column label="类型" width="100">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.profileType }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="近 7 天调用" width="120">
                <template #default="{ row }">{{ row.last7DayCalls.toLocaleString() }}</template>
              </el-table-column>
            </el-table>
            <el-empty v-else description="无活跃消费者，可安全下线" :image-size="40" />
          </div>
        </template>
        <el-empty v-else description="暂无 Deprecated API" :image-size="80" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RefreshLeft } from '@element-plus/icons-vue'
import { useAuditStore } from '@/stores/audit'
import { useCatalogStore } from '@/stores/catalog'
import StatusBadge from '@/components/common/StatusBadge.vue'
import RiskLevelTag from '@/components/common/RiskLevelTag.vue'

const auditStore = useAuditStore()
const catalogStore = useCatalogStore()
const activeTab = ref('logs')
const currentPage = ref(1)
const selectedDepApi = ref('')
const dateRangeVal = ref<any>(null)

const pagedLogs = computed(() => {
  const start = (currentPage.value - 1) * 20
  return auditStore.filteredLogs.slice(start, start + 20)
})

const currentDependency = computed(() =>
  selectedDepApi.value ? auditStore.getDependencies(selectedDepApi.value) : { apiAction: '', consumers: [] }
)

const deprecatedApis = computed(() => auditStore.getDeprecatedApis())

function onDateChange(val: [Date, Date] | null) {
  if (val) {
    auditStore.dateRange = [val[0].toISOString().slice(0, 10), val[1].toISOString().slice(0, 10)]
  } else {
    auditStore.dateRange = null
  }
}
</script>

<style scoped>
.audit-view { display: flex; flex-direction: column; gap: 16px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-header h2 { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
.page-header p { font-size: 13px; color: #909399; }
.audit-tabs { background: #fff; border: 1px solid var(--card-border); border-radius: 8px; padding: 0 20px 20px; }
.filter-card { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; padding: 14px 0 16px; }
.action-code { font-family: monospace; font-size: 12px; color: var(--el-color-primary); }
.scope-text { font-family: monospace; font-size: 11px; color: #606266; }
.error-code { font-family: monospace; font-size: 11px; color: #f56c6c; background: #fef0f0; padding: 1px 6px; border-radius: 3px; }
.allow-text { color: #c0c4cc; }
.pagination-bar { display: flex; justify-content: flex-end; margin-top: 12px; }
.dep-layout { display: flex; gap: 16px; min-height: 400px; }
.dep-api-list { width: 260px; flex-shrink: 0; background: #fafbfc; border: 1px solid var(--card-border); border-radius: 6px; overflow-y: auto; }
.dep-panel-title { font-size: 13px; font-weight: 600; padding: 12px 14px; border-bottom: 1px solid #e4e7ed; }
.dep-api-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; cursor: pointer; border-bottom: 1px solid #f0f0f0; transition: background 0.15s; }
.dep-api-item:hover { background: var(--el-color-primary-light-9); }
.dep-api-item.active { background: var(--el-color-primary-light-9); border-left: 3px solid var(--el-color-primary); }
.dep-api-item code { font-family: monospace; font-size: 12px; color: var(--el-color-primary); }
.dep-detail { flex: 1; background: #fff; border: 1px solid var(--card-border); border-radius: 6px; padding: 16px; }
.deprecated-item { background: #fff; border: 1px solid #ffd591; border-radius: 6px; padding: 16px; margin-bottom: 12px; }
.dep-api-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.dep-owner { font-size: 12px; color: #909399; margin-left: auto; }
</style>
