<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'

const isMobile = ref(window.innerWidth <= 768)
const sidebarOpen = ref(!isMobile.value)

function onResize() {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) sidebarOpen.value = true
}

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  if (isMobile.value) sidebarOpen.value = false
}

const route = useRoute()
watch(() => route.fullPath, closeSidebar)
</script>

<template>
  <div class="app-layout">
    <AppSidebar :open="sidebarOpen" @toggle="toggleSidebar" @close="closeSidebar" />
    <div v-if="isMobile && sidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>
    <main class="main-content">
      <div v-if="isMobile" class="mobile-header">
        <button class="menu-btn" @click="toggleSidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>
      </div>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100%;
  height: 100dvh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}

.mobile-header {
  display: flex;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
}

.menu-btn {
  color: var(--text-secondary);
  padding: 4px;
  border-radius: var(--radius-sm);
}

.menu-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 90;
}

@media (min-width: 769px) {
  .mobile-header {
    display: none;
  }
}
</style>
