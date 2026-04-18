<template>
  <div class="app-shell">
    <NavBar />
    <main class="app-main">
      <router-view />
    </main>
    <Toast />
  </div>
</template>

<script setup>
import { onUnmounted, provide, watch } from 'vue'
import NavBar from '@/components/NavBar.vue'
import Toast from '@/components/Toast.vue'
import { connectSSE, disconnectSSE, useUser } from '@/api'

const user = useUser()

function handleNewMessage(data) {
  console.log('SSE newMessage event:', data)
  window.dispatchEvent(new CustomEvent('sse:newMessage', { detail: data }))
}

function handleNewGroupMessage(data) {
  window.dispatchEvent(new CustomEvent('sse:newGroupMessage', { detail: data }))
}

function handleEventUpdate(data) {
  window.dispatchEvent(new CustomEvent('sse:eventUpdate', { detail: data }))
}

function handleEventStatusChanged(data) {
  window.dispatchEvent(new CustomEvent('sse:eventStatusChanged', { detail: data }))
}

function handleNewRegistration(data) {
  window.dispatchEvent(new CustomEvent('sse:newRegistration', { detail: data }))
}

function handleRegistrationResult(data) {
  window.dispatchEvent(new CustomEvent('sse:registrationResult', { detail: data }))
}

watch(user, (newUser) => {
  if (newUser) {
    connectSSE(handleNewMessage, handleNewGroupMessage, handleEventUpdate, handleEventStatusChanged, handleNewRegistration, handleRegistrationResult)
  } else {
    disconnectSSE()
  }
}, { immediate: true })

onUnmounted(() => {
  disconnectSSE()
})

provide('connectSSE', () => {
  if (user.value) {
    connectSSE(handleNewMessage, handleNewGroupMessage, handleEventUpdate, handleEventStatusChanged, handleNewRegistration, handleRegistrationResult)
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
