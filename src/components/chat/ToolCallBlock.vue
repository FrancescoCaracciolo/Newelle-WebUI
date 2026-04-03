<script setup>
import { ref } from 'vue'

const props = defineProps({
  tool: Object,
})

const expanded = ref(false)
</script>

<template>
  <div class="tool-call">
    <div class="tool-header" @click="expanded = !expanded">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
      <span class="tool-name">{{ tool.name || 'Tool Call' }}</span>
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        class="chevron" :class="{ expanded }"
      >
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
    <div v-if="expanded" class="tool-body">
      <pre>{{ JSON.stringify(tool.arguments || tool, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.tool-call {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin: 4px 0;
  overflow: hidden;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  color: var(--green);
  font-size: 13px;
}

.tool-header:hover {
  background: var(--bg-tertiary);
}

.tool-name {
  font-weight: 500;
}

.chevron {
  margin-left: auto;
  color: var(--text-muted);
  transition: transform 0.15s;
}

.chevron.expanded {
  transform: rotate(90deg);
}

.tool-body {
  border-top: 1px solid var(--border);
  padding: 10px 14px;
}

.tool-body pre {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
