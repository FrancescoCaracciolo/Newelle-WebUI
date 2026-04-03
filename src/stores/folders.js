import { defineStore } from 'pinia'
import { listFolders, createFolder, renameFolder, updateFolderColor, deleteFolder, toggleFolderExpanded, moveChatToFolder, removeChatFromFolder } from '../api/folders'

export const useFoldersStore = defineStore('folders', {
  state: () => ({
    folders: [],
    loading: false,
  }),

  actions: {
    async fetchFolders() {
      this.loading = true
      try {
        this.folders = await listFolders()
      } finally {
        this.loading = false
      }
    },

    async createFolder(data) {
      await createFolder(data.name, data.color, data.icon)
      await this.fetchFolders()
    },

    async renameFolder(folderId, name) {
      await renameFolder(folderId, name)
      await this.fetchFolders()
    },

    async updateColor(folderId, color) {
      await updateFolderColor(folderId, color)
      await this.fetchFolders()
    },

    async deleteFolder(folderId) {
      await deleteFolder(folderId)
      await this.fetchFolders()
    },

    async toggleExpanded(folderId) {
      await toggleFolderExpanded(folderId)
      await this.fetchFolders()
    },

    async moveChat(chatId, folderId) {
      await moveChatToFolder(chatId, folderId)
      await this.fetchFolders()
    },

    async removeChat(chatId) {
      await removeChatFromFolder(chatId)
      await this.fetchFolders()
    },
  },
})
