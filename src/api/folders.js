import getClient from './client'

export function listFolders() {
  return getClient().get('/api/folders').then(r => r.data)
}

export function createFolder(name, color, icon = 'folder-symbolic') {
  return getClient().post('/api/folders', { name, color, icon }).then(r => r.data)
}

export function renameFolder(folderId, name) {
  return getClient().put(`/api/folders/${folderId}/rename`, { name }).then(r => r.data)
}

export function updateFolderColor(folderId, color) {
  return getClient().put(`/api/folders/${folderId}/color`, { color }).then(r => r.data)
}

export function updateFolderIcon(folderId, icon) {
  return getClient().put(`/api/folders/${folderId}/icon`, { icon }).then(r => r.data)
}

export function deleteFolder(folderId) {
  return getClient().delete(`/api/folders/${folderId}`).then(r => r.data)
}

export function toggleFolderExpanded(folderId) {
  return getClient().post(`/api/folders/${folderId}/toggle-expanded`).then(r => r.data)
}

export function moveChatToFolder(chatId, folderId) {
  return getClient().post('/api/folders/move-chat', { chat_id: chatId, folder_id: folderId }).then(r => r.data)
}

export function removeChatFromFolder(chatId) {
  return getClient().post('/api/folders/remove-chat', { chat_id: chatId }).then(r => r.data)
}

export function getFolderForChat(chatId) {
  return getClient().get(`/api/folders/chat/${chatId}`).then(r => r.data)
}
