import { useConnectionStore } from '../stores/connection'

export function createChatStream(chatId, { onChunk, onToolInteraction, onDone, onError }) {
  const connection = useConnectionStore()
  const base = connection.serverUrl.replace(/\/$/, '')
  let url = `${base}/api/chats/${chatId}/stream`
  if (connection.apiKey) {
    url += `?api_key=${encodeURIComponent(connection.apiKey)}`
  }

  const es = new EventSource(url)

  es.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data)
      if (parsed.event === 'chunk' || parsed.event === 'data') {
        onChunk?.(parsed.data)
      } else if (parsed.event === 'tool_interaction') {
        onToolInteraction?.(parsed.data)
      } else if (parsed.event === 'done' || parsed.event === 'finished') {
        onDone?.(parsed.data)
        es.close()
      } else if (parsed.event === 'error') {
        onError?.(parsed.data)
        es.close()
      }
    } catch {
      onChunk?.(event.data)
    }
  }

  es.onerror = () => {
    onError?.('Connection lost')
    es.close()
  }

  return () => es.close()
}
