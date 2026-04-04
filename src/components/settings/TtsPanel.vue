<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useTtsStore } from '../../stores/tts'

const tts = useTtsStore()

const selectedProvider = ref('')
const providerSettings = ref({})
const testText = ref('Hello, this is a test of text to speech.')
const testPlaying = ref(false)

const currentProvider = computed(() =>
  tts.providers.find(p => p.key === selectedProvider.value)
)

onMounted(async () => {
  await Promise.all([
    tts.fetchProviders(),
    tts.fetchStatus(),
  ])
  selectedProvider.value = tts.status.provider
  await loadSettings()
})

watch(selectedProvider, async (newVal, oldVal) => {
  if (oldVal && newVal !== oldVal) {
    await tts.setProvider(newVal)
    await loadSettings()
  }
})

async function loadSettings() {
  if (!selectedProvider.value) return
  await tts.fetchSettings(selectedProvider.value)
  providerSettings.value = {}
  for (const s of tts.settings) {
    providerSettings.value[s.key] = s.value
  }
}

async function updateSetting(key, value) {
  providerSettings.value[key] = value
  await tts.updateSetting(selectedProvider.value, key, value)
}

async function playTest() {
  if (!testText.value.trim()) return
  testPlaying.value = true
  await tts.play(testText.value)
  testPlaying.value = false
}

async function stopTest() {
  await tts.stop()
  testPlaying.value = false
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
    <h3>Text-to-Speech</h3>
    <p class="panel-desc">Configure the TTS engine and settings.</p>

    <!-- Provider Selection -->
    <div class="setting-group">
      <label class="setting-label">Provider</label>
      <select v-model="selectedProvider" class="setting-select">
        <option v-for="p in tts.providers" :key="p.key" :value="p.key">
          {{ p.title }}
        </option>
      </select>
      <span v-if="currentProvider?.description" class="setting-hint">{{ currentProvider.description }}</span>
    </div>

    <!-- Provider-specific settings -->
    <div v-if="tts.settings.length" class="provider-settings">
      <h4 class="settings-section-title">Provider Settings</h4>
      <div class="settings-list">
        <div v-for="s in tts.settings" :key="s.key" class="setting-item">
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

    <!-- Test TTS -->
    <div class="test-section">
      <h4 class="settings-section-title">Test TTS</h4>
      <textarea
        v-model="testText"
        class="test-textarea"
        rows="3"
        placeholder="Enter text to speak..."
      />
      <div class="test-actions">
        <button
          class="action-btn start"
          :disabled="testPlaying || !testText.trim()"
          @click="playTest"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          {{ testPlaying ? 'Playing...' : 'Play' }}
        </button>
        <button
          v-if="testPlaying"
          class="action-btn stop"
          @click="stopTest"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
          Stop
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.setting-group {
  margin-bottom: 20px;
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

.setting-hint {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
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

.test-section {
  margin-top: 20px;
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

.test-textarea {
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  resize: vertical;
  min-height: 60px;
  margin-bottom: 8px;
}

.test-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}

.action-btn.start {
  color: var(--green);
  border: 1px solid var(--green);
}

.action-btn.start:hover:not(:disabled) {
  background: var(--green-dim);
}

.action-btn.stop {
  color: var(--red);
  border: 1px solid var(--red);
}

.action-btn.stop:hover {
  background: var(--red-dim);
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
