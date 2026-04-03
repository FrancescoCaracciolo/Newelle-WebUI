<script setup>
import { ref, watch, onMounted } from 'vue'
import { useSettingsStore } from '../../stores/settings'

const settings = useSettingsStore()

const expandedKey = ref(null)
/** @type {import('vue').Ref<Record<string, string>>} */
const editBuffers = ref({})
const savingKey = ref(null)

onMounted(() => {
  settings.fetchPrompts()
})

watch(
  () => settings.prompts,
  (list) => {
    for (const p of list) {
      if (p.editable && editBuffers.value[p.key] === undefined) {
        editBuffers.value[p.key] = p.text ?? ''
      }
    }
  },
  { deep: true, immediate: true },
)

function isExpanded(key) {
  return expandedKey.value === key
}

function toggleExpand(prompt) {
  if (expandedKey.value === prompt.key) {
    expandedKey.value = null
  } else {
    expandedKey.value = prompt.key
    if (prompt.editable && editBuffers.value[prompt.key] === undefined) {
      editBuffers.value = { ...editBuffers.value, [prompt.key]: prompt.text ?? '' }
    }
  }
}

async function togglePrompt(prompt) {
  await settings.setPromptActive(prompt.key, !prompt.active)
}

function buffer(prompt) {
  return editBuffers.value[prompt.key] ?? prompt.text ?? ''
}

function setBuffer(prompt, value) {
  editBuffers.value = { ...editBuffers.value, [prompt.key]: value }
}

async function savePrompt(prompt) {
  savingKey.value = prompt.key
  try {
    await settings.setCustomPrompt(prompt.key, editBuffers.value[prompt.key] ?? '')
    await settings.fetchPrompts()
  } finally {
    savingKey.value = null
  }
}

async function deleteCustom(prompt) {
  if (!confirm('Remove custom text for this prompt?')) return
  await settings.deleteCustomPrompt(prompt.key)
  expandedKey.value = null
  await settings.fetchPrompts()
}
</script>

<template>
  <div class="panel">
    <h3>Prompts</h3>
    <p class="panel-desc">Manage system prompts available to the AI. Expand a row to view details and edit enabled prompts.</p>

    <div v-if="!settings.prompts.length" class="empty">No prompts available</div>

    <div v-else class="prompt-list">
      <div
        v-for="prompt in settings.prompts"
        :key="prompt.key"
        class="prompt-card"
        :class="{ expanded: isExpanded(prompt.key) }"
      >
        <div class="prompt-row" @click="toggleExpand(prompt)">
          <button
            type="button"
            class="prompt-chevron"
            :class="{ open: isExpanded(prompt.key) }"
            :aria-expanded="isExpanded(prompt.key)"
            @click.stop="toggleExpand(prompt)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          <div class="item-info prompt-summary">
            <span class="item-name">{{ prompt.name || prompt.key }}</span>
            <span v-if="prompt.description && !isExpanded(prompt.key)" class="item-desc truncate">{{ prompt.description }}</span>
          </div>
          <button
            type="button"
            class="toggle-btn"
            :class="{ on: prompt.active }"
            @click.stop="togglePrompt(prompt)"
          >
            <span class="toggle-track">
              <span class="toggle-thumb"></span>
            </span>
          </button>
        </div>

        <div v-if="isExpanded(prompt.key)" class="prompt-body">
          <p v-if="prompt.description" class="prompt-desc">{{ prompt.description }}</p>

          <template v-if="prompt.editable">
            <label class="prompt-label">Prompt text</label>
            <textarea
              class="prompt-textarea"
              :value="buffer(prompt)"
              rows="12"
              spellcheck="false"
              @input="setBuffer(prompt, $event.target.value)"
            />
            <div class="prompt-actions">
              <button
                type="button"
                class="action-btn"
                :disabled="savingKey === prompt.key"
                @click="savePrompt(prompt)"
              >
                {{ savingKey === prompt.key ? 'Saving…' : 'Save' }}
              </button>
              <button
                v-if="prompt.key === 'custom_prompt'"
                type="button"
                class="action-btn danger"
                :disabled="savingKey === prompt.key"
                @click="deleteCustom(prompt)"
              >
                Clear custom
              </button>
            </div>
          </template>
          <p v-else class="prompt-readonly-hint">This prompt is managed by the application and cannot be edited here.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prompt-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prompt-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.prompt-card.expanded {
  border-color: var(--border-light);
}

.prompt-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 10px 8px;
  cursor: pointer;
  min-height: 48px;
}

.prompt-row:hover {
  background: var(--bg-tertiary);
}

.prompt-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.prompt-chevron.open {
  transform: rotate(90deg);
}

.prompt-chevron:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.prompt-summary {
  flex: 1;
  min-width: 0;
}

.prompt-body {
  padding: 0 14px 14px 42px;
  border-top: 1px solid var(--border);
  background: var(--bg-primary);
}

.prompt-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 12px 0;
}

.prompt-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.prompt-textarea {
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.45;
  resize: vertical;
  min-height: 180px;
  width: 100%;
}

.prompt-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.prompt-readonly-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin: 12px 0 0;
}
</style>
