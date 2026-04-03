import { defineStore } from 'pinia'
import { listChats, getChatHistory, createChat, renameChat, deleteChat, copyChat, chooseChat, branchChat } from '../api/chats'

export const useChatsStore = defineStore('chats', {
  state: () => ({
    chats: [],
    currentChatId: null,
    loading: false,
  }),

  getters: {
    currentChat(state) {
      return state.chats.find(c => c.id === state.currentChatId) || null
    },
    unfolderedChats(state) {
      return state.chats.filter(c => !c.folder_id)
    },
    chatsByFolder: (state) => (folderId) => {
      return state.chats.filter(c => c.folder_id === folderId)
    },
  },

  actions: {
    async fetchChats() {
      this.loading = true
      try {
        this.chats = await listChats()
      } finally {
        this.loading = false
      }
    },

    async fetchHistory(chatId) {
      return await getChatHistory(chatId)
    },

    async createChat(data = {}) {
      const result = await createChat(data)
      await this.fetchChats()
      if (result.chat_id) {
        this.currentChatId = result.chat_id
      }
      return result
    },

    async renameChat(chatId, name) {
      await renameChat(chatId, name)
      await this.fetchChats()
    },

    async deleteChat(chatId) {
      await deleteChat(chatId)
      if (this.currentChatId === chatId) {
        this.currentChatId = null
      }
      await this.fetchChats()
    },

    async copyChat(chatId) {
      const result = await copyChat(chatId)
      await this.fetchChats()
      return result
    },

    async selectChat(chatId) {
      this.currentChatId = chatId
      await chooseChat(chatId)
    },

    async branchChat(chatId, messageId, sourceChatId) {
      const result = await branchChat(chatId, messageId, sourceChatId)
      await this.fetchChats()
      return result
    },
  },
})
