<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatsStore } from '../../stores/chats'
import { useFoldersStore } from '../../stores/folders'
import { useConnectionStore } from '../../stores/connection'
import ChatListItem from './ChatListItem.vue'
import FolderItem from './FolderItem.vue'

const props = defineProps({
  open: Boolean,
})
const emit = defineEmits(['toggle', 'close'])

const router = useRouter()
const chats = useChatsStore()
const folders = useFoldersStore()
const connection = useConnectionStore()

const unfolderedChats = computed(() => chats.unfolderedChats)

onMounted(async () => {
  await Promise.all([chats.fetchChats(), folders.fetchFolders()])
})

async function handleNewChat() {
  try {
    const result = await chats.createChat()
    if (result?.chat_id) {
      router.push({ name: 'chat-id', params: { id: result.chat_id } })
    }
  } catch (e) {
    console.error('Failed to create chat:', e)
  }
}

function handleDisconnect() {
  connection.disconnect()
  router.replace('/connect')
}

function goSettings(tab) {
  router.push({ name: 'settings-tab', params: { tab } })
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: !open }">
    <div class="sidebar-header">
      <div class="brand">
        <img class="brand-logo" src="/newelle-logo.svg" width="28" height="28" alt="" />
        <span class="brand-name">Newelle</span>
      </div>
      <button class="new-chat-btn" @click="handleNewChat" title="New Chat">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>

    <div class="sidebar-content">
      <div v-if="chats.loading" class="loading-text">Loading chats...</div>

      <!-- Folders -->
      <div v-for="folder in folders.folders" :key="folder.id" class="folder-section">
        <FolderItem :folder="folder" />
      </div>

      <!-- Unfoldered chats -->
      <div v-if="unfolderedChats.length" class="chat-group">
        <div v-if="folders.folders.length" class="chat-group-label">Chats</div>
        <ChatListItem
          v-for="chat in unfolderedChats"
          :key="chat.id"
          :chat="chat"
          :active="chat.id === chats.currentChatId"
        />
      </div>

      <div v-if="!chats.loading && chats.chats.length === 0" class="empty-state">
        No chats yet
      </div>
    </div>

    <div class="sidebar-footer">
      <button class="footer-btn" @click="goSettings('tools')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span>Settings</span>
      </button>
      <button class="footer-btn disconnect" @click="handleDisconnect">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Disconnect</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.3s ease;
}

.sidebar.collapsed {
  margin-left: calc(-1 * var(--sidebar-width));
}

.sidebar-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: block;
  object-fit: contain;
  flex-shrink: 0;
}

.brand-name {
  font-weight: 600;
  font-size: 15px;
}

.new-chat-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  color: var(--text-secondary);
  transition: all 0.15s;
}

.new-chat-btn:hover {
  background: var(--bg-tertiary);
  color: var(--accent);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.loading-text, .empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 24px 12px;
  font-size: 13px;
}

.chat-group-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  padding: 8px 8px 4px;
}

.sidebar-footer {
  padding: 8px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 13px;
  width: 100%;
  text-align: left;
  transition: all 0.15s;
}

.footer-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.footer-btn.disconnect:hover {
  color: var(--red);
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
  }
  .sidebar.collapsed {
    margin-left: calc(-1 * var(--sidebar-width));
  }
}
</style>
