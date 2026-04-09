<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'
import CodeBlockOrWidget from './CodeBlockOrWidget.vue'
import ToolCallBlock from './ToolCallBlock.vue'
import ThinkingBlock from './ThinkingBlock.vue'
import { parseMessageSegments } from '../../utils/messageParsing'
import { useTtsStore } from '../../stores/tts'
import { katexBlockExtension, katexInlineExtension } from '../../utils/katexExtension'

marked.use({
  extensions: [katexBlockExtension, katexInlineExtension],
})

const props = defineProps({
  message: Object,
  streaming: Boolean,
})

const isUser = computed(() => props.message.User === 'User')
const isConsole = computed(() => props.message.User === 'Console')
const consoleExpanded = ref(false)

const segments = computed(() => parseMessageSegments(props.message.Message || ''))

const tts = useTtsStore()
const ttsPlaying = ref(false)

function renderMarkdown(text) {
  if (!text) return ''
  try {
    return marked.parse(text, { breaks: true })
  } catch {
    return text
  }
}

function getPlainText() {
  return segments.value
    .filter(seg => seg.type === 'text')
    .map(seg => seg.content)
    .join('\n\n')
}

async function toggleTts() {
  if (ttsPlaying.value) {
    await tts.stop()
    ttsPlaying.value = false
  } else {
    const text = getPlainText()
    if (!text) return
    ttsPlaying.value = true
    await tts.play(text)
    ttsPlaying.value = false
  }
}
</script>

<template>
  <div class="message-bubble" :class="[message.User.toLowerCase(), { streaming }]">
    <div class="message-avatar">
      <template v-if="isUser">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </template>
      <template v-else-if="isConsole">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 17 10 11 4 5"/>
          <line x1="12" y1="19" x2="20" y2="19"/>
        </svg>
      </template>
      <template v-else>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      </template>
    </div>
    <div class="message-body">
      <div class="message-header">
        <div class="message-role">{{ isUser ? 'You' : isConsole ? 'Console' : 'Assistant' }}</div>
        <button
          v-if="!isUser && !isConsole && getPlainText()"
          class="tts-btn"
          :class="{ playing: ttsPlaying }"
          @click="toggleTts"
          :title="ttsPlaying ? 'Stop reading' : 'Read aloud'"
        >
          <svg v-if="!ttsPlaying" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
        </button>
      </div>
      <template v-if="isConsole">
        <div class="console-block" :class="{ expanded: consoleExpanded }">
          <div class="console-header" @click="consoleExpanded = !consoleExpanded">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 17 10 11 4 5"/>
              <line x1="12" y1="19" x2="20" y2="19"/>
            </svg>
            <span class="console-label">Output</span>
            <span class="console-preview truncate">{{ (message.Message || '').slice(0, 80) }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="console-chevron" :class="{ expanded: consoleExpanded }">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
          <div v-if="consoleExpanded" class="console-body">
            <template v-for="(seg, i) in segments" :key="i">
              <CodeBlockOrWidget v-if="seg.type === 'code'" :code="seg.content" :language="seg.language" />
              <ToolCallBlock v-else-if="seg.type === 'tool'" :tool="seg.content" />
              <pre v-else class="console-text">{{ seg.content }}</pre>
            </template>
          </div>
        </div>
      </template>
      <div v-else class="message-content">
        <template v-for="(seg, i) in segments" :key="i">
          <ThinkingBlock v-if="seg.type === 'thinking'" :content="seg.content" />
          <CodeBlockOrWidget v-else-if="seg.type === 'code'" :code="seg.content" :language="seg.language" />
          <ToolCallBlock v-else-if="seg.type === 'tool'" :tool="seg.content" />
          <div v-else-if="seg.type === 'text'" v-html="renderMarkdown(seg.content)" class="md-content"></div>
        </template>
        <span v-if="streaming" class="cursor-blink">|</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-bubble {
  display: flex;
  gap: 12px;
  max-width: 100%;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--bg-tertiary);
  color: var(--text-muted);
}

.assistant .message-avatar {
  background: var(--accent-dim);
  color: var(--accent);
}

.console .message-avatar {
  background: var(--green-dim);
  color: var(--green);
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-role {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.tts-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: all 0.15s;
}

.tts-btn:hover {
  background: var(--bg-hover);
  color: var(--accent);
}

.tts-btn.playing {
  color: var(--accent);
  animation: pulse-tts 1.5s ease-in-out infinite;
}

@keyframes pulse-tts {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.message-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  word-break: break-word;
}

.console .message-content {
  font-family: var(--font-mono);
  font-size: 13px;
  background: var(--bg-tertiary);
  padding: 10px 14px;
  border-radius: var(--radius);
  border-left: 3px solid var(--green);
}

/* Console collapsible block */
.console-block {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.console-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  color: var(--green);
  font-size: 13px;
}

.console-header:hover {
  background: var(--bg-hover);
}

.console-label {
  font-weight: 500;
}

.console-preview {
  flex: 1;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  min-width: 0;
}

.console-chevron {
  margin-left: auto;
  color: var(--text-muted);
  transition: transform 0.15s;
}

.console-chevron.expanded {
  transform: rotate(90deg);
}

.console-body {
  border-top: 1px solid var(--border);
  padding: 10px 14px;
  background: var(--bg-secondary);
}

.console-text {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.cursor-blink {
  animation: blink 1s step-end infinite;
  color: var(--accent);
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>

<style>
.md-content p {
  margin: 0 0 8px;
}
.md-content p:last-child {
  margin-bottom: 0;
}
.md-content ul, .md-content ol {
  margin: 8px 0;
  padding-left: 24px;
}
.md-content code {
  font-family: var(--font-mono);
  font-size: 13px;
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 3px;
}
.md-content pre {
  margin: 0;
}
.md-content blockquote {
  border-left: 3px solid var(--accent);
  padding-left: 12px;
  color: var(--text-secondary);
  margin: 8px 0;
}
.md-content table {
  border-collapse: collapse;
  margin: 8px 0;
}
.md-content th, .md-content td {
  border: 1px solid var(--border);
  padding: 6px 10px;
  font-size: 13px;
}
.md-content th {
  background: var(--bg-tertiary);
}
</style>
