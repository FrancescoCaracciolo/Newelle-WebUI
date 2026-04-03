import getClient from './client'

export function listChats() {
  return getClient().get('/api/chats').then(r => r.data)
}

export function getChat(chatId) {
  return getClient().get(`/api/chats/${chatId}`).then(r => r.data)
}

export function getChatHistory(chatId) {
  return getClient().get(`/api/chats/${chatId}/history`).then(r => r.data)
}

export function getChatIds() {
  return getClient().get('/api/chats/ids').then(r => r.data)
}

export function createChat(data = {}) {
  return getClient().post('/api/chats', data).then(r => r.data)
}

export function renameChat(chatId, name) {
  return getClient().put(`/api/chats/${chatId}/rename`, { name }).then(r => r.data)
}

export function deleteChat(chatId) {
  return getClient().delete(`/api/chats/${chatId}`).then(r => r.data)
}

export function setChatMessages(chatId, messages) {
  return getClient().put(`/api/chats/${chatId}`, messages).then(r => r.data)
}

export function copyChat(chatId) {
  return getClient().post(`/api/chats/${chatId}/copy`).then(r => r.data)
}

export function chooseChat(chatId) {
  return getClient().post(`/api/chats/${chatId}/choose`).then(r => r.data)
}

export function branchChat(chatId, messageId, sourceChatId) {
  return getClient().post(`/api/chats/${chatId}/branch`, { message_id: messageId, source_chat_id: sourceChatId }).then(r => r.data)
}
