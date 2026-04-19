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
import { toastBus } from '@/utils/toast'

const user = useUser()

function handleNewMessage(data) {
  console.log('SSE newMessage event:', data)
  window.dispatchEvent(new CustomEvent('sse:newMessage', { detail: data }))
}

function handleNewGroupMessage(data) {
  window.dispatchEvent(new CustomEvent('sse:newGroupMessage', { detail: data }))
}

function handleEventUpdate(data) {
  console.log('SSE eventUpdate:', data)
  window.dispatchEvent(new CustomEvent('sse:eventUpdate', { detail: data }))
  toastBus.info(data.message || `赛事「${data.eventTitle}」已更新`)
}

function handleEventStatusChanged(data) {
  console.log('SSE eventStatusChanged:', data)
  window.dispatchEvent(new CustomEvent('sse:eventStatusChanged', { detail: data }))
  toastBus.warning(data.message || `赛事「${data.eventTitle}」状态已变更`)
}

function handleNewRegistration(data) {
  console.log('SSE newRegistration:', data)
  window.dispatchEvent(new CustomEvent('sse:newRegistration', { detail: data }))
  toastBus.success(`用户「${data.userNickname}」报名了赛事「${data.eventTitle}」`)
}

function handleRegistrationResult(data) {
  console.log('SSE registrationResult:', data)
  window.dispatchEvent(new CustomEvent('sse:registrationResult', { detail: data }))
  if (data.approved) {
    toastBus.success(data.message || `您报名「${data.eventTitle}」的申请已通过！`)
  } else {
    toastBus.error(data.message || `您报名「${data.eventTitle}」的申请被拒绝`)
  }
}

function handleBroadcast(data) {
  console.log('SSE broadcast:', data)
  window.dispatchEvent(new CustomEvent('sse:broadcast', { detail: data }))
  toastBus.info(data.content || data.title || '收到一条新通知')
}

watch(user, (newUser) => {
  if (newUser) {
    connectSSE(handleNewMessage, handleNewGroupMessage, handleEventUpdate, handleEventStatusChanged, handleNewRegistration, handleRegistrationResult, handleBroadcast)
  } else {
    disconnectSSE()
  }
}, { immediate: true })

onUnmounted(() => {
  disconnectSSE()
})

provide('connectSSE', () => {
  if (user.value) {
    connectSSE(handleNewMessage, handleNewGroupMessage, handleEventUpdate, handleEventStatusChanged, handleNewRegistration, handleRegistrationResult, handleBroadcast)
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
