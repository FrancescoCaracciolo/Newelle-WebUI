<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '../../stores/settings'

const settings = useSettingsStore()
const newTask = ref('')
const newCron = ref('')

onMounted(() => {
  settings.fetchScheduledTasks()
})

async function createTask() {
  if (!newTask.value.trim()) return
  await settings.createScheduledTask({
    task: newTask.value.trim(),
    cron: newCron.value.trim() || undefined,
  })
  newTask.value = ''
  newCron.value = ''
}

async function toggleTask(task) {
  await settings.setScheduledTaskEnabled(task.id ?? task.task_id, !task.enabled)
}

async function deleteTask(task) {
  const id = task.id ?? task.task_id
  await settings.deleteScheduledTask(id)
}
</script>

<template>
  <div class="panel">
    <h3>Scheduled Tasks</h3>
    <p class="panel-desc">Manage automated tasks and schedules.</p>

    <div class="create-row">
      <input v-model="newTask" placeholder="Task prompt" />
      <input v-model="newCron" placeholder="cron expression (optional)" class="cron-input" />
      <button class="create-btn" :disabled="!newTask.trim()" @click="createTask">Add</button>
    </div>

    <div v-if="!settings.scheduledTasks?.length" class="empty">No scheduled tasks</div>

    <div class="item-list">
      <div v-for="task in settings.scheduledTasks" :key="task.id ?? task.task_id" class="list-item">
        <div class="item-info">
          <span class="item-name">{{ task.task }}</span>
          <span v-if="task.cron" class="item-desc">Cron: {{ task.cron }}</span>
          <span v-if="task.run_at" class="item-desc">Run at: {{ task.run_at }}</span>
        </div>
        <div class="item-actions">
          <button
            class="toggle-btn"
            :class="{ on: task.enabled }"
            @click="toggleTask(task)"
          >
            <span class="toggle-track">
              <span class="toggle-thumb"></span>
            </span>
          </button>
          <button class="action-btn danger" @click="deleteTask(task)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>
