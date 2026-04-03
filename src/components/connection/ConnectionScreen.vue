<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useConnectionStore } from '../../stores/connection'

const router = useRouter()
const connection = useConnectionStore()

const serverUrl = ref(connection.serverUrl || 'http://localhost:8081')
const apiKey = ref(connection.apiKey || '')
const loading = ref(false)
const error = ref(null)

async function handleConnect() {
  if (!serverUrl.value.trim()) {
    error.value = 'Server address is required'
    return
  }
  loading.value = true
  error.value = null

  const ok = await connection.connect(serverUrl.value.trim(), apiKey.value.trim())
  loading.value = false

  if (ok) {
    router.replace('/')
  } else {
    error.value = connection.error || 'Connection failed'
  }
}
</script>

<template>
  <div class="connection-screen">
    <div class="connection-card">
      <div class="logo-area">
        <div class="logo-icon">N</div>
        <h1>Newelle</h1>
        <p class="subtitle">Connect to your Newelle server</p>
      </div>

      <form @submit.prevent="handleConnect" class="connection-form">
        <div class="field">
          <label for="server">Server Address</label>
          <input
            id="server"
            v-model="serverUrl"
            type="url"
            placeholder="http://localhost:8081"
            :disabled="loading"
            autofocus
          />
        </div>

        <div class="field">
          <label for="apikey">API Key <span class="optional">(optional)</span></label>
          <input
            id="apikey"
            v-model="apiKey"
            type="password"
            placeholder="Leave empty if not required"
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" class="connect-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? 'Connecting...' : 'Connect' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.connection-screen {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 20px;
}

.connection-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.logo-area {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: var(--accent);
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
}

.logo-area h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 13px;
}

.connection-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.optional {
  color: var(--text-muted);
}

.error-msg {
  background: var(--red-dim);
  color: var(--red);
  padding: 8px 12px;
  border-radius: var(--radius);
  font-size: 13px;
}

.connect-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}

.connect-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
