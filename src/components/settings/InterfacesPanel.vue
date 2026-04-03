<script setup>
import { onMounted } from 'vue'
import { useSettingsStore } from '../../stores/settings'

const settings = useSettingsStore()

onMounted(() => {
  settings.fetchInterfaces()
})

async function toggleInterface(iface) {
  await settings.setInterfaceEnabled(iface.key, !iface.enabled)
}

async function startInterface(iface) {
  await settings.startInterface(iface.key)
}

async function stopInterface(iface) {
  await settings.stopInterface(iface.key)
}
</script>

<template>
  <div class="panel">
    <h3>Interfaces</h3>
    <p class="panel-desc">Manage external interfaces and services.</p>

    <div v-if="!settings.interfaces.length" class="empty">No interfaces available</div>

    <div class="item-list">
      <div v-for="iface in settings.interfaces" :key="iface.key" class="list-item interface-item">
        <div class="item-info">
          <div class="item-row">
            <span class="item-name">{{ iface.name || iface.title || iface.key }}</span>
            <span class="status-dot" :class="{ running: iface.running }"></span>
          </div>
          <span v-if="iface.description" class="item-desc">{{ iface.description }}</span>
          <span v-if="iface.error" class="item-error">{{ iface.error }}</span>
        </div>
        <div class="item-actions">
          <button
            v-if="iface.running"
            class="action-btn stop"
            @click="stopInterface(iface)"
          >Stop</button>
          <button
            v-else-if="iface.enabled"
            class="action-btn start"
            @click="startInterface(iface)"
          >Start</button>
          <button
            class="toggle-btn"
            :class="{ on: iface.enabled }"
            @click="toggleInterface(iface)"
          >
            <span class="toggle-track">
              <span class="toggle-thumb"></span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
