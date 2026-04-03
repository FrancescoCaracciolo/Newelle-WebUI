import getClient from './client'

export function getSettings() {
  return getClient().get('/api/settings').then(r => r.data)
}

export function patchSettings(settings) {
  return getClient().patch('/api/settings', { settings }).then(r => r.data)
}

export function getPrompts() {
  return getClient().get('/api/prompts').then(r => r.data)
}

export function setPromptActive(promptKey, active) {
  return getClient().post('/api/prompts/set-active', { prompt_key: promptKey, active }).then(r => r.data)
}

export function setCustomPrompt(promptKey, text) {
  return getClient().post('/api/prompts/set-custom', { prompt_key: promptKey, text }).then(r => r.data)
}

export function deleteCustomPrompt(promptKey) {
  return getClient().post('/api/prompts/delete-custom', { prompt_key: promptKey }).then(r => r.data)
}

export function getTools() {
  return getClient().get('/api/tools').then(r => r.data)
}

export function setToolEnabled(toolName, enabled) {
  return getClient().post('/api/tools/set-enabled', { tool_name: toolName, enabled }).then(r => r.data)
}

export function requireToolUpdate() {
  return getClient().post('/api/tools/require-update').then(r => r.data)
}

export function getEnabledTools() {
  return getClient().get('/api/tools/enabled').then(r => r.data)
}

export function getCommands() {
  return getClient().get('/api/commands').then(r => r.data)
}

export function getCommand(name) {
  return getClient().get(`/api/commands/${name}`).then(r => r.data)
}

export function updateMcpTools() {
  return getClient().post('/api/tools/mcp-update').then(r => r.data)
}

export function getMcpIntegration() {
  return getClient().get('/api/tools/mcp').then(r => r.data)
}

export function getInterfaces() {
  return getClient().get('/api/interfaces').then(r => r.data)
}

export function setInterfaceEnabled(interfaceKey, enabled) {
  return getClient().post('/api/interfaces/set-enabled', { interface_key: interfaceKey, enabled }).then(r => r.data)
}

export function isInterfaceRunning(interfaceKey) {
  return getClient().get(`/api/interfaces/${interfaceKey}/running`).then(r => r.data)
}

export function startInterface(interfaceKey) {
  return getClient().post(`/api/interfaces/${interfaceKey}/start`).then(r => r.data)
}

export function stopInterface(interfaceKey) {
  return getClient().post(`/api/interfaces/${interfaceKey}/stop`).then(r => r.data)
}

export function getInterfaceError(interfaceKey) {
  return getClient().get(`/api/interfaces/${interfaceKey}/error`).then(r => r.data)
}

export function createProfile(data) {
  return getClient().post('/api/profiles', data).then(r => r.data)
}

export function deleteProfile(profileName) {
  return getClient().delete(`/api/profiles/${profileName}`).then(r => r.data)
}

export function updateCurrentProfile() {
  return getClient().post('/api/profiles/update-current').then(r => r.data)
}

export function exportProfile(profileName) {
  return getClient().get(`/api/profiles/${profileName}/export`).then(r => r.data)
}

export function importProfile(profileData) {
  return getClient().post('/api/profiles/import', { profile_data: profileData }).then(r => r.data)
}

export function switchProfile(profile) {
  return getClient().post('/api/profiles/switch', { profile }).then(r => r.data)
}

export function getScheduledTasks() {
  return getClient().get('/api/scheduled-tasks').then(r => r.data)
}

export function createScheduledTask(data) {
  return getClient().post('/api/scheduled-tasks', data).then(r => r.data)
}

export function setScheduledTaskEnabled(taskId, enabled) {
  return getClient().post('/api/scheduled-tasks/set-enabled', { task_id: taskId, enabled }).then(r => r.data)
}

export function deleteScheduledTask(taskId) {
  return getClient().delete(`/api/scheduled-tasks/${taskId}`).then(r => r.data)
}

export function setScheduledTaskFolder(taskId, folderId) {
  return getClient().post('/api/scheduled-tasks/set-folder', { task_id: taskId, folder_id: folderId }).then(r => r.data)
}

export function getScheduledTaskFolder(taskId) {
  return getClient().get(`/api/scheduled-tasks/${taskId}/folder`).then(r => r.data)
}

export function startScheduler() {
  return getClient().post('/api/scheduler/start').then(r => r.data)
}

export function stopScheduler() {
  return getClient().post('/api/scheduler/stop').then(r => r.data)
}

export function reload(reloadType) {
  return getClient().post('/api/bootstrap/reload', { reload_type: reloadType }).then(r => r.data)
}

export function closeApplication() {
  return getClient().post('/api/bootstrap/close').then(r => r.data)
}

export function waitLlmLoading() {
  return getClient().get('/api/bootstrap/llm-loading').then(r => r.data)
}

// LLM management
export function getLlmProviders() {
  return getClient().get('/api/llm/providers').then(r => r.data)
}

export function getLlmStatus() {
  return getClient().get('/api/llm/status').then(r => r.data)
}

export function getLlmModels(provider) {
  const params = provider ? { provider } : {}
  return getClient().get('/api/llm/models', { params }).then(r => r.data)
}

export function setLlmProvider(provider) {
  return getClient().post('/api/llm/set-provider', { provider }).then(r => r.data)
}

export function setLlmModel(model, provider) {
  const data = { model }
  if (provider) data.provider = provider
  return getClient().post('/api/llm/set-model', data).then(r => r.data)
}

export function getLlmSettings(provider) {
  const params = provider ? { provider } : {}
  return getClient().get('/api/llm/settings', { params }).then(r => r.data)
}

export function setLlmSettings(provider, settings) {
  return getClient().post('/api/llm/settings', { provider, settings }).then(r => r.data)
}
