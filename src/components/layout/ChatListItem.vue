<script setup>
import { useRouter } from 'vue-router'
import { useChatsStore } from '../../stores/chats'
import { useMessagesStore } from '../../stores/messages'
import { ref } from 'vue'

const props = defineProps({
  chat: Object,
  active: Boolean,
})

const router = useRouter()
const chats = useChatsStore()
const messages = useMessagesStore()
const showMenu = ref(false)

async function selectChat() {
  await chats.selectChat(props.chat.id)
  const history = await chats.fetchHistory(props.chat.id)
  messages.setMessages(history)
  router.push({ name: 'chat-id', params: { id: props.chat.id } })
  showMenu.value = false
}

async function handleDelete(e) {
  e.stopPropagation()
  showMenu.value = false
  if (confirm('Delete this chat?')) {
    await chats.deleteChat(props.chat.id)
  }
}

async function handleCopy(e) {
  e.stopPropagation()
  showMenu.value = false
  await chats.copyChat(props.chat.id)
}

function toggleMenu(e) {
  e.stopPropagation()
  showMenu.value = !showMenu.value
}
</script>

<template>
  <div class="chat-item" :class="{ active }" @click="selectChat">
    <div class="chat-info">
      <span class="chat-name truncate">{{ chat.name || 'Untitled' }}</span>
      <span v-if="chat.message_count" class="chat-meta">{{ chat.message_count }} msgs</span>
    </div>
    <button class="menu-trigger" @click="toggleMenu">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="2"/>
        <circle cx="12" cy="12" r="2"/>
        <circle cx="12" cy="19" r="2"/>
      </svg>
    </button>
    <div v-if="showMenu" class="item-menu" @click.stop>
      <button @click="handleCopy">Duplicate</button>
      <button class="danger" @click="handleDelete">Delete</button>
    </div>
  </div>
</template>

<style scoped>
.chat-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}

.chat-item:hover {
  background: var(--bg-hover);
}

.chat-item.active {
  background: var(--accent-dim);
}

.chat-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.chat-name {
  font-size: 13px;
  color: var(--text-primary);
}

.active .chat-name {
  color: var(--accent);
}

.chat-meta {
  font-size: 11px;
  color: var(--text-muted);
}

.menu-trigger {
  opacity: 0;
  padding: 4px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  flex-shrink: 0;
}

.chat-item:hover .menu-trigger {
  opacity: 1;
}

.menu-trigger:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.item-menu {
  position: absolute;
  right: 8px;
  top: 100%;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  padding: 4px;
  z-index: 50;
  min-width: 120px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.item-menu button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 6px 10px;
  font-size: 13px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.item-menu button:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.item-menu button.danger:hover {
  color: var(--red);
}
</style>
