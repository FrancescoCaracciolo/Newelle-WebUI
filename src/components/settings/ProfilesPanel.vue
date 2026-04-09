<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '../../stores/settings'

const settings = useSettingsStore()
const profileName = ref('')

onMounted(async () => {
  await Promise.all([settings.fetchProfiles(), settings.fetchCurrentProfile()])
})

async function createProfile() {
  if (!profileName.value.trim()) return
  await settings.createProfile({ profile_name: profileName.value.trim() })
  profileName.value = ''
}

async function deleteProfile(name) {
  if (!confirm(`Delete profile "${name}"?`)) return
  await settings.deleteProfile(name)
}

async function switchProfile(name) {
  await settings.switchProfile(name)
}

async function exportProfile(name) {
  const data = await settings.exportProfile(name)
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
      <div v-for="profile in settings.profiles" :key="profile.name" class="list-item" :class="{ active: profile.current }">
        <div class="item-info">
          <span class="item-name">{{ profile.name }}</span>
          <span v-if="profile.current" class="badge">Active</span>
        </div>
        <div class="item-actions">
          <button v-if="!profile.current" class="action-btn" @click="switchProfile(profile.name)">Switch</button>
          <button class="action-btn" @click="exportProfile(profile.name)">Export</button>
          <button class="action-btn danger" :disabled="profile.current" @click="deleteProfile(profile.name)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-item.active {
  background: var(--color-primary-bg, rgba(99, 102, 241, 0.08));
  border-left: 3px solid var(--color-primary, #6366f1);
}
.badge {
  font-size: 0.7rem;
  background: var(--color-primary, #6366f1);
  color: #fff;
  padding: 1px 6px;
  border-radius: 8px;
  margin-left: 6px;
}
</style>
