<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '../../stores/settings'
import * as api from '../../api/settings'

const settings = useSettingsStore()
const profileName = ref('')

async function createProfile() {
  if (!profileName.value.trim()) return
  await api.createProfile({ profile_name: profileName.value.trim() })
  profileName.value = ''
}

async function deleteProfile(name) {
  if (!confirm(`Delete profile "${name}"?`)) return
  await api.deleteProfile(name)
}

async function switchProfile(name) {
  await api.switchProfile(name)
}

async function exportProfile(name) {
  const data = await api.exportProfile(name)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `newelle-profile-${name}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="panel">
    <h3>Profiles</h3>
    <p class="panel-desc">Manage configuration profiles.</p>

    <div class="create-row">
      <input v-model="profileName" placeholder="Profile name" @keydown.enter="createProfile" />
      <button class="create-btn" :disabled="!profileName.trim()" @click="createProfile">Create</button>
    </div>

    <div class="item-list">
      <div v-for="profile in settings.settings?.profiles || []" :key="profile" class="list-item">
        <div class="item-info">
          <span class="item-name">{{ profile }}</span>
        </div>
        <div class="item-actions">
          <button class="action-btn" @click="switchProfile(profile)">Switch</button>
          <button class="action-btn" @click="exportProfile(profile)">Export</button>
          <button class="action-btn danger" @click="deleteProfile(profile)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>
