<script setup>
import { ref } from 'vue'

const props = defineProps({
  content: String,
})

const expanded = ref(false)
</script>

<template>
  <div class="thinking-block">
    <div class="thinking-header" @click="expanded = !expanded">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4M12 8h.01"/>
      </svg>
      <span>{{ expanded ? 'Hide thinking' : 'Show thinking' }}</span>
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        class="chevron" :class="{ expanded }"
      >
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>
    <div v-if="expanded" class="thinking-content">
      <pre>{{ content }}</pre>
    </div>
  </div>
</template>

<style scoped>
.thinking-block {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin: 4px 0;
  overflow: hidden;
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 13px;
}

.thinking-header:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.chevron {
  margin-left: auto;
  transition: transform 0.15s;
}

.chevron.expanded {
  transform: rotate(90deg);
}

.thinking-content {
  border-top: 1px solid var(--border);
  padding: 10px 14px;
  max-height: 300px;
  overflow-y: auto;
}

.thinking-content pre {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}
</style>
