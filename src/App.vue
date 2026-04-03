<script setup>
import { useConnectionStore } from './stores/connection'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const connection = useConnectionStore()
const router = useRouter()

onMounted(async () => {
  if (connection.serverUrl) {
    await connection.validate()
    if (connection.connected) {
      router.replace('/')
    } else {
      router.replace('/connect')
    }
  } else {
    router.replace('/connect')
  }
})
</script>

<template>
  <router-view />
</template>
