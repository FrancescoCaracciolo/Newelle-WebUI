<script setup>
import { useMessagesStore } from '../../stores/messages'
import { parseMessageSegments } from '../../utils/messageParsing'
import CodeBlockOrWidget from './CodeBlockOrWidget.vue'
import { computed } from 'vue'

const props = defineProps({
  interaction: Object,
})

const messages = useMessagesStore()
const segments = computed(() =>
  props.interaction?.display_text
    ? parseMessageSegments(props.interaction.display_text)
    : [],
)
</script>

<template>
  <div class="interaction-prompt" v-if="interaction">
    <div class="interaction-header">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
      <span class="interaction-tool-name">{{ interaction.tool_name || 'Tool' }}</span>
      <span class="interaction-label">requires your input</span>
    </div>
    <div v-if="segments.length" class="interaction-display">
      <template v-for="(seg, i) in segments" :key="i">
        <CodeBlockOrWidget v-if="seg.type === 'code'" :code="seg.content" :language="seg.language" />
        <pre v-else class="interaction-text">{{ seg.content }}</pre>
      </template>
    </div>
    <div class="interaction-options">
      <button
        v-for="opt in interaction.options"
        :key="opt.index"
        class="interaction-btn"
        :class="{ primary: opt.index === 0 }"
        @click="messages.respondToInteraction(opt.index)"
      >
        {{ opt.title }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.interaction-prompt {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin: 8px 0;
  overflow: hidden;
}

.interaction-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 500;
}

.interaction-tool-name {
  font-weight: 600;
}

.interaction-label {
  color: var(--text-muted);
  font-weight: 400;
  font-style: italic;
}

.interaction-display {
  border-top: 1px solid var(--border);
  padding: 10px 14px;
  background: var(--bg-tertiary);
}

.interaction-text {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
}

.interaction-options {
  display: flex;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid var(--border);
}

.interaction-btn {
  padding: 6px 16px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}

.interaction-btn:hover {
  background: var(--bg-hover);
}

.interaction-btn.primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.interaction-btn.primary:hover {
  opacity: 0.9;
}
</style>
