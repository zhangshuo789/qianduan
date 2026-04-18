<template>
  <div class="app-shell">
    <NavBar />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onUnmounted, provide, watch } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { connectSSE, disconnectSSE, useUser } from '@/api'

const user = useUser()

function handleNewMessage(data) {
  console.log('SSE newMessage event:', data)
  window.dispatchEvent(new CustomEvent('sse:newMessage', { detail: data }))
}

function handleNewGroupMessage(data) {
  window.dispatchEvent(new CustomEvent('sse:newGroupMessage', { detail: data }))
}

watch(user, (newUser) => {
  if (newUser) {
    connectSSE(handleNewMessage, handleNewGroupMessage)
  } else {
    disconnectSSE()
  }
}, { immediate: true })

onUnmounted(() => {
  disconnectSSE()
})

provide('connectSSE', () => {
  if (user.value) {
    connectSSE(handleNewMessage, handleNewGroupMessage)
  }
})

provide('disconnectSSE', () => {
  disconnectSSE()
})

provide('refreshUnread', async () => {
})
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background-color: var(--color-bg-page);
}

.app-main {
  padding-top: 72px;
}
</style>
