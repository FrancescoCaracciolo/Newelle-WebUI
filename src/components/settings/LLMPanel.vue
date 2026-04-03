<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useSettingsStore } from '../../stores/settings'

const settings = useSettingsStore()

const selectedProvider = ref('')
const selectedModel = ref('')
const loadingModels = ref(false)
const providerSettings = ref({})

const currentProvider = computed(() =>
  settings.llmProviders.find(p => p.key === selectedProvider.value)
)

onMounted(async () => {
  await Promise.all([
    settings.fetchLlmProviders(),
    settings.fetchLlmStatus(),
  ])
  selectedProvider.value = settings.llmStatus.provider
  selectedModel.value = settings.llmStatus.model
  await loadModelsAndSettings()
})

watch(selectedProvider, async (newVal, oldVal) => {
  if (oldVal && newVal !== oldVal) {
    await settings.setLlmProvider(newVal)
    selectedModel.value = settings.llmStatus.model
    await loadModelsAndSettings()
  }
})

async function loadModelsAndSettings() {
  if (!selectedProvider.value) return
  loadingModels.value = true
  try {
    await Promise.all([
      settings.fetchLlmModels(selectedProvider.value),
      settings.fetchLlmSettings(selectedProvider.value),
    ])
    // Build local settings values
    providerSettings.value = {}
    for (const s of settings.llmSettings) {
      providerSettings.value[s.key] = s.value
    }
  } finally {
    loadingModels.value = false
  }
}

async function changeModel(model) {
  selectedModel.value = model
  await settings.setLlmModel(model, selectedProvider.value)
}

async function updateSetting(key, value) {
  providerSettings.value[key] = value
  await settings.setLlmSettings(selectedProvider.value, { [key]: value })
}

function getSettingType(s) {
  if (s.type === 'EntrySetting' || s.type === 'entry') return 'entry'
  if (s.type === 'ToggleSetting' || s.type === 'toggle') return 'toggle'
  if (s.type === 'ComboSetting' || s.type === 'combo') return 'combo'
  if (s.type === 'SpinSetting' || s.type === 'spin') return 'spin'
  if (s.type === 'ScaleSetting' || s.type === 'range') return 'range'
  if (s.type === 'MultilineEntrySetting' || s.type === 'multilineentry') return 'multiline'
  return null
}
</script>

<template>
  <div class="panel">
    <h3>LLM</h3>
    <p class="panel-desc">Configure the language model provider and settings.</p>

    <!-- Provider Selection -->
    <div class="setting-group">
      <label class="setting-label">Provider</label>
      <select v-model="selectedProvider" class="setting-select">
        <option v-for="p in settings.llmProviders" :key="p.key" :value="p.key">
          {{ p.title }}
        </option>
      </select>
      <span v-if="currentProvider?.description" class="setting-hint">{{ currentProvider.description }}</span>
    </div>

    <!-- Model Selection -->
    <div class="setting-group">
      <label class="setting-label">Model</label>
      <div class="model-row">
        <select
          v-model="selectedModel"
          class="setting-select"
          :disabled="loadingModels"
          @change="changeModel(selectedModel)"
        >
          <option v-if="loadingModels" disabled value="">Loading...</option>
          <option v-for="m in settings.llmModels" :key="m.id" :value="m.id">
            {{ m.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Provider-specific settings -->
    <div v-if="settings.llmSettings.length" class="provider-settings">
      <h4 class="settings-section-title">Provider Settings</h4>
      <div class="settings-list">
        <div v-for="s in settings.llmSettings" :key="s.key" class="setting-item">
          <div class="setting-info">
            <span class="setting-name">{{ s.title }}</span>
            <span v-if="s.description" class="setting-desc">{{ s.description }}</span>
          </div>
          <div class="setting-control">
            <!-- Toggle -->
            <button
              v-if="getSettingType(s) === 'toggle'"
              class="toggle-btn"
              :class="{ on: !!providerSettings[s.key] }"
              @click="updateSetting(s.key, !providerSettings[s.key])"
            >
              <span class="toggle-track">
                <span class="toggle-thumb"></span>
              </span>
            </button>
            <!-- Entry / Password -->
            <input
              v-else-if="getSettingType(s) === 'entry'"
              :type="s.password ? 'password' : 'text'"
              :value="providerSettings[s.key] ?? s.default ?? ''"
              class="setting-input"
              @change="updateSetting(s.key, $event.target.value)"
            />
            <!-- Multiline -->
            <textarea
              v-else-if="getSettingType(s) === 'multiline'"
              :value="providerSettings[s.key] ?? s.default ?? ''"
              class="setting-textarea"
              rows="3"
              @change="updateSetting(s.key, $event.target.value)"
            ></textarea>
            <!-- Combo / Select -->
            <select
              v-else-if="getSettingType(s) === 'combo' && s.values"
              :value="providerSettings[s.key] ?? s.default"
              class="setting-select"
              @change="updateSetting(s.key, $event.target.value)"
            >
              <option v-for="v in s.values" :key="v[0]" :value="v[0]">{{ v[1] }}</option>
            </select>
            <!-- Spin (number) -->
            <input
              v-else-if="getSettingType(s) === 'spin'"
              type="number"
              :value="providerSettings[s.key] ?? s.default ?? 0"
              :min="s.min"
              :max="s.max"
              :step="s.step || 1"
              class="setting-input setting-number"
              @change="updateSetting(s.key, Number($event.target.value))"
            />
            <!-- Range / Scale -->
            <div v-else-if="getSettingType(s) === 'range'" class="range-control">
              <input
                type="range"
                :value="providerSettings[s.key] ?? s.default ?? 0"
                :min="s.min"
                :max="s.max"
                :step="1 / Math.pow(10, s['round-digits'] || 0)"
                class="setting-range"
                @input="updateSetting(s.key, Number($event.target.value))"
              />
              <span class="range-value">{{ providerSettings[s.key] ?? s.default ?? 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.setting-group {
  margin-bottom: 16px;
}

.setting-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--text-secondary);
}

.setting-select {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
}

.setting-select:focus {
  border-color: var(--accent);
}

.setting-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.setting-hint {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.model-row {
  display: flex;
  gap: 8px;
}

.provider-settings {
  margin-top: 20px;
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

.settings-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.setting-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-name {
  font-size: 13px;
  font-weight: 500;
}

.setting-desc {
  font-size: 12px;
  color: var(--text-muted);
}

.setting-control {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.setting-input {
  width: 220px;
  padding: 6px 10px;
  font-size: 13px;
}

.setting-number {
  width: 100px;
}

.setting-textarea {
  width: 220px;
  padding: 6px 10px;
  font-size: 13px;
  resize: vertical;
  min-height: 60px;
}

.setting-range {
  width: 140px;
  accent-color: var(--accent);
}

.range-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-value {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
  }
  .setting-input,
  .setting-textarea {
    width: 100%;
  }
}
</style>
