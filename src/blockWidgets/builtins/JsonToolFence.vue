<script setup>
import { computed } from 'vue'
import ToolCallBlock from '../../components/chat/ToolCallBlock.vue'
import CodeBlock from '../../components/chat/CodeBlock.vue'
import { parseToolPayload } from '../../utils/messageParsing'

const props = defineProps({
  code: String,
  language: String,
})

const tool = computed(() => {
  try {
    const parsed = JSON.parse(props.code.trim())
    return parseToolPayload(parsed)
  } catch {
    return null
  }
})
</script>

<template>
  <ToolCallBlock v-if="tool" :tool="tool" />
  <CodeBlock v-else :code="code" language="json" />
</template>
