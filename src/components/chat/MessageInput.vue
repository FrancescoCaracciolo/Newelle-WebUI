<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue'
import { recognizeSpeech } from '../../api/stt'
import VoiceRecorder from '../../utils/voiceRecorder'

const emit = defineEmits(['send', 'stop', 'regenerate'])
const props = defineProps({
  disabled: Boolean,
  streaming: Boolean,
})

const text = ref('')
const textarea = ref(null)
const recordingState = ref('idle')

let recorder = null

function handleSend() {
  const msg = text.value.trim()
  if (!msg || props.disabled) return
  emit('send', msg)
  text.value = ''
  nextTick(() => autoResize())
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function autoResize() {
  if (textarea.value) {
    textarea.value.style.height = 'auto'
    textarea.value.style.height = Math.min(textarea.value.scrollHeight, 200) + 'px'
  }
}

async function toggleRecording() {
  if (recordingState.value === 'idle') {
    await startRecording()
  } else if (recordingState.value === 'recording') {
    await stopRecording()
  }
}

async function startRecording() {
  if (!recorder) {
    recorder = new VoiceRecorder()
    recorder.onTranscript = (transcript) => {
      if (transcript) {
        text.value = text.value ? text.value + ' ' + transcript : transcript
        nextTick(() => {
          autoResize()
          handleSend()
        })
      }
    }
    recorder.onError = (error) => {
      console.error('Voice recording error:', error)
    }
    recorder.onStateChange = (state) => {
      recordingState.value = state
    }
  }

  try {
    await recorder.start(recognizeSpeech)
  } catch (err) {
    console.error('Failed to start recording:', err)
  }
}

async function stopRecording() {
  if (recorder) {
    await recorder.stop()
  }
}

function cancelRecording() {
  if (recorder) {
    recorder.cancel()
  }
}

onBeforeUnmount(() => {
  if (recorder) {
    recorder.cancel()
  }
})
</script>

<template>
  <div class="message-input-area">
    <div class="input-container">
      <textarea
        ref="textarea"
        v-model="text"
        placeholder="Type a message..."
        :disabled="disabled && !streaming"
        @keydown="handleKeydown"
        @input="autoResize"
        rows="1"
      ></textarea>
      <div class="input-actions">
        <button
          class="action-btn mic-btn"
          :class="{ 'recording': recordingState === 'recording', 'processing': recordingState === 'processing' }"
          @click="toggleRecording"
          :disabled="recordingState === 'processing' || (disabled && !streaming)"
          :title="recordingState === 'recording' ? 'Stop recording' : 'Start voice input'"
        >
          <svg v-if="recordingState !== 'recording'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
        </button>
        <button
          v-if="streaming"
          class="action-btn stop-btn"
          @click="$emit('stop')"
          title="Stop"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
        </button>
        <template v-else>
          <button
            class="action-btn"
            :disabled="disabled"
            @click="$emit('regenerate')"
            title="Regenerate"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
          <button
            class="send-btn"
            :disabled="disabled || !text.trim()"
            @click="handleSend"
            title="Send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-input-area {
  padding: 12px 20px 16px;
  border-top: 1px solid var(--border);
  background: var(--bg-primary);
  flex-shrink: 0;
}

.input-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 8px 12px;
  transition: border-color 0.2s;
}

.input-container:focus-within {
  border-color: var(--accent);
}

textarea {
  flex: 1;
  background: none;
  border: none;
  resize: none;
  min-height: 24px;
  max-height: 200px;
  padding: 4px 0;
  line-height: 1.5;
  color: var(--text-primary);
}

textarea:focus {
  border: none;
  outline: none;
}

textarea::placeholder {
  color: var(--text-muted);
}

.input-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  padding-bottom: 2px;
}

.action-btn, .send-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  color: var(--text-muted);
  transition: all 0.15s;
}

.action-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.mic-btn.recording {
  color: var(--red);
  animation: pulse-mic 1.5s ease-in-out infinite;
}

.mic-btn.processing {
  color: var(--accent);
}

@keyframes pulse-mic {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.stop-btn {
  color: var(--red);
}

.stop-btn:hover {
  background: var(--red-dim);
}

.send-btn {
  background: var(--accent);
  color: #fff;
}

.send-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.send-btn:disabled {
  background: var(--bg-hover);
  color: var(--text-muted);
}
</style>
