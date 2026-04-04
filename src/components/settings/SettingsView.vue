<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import PromptsPanel from './PromptsPanel.vue'
import ToolsPanel from './ToolsPanel.vue'
import InterfacesPanel from './InterfacesPanel.vue'
import ProfilesPanel from './ProfilesPanel.vue'
import ScheduledTasksPanel from './ScheduledTasksPanel.vue'
import LLMPanel from './LLMPanel.vue'
import TtsPanel from './TtsPanel.vue'

const props = defineProps({
  initialTab: { type: String, default: 'tools' },
})

const activeTab = ref(props.initialTab)

const tabs = [
  { key: 'llm', label: 'LLM' },
  { key: 'tools', label: 'Tools' },
  { key: 'prompts', label: 'Prompts' },
  { key: 'tts', label: 'TTS' },
  { key: 'interfaces', label: 'Interfaces' },
  { key: 'profiles', label: 'Profiles' },
  { key: 'tasks', label: 'Scheduled Tasks' },
]

const settings = useSettingsStore()
</script>

<template>
  <div class="settings-view">
    <div class="settings-header">
      <router-link :to="{ name: 'chat' }" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to Chat
      </router-link>
      <h2>Settings</h2>
    </div>
    <div class="settings-body">
      <nav class="settings-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>
      <div class="settings-panel">
        <LLMPanel v-if="activeTab === 'llm'" />
        <ToolsPanel v-if="activeTab === 'tools'" />
        <PromptsPanel v-if="activeTab === 'prompts'" />
        <TtsPanel v-if="activeTab === 'tts'" />
        <InterfacesPanel v-if="activeTab === 'interfaces'" />
        <ProfilesPanel v-if="activeTab === 'profiles'" />
        <ScheduledTasksPanel v-if="activeTab === 'tasks'" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.settings-header {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  font-size: 13px;
}

.back-link:hover {
  color: var(--accent);
}

.settings-header h2 {
  font-size: 16px;
  font-weight: 600;
}

.settings-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.settings-tabs {
  width: 200px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tab-btn {
  text-align: left;
  padding: 8px 12px;
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 13px;
  transition: all 0.15s;
}

.tab-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--accent-dim);
  color: var(--accent);
}

.settings-panel {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

@media (max-width: 768px) {
  .settings-body {
    flex-direction: column;
  }
  .settings-tabs {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  .tab-btn {
    white-space: nowrap;
  }
}
</style>
