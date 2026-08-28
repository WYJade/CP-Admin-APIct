<template>
  <div class="topbar">
    <!-- 面包屑 -->
    <div class="topbar-left">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="parentTitle">{{ parentTitle }}</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentTitle !== '首页'">{{ currentTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧工具栏 -->
    <div class="topbar-right">
      <!-- 暗色模式 -->
      <el-tooltip content="切换暗色模式" placement="bottom">
        <el-switch
          v-model="isDark"
          :active-icon="Moon"
          :inactive-icon="Sunny"
          inline-prompt
          size="small"
          @change="toggleDark"
        />
      </el-tooltip>

      <!-- 语言切换 -->
      <el-dropdown @command="handleLang" trigger="click">
        <span class="lang-btn">
          <el-icon style="margin-right:4px"><Setting /></el-icon>
          {{ currentLang === 'zh' ? '简体中文' : 'English' }}
          <el-icon class="el-icon--right" style="margin-left:3px"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh" :disabled="currentLang === 'zh'">简体中文</el-dropdown-item>
            <el-dropdown-item command="en" :disabled="currentLang === 'en'">English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 用户头像 + 信息 -->
      <el-dropdown trigger="click">
        <div class="user-avatar">
          <el-avatar size="small" :style="{ background: 'var(--el-color-primary)', fontSize: '13px', fontWeight: 700 }">
            {{ userInitial }}
          </el-avatar>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled>{{ username }}</el-dropdown-item>
            <el-dropdown-item divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowDown, Moon, Sunny, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const isDark = ref(false)
const currentLang = ref('zh')
const username = ref('API Admin')
const userInitial = computed(() => username.value.charAt(0).toUpperCase())

const parentMap: Record<string, string> = {
  'api-admin': 'API Admin',
  'integration': 'Integration Admin',
  'ai': 'AI Capability Admin',
  'permission': '权限管理',
  'coupon': '优惠券',
}

const currentTitle = computed(() => (route.meta?.title as string) ?? '首页')
const parentTitle = computed(() => {
  const parent = route.meta?.parent as string
  return parent ? parentMap[parent] : ''
})

function toggleDark() {
  document.documentElement.classList.toggle('dark', isDark.value)
}

function handleLang(lang: string) {
  currentLang.value = lang
  ElMessage.info(lang === 'zh' ? '已切换至简体中文' : 'Switched to English')
}
</script>

<style scoped>
.topbar {
  height: var(--topbar-height);
  background: var(--topbar-bg);
  border-bottom: 1px solid var(--topbar-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}
.lang-btn {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
  user-select: none;
}
.lang-btn:hover { background: #f5f5f5; }
.user-avatar { cursor: pointer; }
</style>
