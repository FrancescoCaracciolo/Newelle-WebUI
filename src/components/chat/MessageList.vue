<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import MessageBubble from './MessageBubble.vue'
import InteractionPrompt from './InteractionPrompt.vue'

const props = defineProps({
  messages: Array,
  streamingContent: String,
  pendingInteraction: Object,
})

const container = ref(null)

function scrollToBottom() {
  nextTick(() => {
    if (container.value) {
      container.value.scrollTop = container.value.scrollHeight
    }
  })
}

watch(() => [props.messages?.length, props.streamingContent, props.pendingInteraction], scrollToBottom)
onMounted(scrollToBottom)
</script>

<template>
  <div ref="container" class="message-list">
    <div class="message-list-inner">
      <MessageBubble
        v-for="(msg, i) in messages"
        :key="i"
        :message="msg"
      />
      <MessageBubble
        v-if="streamingContent"
        :message="{ User: 'Assistant', Message: streamingContent }"
        :streaming="true"
      />
      <InteractionPrompt
        v-if="pendingInteraction"
        :interaction="pendingInteraction"
      />
    </div>
  </div>
</template>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  min-height: 0;
}

.message-list-inner {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 16px;
}
</style>
