<script setup>
import { ref } from 'vue'
import { useFoldersStore } from '../../stores/folders'
import { useChatsStore } from '../../stores/chats'
import ChatListItem from './ChatListItem.vue'

const props = defineProps({
  folder: Object,
})

const folders = useFoldersStore()
const chats = useChatsStore()
const expanded = ref(props.folder.expanded)

const folderChats = () => chats.chatsByFolder(props.folder.id)

function toggle() {
  expanded.value = !expanded.value
  folders.toggleExpanded(props.folder.id)
}
</script>

<template>
  <div class="folder-item">
    <div class="folder-header" @click="toggle">
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        class="chevron" :class="{ expanded }"
      >
        <polyline points="9 18 15 12 9 6"/>
      </svg>
      <span class="folder-dot" :style="{ background: folder.color || 'var(--accent)' }"></span>
      <span class="folder-name truncate">{{ folder.name }}</span>
      <span class="folder-count">{{ folder.chat_ids?.length || 0 }}</span>
    </div>
    <div v-if="expanded" class="folder-chats">
      <ChatListItem
        v-for="chat in folderChats()"
        :key="chat.id"
        :chat="chat"
        :active="chat.id === chats.currentChatId"
      />
    </div>
  </div>
</template>

<style scoped>
.folder-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}

.folder-header:hover {
  background: var(--bg-hover);
}

.chevron {
  color: var(--text-muted);
  transition: transform 0.15s;
  flex-shrink: 0;
}

.chevron.expanded {
  transform: rotate(90deg);
}

.folder-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.folder-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 0;
}

.folder-count {
  font-size: 11px;
  color: var(--text-muted);
}

.folder-chats {
  padding-left: 12px;
}
</style>
