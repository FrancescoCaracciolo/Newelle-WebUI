<script setup>
import { onMounted } from 'vue'
import { useSettingsStore } from '../../stores/settings'

const settings = useSettingsStore()

onMounted(() => {
  settings.fetchTools()
})

async function toggleTool(tool) {
  await settings.setToolEnabled(tool.name ?? tool.key, !tool.enabled)
}
</script>

<template>
  <div class="panel">
    <h3>Tools</h3>
    <p class="panel-desc">Enable or disable tools available to the AI.</p>

    <div v-if="!settings.tools.length" class="empty">No tools available</div>

    <div class="item-list">
      <div v-for="tool in settings.tools" :key="tool.name ?? tool.key" class="list-item">
        <div class="item-info">
          <span class="item-name">{{ tool.name || tool.key }}</span>
          <span v-if="tool.description" class="item-desc">{{ tool.description }}</span>
        </div>
        <button
          class="toggle-btn"
          :class="{ on: tool.enabled }"
          @click="toggleTool(tool)"
        >
          <span class="toggle-track">
            <span class="toggle-thumb"></span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
