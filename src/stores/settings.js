import { defineStore } from 'pinia'
import * as api from '../api/settings'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    prompts: [],
    tools: [],
    commands: [],
    interfaces: [],
    settings: {},
    scheduledTasks: [],
    loading: false,
    llmProviders: [],
    llmStatus: { provider: '', model: '', secondary_on: false, secondary_provider: '', secondary_model: '' },
    llmModels: [],
    llmSettings: [],
  }),

  actions: {
    async fetchPrompts() {
      this.prompts = await api.getPrompts()
    },

    async setPromptActive(key, active) {
      await api.setPromptActive(key, active)
      await this.fetchPrompts()
    },

    async setCustomPrompt(key, text) {
      await api.setCustomPrompt(key, text)
      await this.fetchPrompts()
    },

    async deleteCustomPrompt(key) {
      await api.deleteCustomPrompt(key)
      await this.fetchPrompts()
    },

    async fetchTools() {
      this.tools = await api.getTools()
    },

    async setToolEnabled(name, enabled) {
      await api.setToolEnabled(name, enabled)
      await this.fetchTools()
    },

    async fetchInterfaces() {
      this.interfaces = await api.getInterfaces()
    },

    async setInterfaceEnabled(key, enabled) {
      await api.setInterfaceEnabled(key, enabled)
      await this.fetchInterfaces()
    },

    async startInterface(key) {
      await api.startInterface(key)
      await this.fetchInterfaces()
    },

    async stopInterface(key) {
      await api.stopInterface(key)
      await this.fetchInterfaces()
    },

    async fetchSettings() {
      this.settings = await api.getSettings()
    },

    async patchSettings(settings) {
      await api.patchSettings(settings)
      await this.fetchSettings()
    },

    async fetchScheduledTasks() {
      this.scheduledTasks = await api.getScheduledTasks()
    },

    async createScheduledTask(data) {
      await api.createScheduledTask(data)
      await this.fetchScheduledTasks()
    },

    async deleteScheduledTask(taskId) {
      await api.deleteScheduledTask(taskId)
      await this.fetchScheduledTasks()
    },

    async setScheduledTaskEnabled(taskId, enabled) {
      await api.setScheduledTaskEnabled(taskId, enabled)
      await this.fetchScheduledTasks()
    },

    // LLM actions
    async fetchLlmProviders() {
      this.llmProviders = await api.getLlmProviders()
    },

    async fetchLlmStatus() {
      this.llmStatus = await api.getLlmStatus()
    },

    async fetchLlmModels(provider) {
      const res = await api.getLlmModels(provider)
      this.llmModels = res.models
      return res
    },

    async setLlmProvider(provider) {
      await api.setLlmProvider(provider)
      await this.fetchLlmStatus()
      await this.fetchLlmModels(provider)
    },

    async setLlmModel(model, provider) {
      await api.setLlmModel(model, provider)
      await this.fetchLlmStatus()
    },

    async fetchLlmSettings(provider) {
      const res = await api.getLlmSettings(provider)
      this.llmSettings = res.settings
      return res
    },

    async setLlmSettings(provider, settings) {
      await api.setLlmSettings(provider, settings)
      await this.fetchLlmSettings(provider)
      await this.fetchLlmStatus()
    },
  },
})
