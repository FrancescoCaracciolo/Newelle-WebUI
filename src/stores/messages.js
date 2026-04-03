import { defineStore } from 'pinia'
import { setChatMessages } from '../api/chats'
import { stopChat as apiStopChat, interactWithTool as apiInteractWithTool } from '../api/messages'
import { createChatStream } from '../api/streaming'
import { mergeStreamChunk } from '../utils/streamingMerge'
import { useChatsStore } from './chats'

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    messages: [],
    streaming: false,
    streamingContent: '',
    generating: false,
    stopStreamFn: null,
    pendingInteraction: null,
  }),

  actions: {
    setMessages(messages) {
      if (Array.isArray(messages)) {
        this.messages = messages
      } else if (messages?.chat) {
        this.messages = messages.chat
      } else {
        this.messages = []
      }
    },

    async send(text) {
      const chats = useChatsStore()
      if (!chats.currentChatId) {
        console.warn('send: no currentChatId')
        return
      }

      // 1. Build updated message list with the new user message appended
      const userMsg = { User: 'User', Message: text }
      const updatedMessages = [...this.messages, userMsg]

      // 2. Show the user message immediately (optimistic)
      this.messages = updatedMessages

      // 3. Push the updated messages to the backend chat
      try {
        await setChatMessages(chats.currentChatId, updatedMessages)
      } catch (e) {
        console.error('Failed to push message to backend:', e)
        // Don't return — still try to stream; the backend may already have the message
      }

      // 4. Start streaming the LLM response
      this.generating = true
      this.streaming = true
      this.streamingContent = ''

      this.stopStreamFn = createChatStream(chats.currentChatId, {
        onChunk: (delta) => {
          this.streamingContent = mergeStreamChunk(this.streamingContent, delta)
        },
        onToolInteraction: (data) => {
          this.pendingInteraction = data
        },
        onDone: async () => {
          this.streaming = false
          this.generating = false
          this.stopStreamFn = null
          this.pendingInteraction = null
          // Re-fetch full history to get the complete state
          try {
            const history = await chats.fetchHistory(chats.currentChatId)
            this.setMessages(history)
            await chats.fetchChats()
          } catch (e) {
            console.error('Failed to refresh history after stream:', e)
          }
        },
        onError: (msg) => {
          this.streaming = false
          this.generating = false
          this.stopStreamFn = null
          this.pendingInteraction = null
          console.error('Stream error:', msg)
        },
      })
    },

    async respondToInteraction(optionIndex) {
      if (!this.pendingInteraction) return
      const { interaction_id } = this.pendingInteraction
      this.pendingInteraction = null
      try {
        await apiInteractWithTool(interaction_id, optionIndex)
      } catch (e) {
        console.error('Failed to respond to tool interaction:', e)
      }
    },

    async regenerate() {
      const chats = useChatsStore()
      if (!chats.currentChatId || this.messages.length === 0) return

      // Remove the last assistant message (if any), keep user message
      const last = this.messages[this.messages.length - 1]
      const trimmed = last?.User === 'Assistant' ? this.messages.slice(0, -1) : [...this.messages]

      this.messages = trimmed
      try {
        await setChatMessages(chats.currentChatId, trimmed)
      } catch (e) {
        console.error('Failed to trim messages for regenerate:', e)
      }

      // Re-stream from the last user message
      this.generating = true
      this.streaming = true
      this.streamingContent = ''

      this.stopStreamFn = createChatStream(chats.currentChatId, {
        onChunk: (delta) => {
          this.streamingContent = mergeStreamChunk(this.streamingContent, delta)
        },
        onToolInteraction: (data) => {
          this.pendingInteraction = data
        },
        onDone: async () => {
          this.streaming = false
          this.generating = false
          this.stopStreamFn = null
          this.pendingInteraction = null
          try {
            const history = await chats.fetchHistory(chats.currentChatId)
            this.setMessages(history)
            await chats.fetchChats()
          } catch (e) {
            console.error('Failed to refresh after regenerate:', e)
          }
        },
        onError: (msg) => {
          this.streaming = false
          this.generating = false
          this.stopStreamFn = null
          this.pendingInteraction = null
          console.error('Regenerate stream error:', msg)
        },
      })
    },

    stop() {
      if (this.stopStreamFn) {
        this.stopStreamFn()
        this.stopStreamFn = null
      }
      this.streaming = false
      this.generating = false
      this.pendingInteraction = null
      apiStopChat()
    },
  },
})
