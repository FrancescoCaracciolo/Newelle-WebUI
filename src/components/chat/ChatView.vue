<script setup>
import { ref, computed, onMounted } from 'vue'
import { useChatsStore } from '../../stores/chats'
import { useMessagesStore } from '../../stores/messages'
import { useSettingsStore } from '../../stores/settings'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'
import StreamingIndicator from './StreamingIndicator.vue'

const chats = useChatsStore()
const messages = useMessagesStore()
const settings = useSettingsStore()

const hasChat = computed(() => chats.currentChatId !== null)
const showStreaming = computed(() => messages.streaming)

const showModelPicker = ref(false)

const currentProvider = computed(() =>
  settings.llmProviders.find(p => p.key === settings.llmStatus.provider)
)
const currentModel = computed(() => settings.llmStatus.model)
const providerLabel = computed(() => currentProvider.value?.title || settings.llmStatus.provider)

onMounted(() => {
  settings.fetchLlmStatus()
  settings.fetchLlmProviders()
})

async function pickModel(model) {
  await settings.setLlmModel(model.id, settings.llmStatus.provider)
  showModelPicker.value = false
}

async function pickProvider(provider) {
  await settings.setLlmProvider(provider.key)
  showModelPicker.value = false
}

function toggleModelPicker() {
  showModelPicker.value = !showModelPicker.value
  if (showModelPicker.value && !settings.llmModels.length) {
    settings.fetchLlmModels(settings.llmStatus.provider)
  }
}
</script>

<template>
  <div class="chat-view">
    <div v-if="!hasChat" class="empty-chat">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
      <h2>Newelle</h2>
      <p>Select a chat or create a new one to get started</p>
    </div>

    <template v-else>
      <div class="chat-header">
        <span class="chat-title truncate">{{ chats.currentChat?.name || 'Chat' }}</span>
        <div class="header-right">
          <button class="model-pill" @click="toggleModelPicker" :disabled="showStreaming">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span class="model-pill-text">{{ providerLabel }}</span>
            <span v-if="currentModel" class="model-pill-sep">/</span>
            <span v-if="currentModel" class="model-pill-model truncate">{{ currentModel }}</span>
          </button>
          <StreamingIndicator v-if="showStreaming" />
        </div>
      </div>

      <!-- Model picker dropdown -->
      <div v-if="showModelPicker" class="model-picker-overlay" @click="showModelPicker = false">
        <div class="model-picker" @click.stop>
          <div class="picker-section">
            <div class="picker-label">Providers</div>
            <button
              v-for="p in settings.llmProviders"
              :key="p.key"
              class="picker-item"
              :class="{ active: p.key === settings.llmStatus.provider }"
              @click="pickProvider(p)"
            >
              {{ p.title }}
            </button>
          </div>
          <div v-if="settings.llmModels.length" class="picker-section">
            <div class="picker-label">Models</div>
            <button
              v-for="m in settings.llmModels"
              :key="m.id"
              class="picker-item"
              :class="{ active: m.id === currentModel }"
              @click="pickModel(m)"
            >
              {{ m.name }}
            </button>
          </div>
        </div>
      </div>

      <MessageList
        :messages="messages.messages"
        :streaming-content="messages.streaming ? messages.streamingContent : ''"
        :pending-interaction="messages.pendingInteraction"
      />
      <MessageInput
        :disabled="messages.generating"
        :streaming="messages.streaming"
        @send="messages.send"
        @stop="messages.stop"
        @regenerate="messages.regenerate"
      />
    </template>
  </div>
</template>

<style scoped>
.chat-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-muted);
}

.empty-chat h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-secondary);
}

.empty-chat p {
  font-size: 14px;
}

.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-secondary);
  flex-shrink: 0;
}

.chat-title {
  font-weight: 500;
  font-size: 15px;
  flex: 1;
  min-width: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.model-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 12px;
  max-width: 280px;
  transition: all 0.15s;
}

.model-pill:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--text-primary);
}

.model-pill-text {
  font-weight: 500;
}

.model-pill-sep {
  color: var(--text-muted);
}

.model-pill-model {
  color: var(--text-muted);
  max-width: 120px;
}

.model-picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: flex-end;
  padding: 56px 20px 0 0;
}

.model-picker {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  width: 280px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}

.picker-section {
  padding: 8px;
  border-bottom: 1px solid var(--border);
}

.picker-section:last-child {
  border-bottom: none;
}

.picker-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 4px 8px;
}

.picker-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.1s;
}

.picker-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.picker-item.active {
  background: var(--accent-dim);
  color: var(--accent);
}
</style>
