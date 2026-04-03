<script setup>
import { computed } from 'vue'
import CodeBlock from './CodeBlock.vue'
import { resolveBlockWidget } from '../../blockWidgets/registry'

const props = defineProps({
  code: String,
  language: String,
})

const widget = computed(() => resolveBlockWidget(props.language, props.code))
</script>

<template>
  <component
    v-if="widget"
    :is="widget.component"
    :code="code"
    :language="language"
  />
  <CodeBlock v-else :code="code" :language="language" />
</template>
