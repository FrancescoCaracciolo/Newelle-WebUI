import getClient from './client'

export function sendMessage(message, chatId, stream = false) {
  return getClient().post('/api/messages/send', { message, chat_id: chatId, stream }).then(r => r.data)
}

export function runLLM(message, chatId, opts = {}) {
  return getClient().post('/api/messages/run-llm', {
    message,
    chat_id: chatId,
    system_prompt: opts.systemPrompt,
    max_tool_calls: opts.maxToolCalls ?? 10,
    save_chat: opts.saveChat ?? false,
  }).then(r => r.data)
}

export function continueMessage() {
  return getClient().post('/api/messages/continue').then(r => r.data)
}

export function regenerateMessage() {
  return getClient().post('/api/messages/regenerate').then(r => r.data)
}

export function stopChat() {
  return getClient().post('/api/messages/stop').then(r => r.data)
}

export function reloadMessage(messageId) {
  return getClient().post(`/api/messages/${messageId}/reload`).then(r => r.data)
}

export function getConsoleReply(chatId, messageId) {
  return getClient().get(`/api/chats/${chatId}/messages/${messageId}/console-reply`).then(r => r.data)
}

export function getToolResponse(chatId, messageId) {
  return getClient().get(`/api/chats/${chatId}/messages/${messageId}/tool-response`).then(r => r.data)
}

export function getToolCallUuid(chatId, messageId) {
  return getClient().get(`/api/chats/${chatId}/messages/${messageId}/tool-call-uuid`).then(r => r.data)
}

export function interactWithTool(interactionId, optionIndex) {
  return getClient().post('/api/tools/interact', {
    interaction_id: interactionId,
    option_index: optionIndex,
  }).then(r => r.data)
}
