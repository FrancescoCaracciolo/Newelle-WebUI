import axios from 'axios'
import { useConnectionStore } from '../stores/connection'

let client = axios.create()

export function configureClient(baseURL, apiKey) {
  client = axios.create({
    baseURL: baseURL.replace(/\/$/, ''),
  })
  if (apiKey) {
    client.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${apiKey}`
      return config
    })
  }
  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        const connection = useConnectionStore()
        connection.connected = false
        connection.error = 'Authentication failed'
      }
      return Promise.reject(err)
    }
  )
}

export default function getClient() {
  return client
}
