<template>
  <div class="app-layout">
    <!-- 演示模式提示条（细条，顶部） -->
    <div class="demo-strip">
      🔶 演示模式 | 当前数据为 Mock 演示数据，页面刷新后恢复初始状态
    </div>

    <div class="layout-body">
      <AppSidebar />
      <div class="layout-main">
        <AppTopBar />
        <div class="layout-content">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppTopBar from './AppTopBar.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.demo-strip {
  background: var(--demo-banner-bg);
  color: var(--demo-banner-text);
  border-bottom: 1px solid var(--demo-banner-border);
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  height: var(--demo-banner-height);
  line-height: var(--demo-banner-height);
  flex-shrink: 0;
  letter-spacing: 0.2px;
}
.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.layout-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background: var(--content-bg);
}
.layout-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}
</style>
