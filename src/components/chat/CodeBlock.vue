<script setup>
import { computed, ref } from 'vue'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import markdown from 'highlight.js/lib/languages/markdown'
import sql from 'highlight.js/lib/languages/sql'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('sql', sql)

const props = defineProps({
  code: String,
  language: String,
})

const copied = ref(false)

const highlighted = computed(() => {
  try {
    if (props.language && props.language !== 'text') {
      return hljs.highlight(props.code, { language: props.language }).value
    }
    return hljs.highlightAuto(props.code).value
  } catch {
    return props.code
  }
})

function copy() {
  navigator.clipboard.writeText(props.code)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>

<template>
  <div class="code-block">
    <div class="code-header">
      <span class="code-lang">{{ language || 'code' }}</span>
      <button class="copy-btn" @click="copy">
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <pre><code v-html="highlighted"></code></pre>
  </div>
</template>

<style scoped>
.code-block {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  margin: 4px 0;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border);
}

.code-lang {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.copy-btn {
  font-size: 12px;
  color: var(--text-muted);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.copy-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

pre {
  margin: 0;
  padding: 12px 16px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.5;
}

code {
  font-family: inherit;
  background: none;
  padding: 0;
}
</style>
