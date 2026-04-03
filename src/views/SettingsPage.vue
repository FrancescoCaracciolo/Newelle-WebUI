<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settings'
import SettingsView from '../components/settings/SettingsView.vue'

const props = defineProps({
  tab: String,
})

const route = useRoute()
const settings = useSettingsStore()

onMounted(() => {
  settings.fetchTools()
  settings.fetchInterfaces()
  settings.fetchPrompts()
  settings.fetchScheduledTasks()
})
</script>

<template>
  <SettingsView :initial-tab="tab || 'tools'" />
</template>
