import getClient from './client'

export function getTtsProviders() {
  return getClient().get('/api/tts/providers').then(r => r.data)
}

export function getTtsStatus() {
  return getClient().get('/api/tts/status').then(r => r.data)
}

export function setTtsProvider(provider) {
  return getClient().post('/api/tts/set-provider', { provider }).then(r => r.data)
}

export function getTtsSettings(provider) {
  const params = provider ? { provider } : {}
  return getClient().get('/api/tts/settings', { params }).then(r => r.data)
}

export function setTtsSettings(provider, settings) {
  return getClient().post('/api/tts/settings', { provider, settings }).then(r => r.data)
}

export function getTtsVoices() {
  return getClient().get('/api/tts/voices').then(r => r.data)
}

export function playTts(text) {
  return getClient().post('/api/tts/play', null, {
    params: { text },
  }).then(r => r.data)
}

export function stopTts() {
  return getClient().post('/api/tts/stop').then(r => r.data)
}

export function streamTts(text, voice = null) {
  const client = getClient()
  const params = new URLSearchParams()
  params.append('text', text)
  if (voice) params.append('voice', voice)
  return client.post(`/api/tts/stream?${params.toString()}`, null, {
    responseType: 'blob',
  }).then(r => r.data)
}
