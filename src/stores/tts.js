import { defineStore } from 'pinia'
import * as api from '../api/tts'

export const useTtsStore = defineStore('tts', {
  state: () => ({
    providers: [],
    status: { provider: '', voice: '' },
    settings: [],
    playing: false,
    currentText: '',
  }),

  actions: {
    async fetchProviders() {
      this.providers = await api.getTtsProviders()
    },

    async fetchStatus() {
      this.status = await api.getTtsStatus()
    },

    async fetchSettings(provider) {
      const res = await api.getTtsSettings(provider)
      this.settings = res.settings
      return res
    },

    async setProvider(provider) {
      await api.setTtsProvider(provider)
      await this.fetchStatus()
      await this.fetchSettings(provider)
    },

    async updateSetting(provider, key, value) {
      await api.setTtsSettings(provider, { [key]: value })
      await this.fetchSettings(provider)
    },

    async play(text) {
      if (!text || !text.trim()) return
      await this.stop()
      this.playing = true
      this.currentText = text
      try {
        await api.playTts(text)
      } catch (e) {
        console.error('TTS play error:', e)
      } finally {
        this.playing = false
        this.currentText = ''
      }
    },

    async stop() {
      if (this.playing) {
        try {
          await api.stopTts()
        } catch (e) {
          console.error('TTS stop error:', e)
        }
      }
      this.playing = false
      this.currentText = ''
    },
  },
})
