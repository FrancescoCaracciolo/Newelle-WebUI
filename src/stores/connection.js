import { defineStore } from 'pinia'
import { configureClient } from '../api/client'
import { getChatIds } from '../api/chats'

export const useConnectionStore = defineStore('connection', {
  state: () => ({
    serverUrl: localStorage.getItem('newelle_server_url') || '',
    apiKey: localStorage.getItem('newelle_api_key') || '',
    connected: false,
    validating: false,
    error: null,
  }),

  actions: {
    async validate() {
      this.validating = true
      this.error = null
      try {
        configureClient(this.serverUrl, this.apiKey)
        await getChatIds()
        this.connected = true
      } catch (e) {
        this.connected = false
        if (e.response?.status === 401) {
          this.error = 'Invalid API key'
        } else if (e.code === 'ERR_NETWORK' || e.code === 'ECONNREFUSED') {
          this.error = 'Cannot connect to server'
        } else {
          this.error = e.response?.data?.error || e.message || 'Connection failed'
        }
      } finally {
        this.validating = false
      }
    },

    async connect(serverUrl, apiKey) {
      this.serverUrl = serverUrl.replace(/\/$/, '')
      this.apiKey = apiKey
      await this.validate()
      if (this.connected) {
        localStorage.setItem('newelle_server_url', this.serverUrl)
        localStorage.setItem('newelle_api_key', this.apiKey)
      }
      return this.connected
    },

    disconnect() {
      this.connected = false
      this.serverUrl = ''
      this.apiKey = ''
      this.error = null
      localStorage.removeItem('newelle_server_url')
      localStorage.removeItem('newelle_api_key')
    },
  },
})
