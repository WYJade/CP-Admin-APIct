<template>
  <div class="placeholder">
    <el-empty :description="`「${title}」页面暂未实现，敬请期待`" :image-size="100">
      <template #image>
        <el-icon style="font-size:80px;color:#dacceb"><Document /></el-icon>
      </template>
    </el-empty>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Document } from '@element-plus/icons-vue'
const route = useRoute()
const title = computed(() => (route.meta?.title as string) ?? '该页面')
</script>
<style scoped>
.placeholder { display: flex; justify-content: center; align-items: center; height: calc(100vh - 200px); background: #fff; border-radius: 8px; border: 1px solid var(--card-border); }
</style>
