<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useChatsStore } from '../stores/chats'
import { useMessagesStore } from '../stores/messages'
import ChatView from '../components/chat/ChatView.vue'

const props = defineProps({
  id: [String, Number],
})

const route = useRoute()
const chats = useChatsStore()
const messages = useMessagesStore()

async function loadChat(chatId) {
  if (chatId) {
    const numId = Number(chatId)
    chats.currentChatId = numId
    const history = await chats.fetchHistory(numId)
    messages.setMessages(history)
  }
}

onMounted(async () => {
  if (props.id) {
    await loadChat(props.id)
  }
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    loadChat(newId)
  }
})
</script>

<template>
  <ChatView />
</template>
