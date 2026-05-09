<template>
  <div class="app-shell">
    <NavBar v-if="userLoaded" />
    <main class="app-main">
      <router-view />
    </main>
    <Toast />
  </div>
</template>

<script setup>
import { ref, onUnmounted, provide, watch } from 'vue'
import NavBar from '@/components/NavBar.vue'
import Toast from '@/components/Toast.vue'
import { connectSSE, disconnectSSE, useUser, user as userApi, setAuth } from '@/api'
import { toastBus } from '@/utils/toast'

const user = useUser()
const userLoaded = ref(false)

// 应用启动时获取最新用户信息
async function fetchCurrentUserInfo() {
  const currentUser = user.value
  if (currentUser?.id) {
    try {
      const token = localStorage.getItem('token')
      const res = await userApi.getInfo(currentUser.id)
      if (res.data) {
        setAuth(token, {
          ...res.data,
          isAdmin: currentUser.isAdmin
        })
      }
    } catch (e) {
      console.error('获取用户信息失败', e)
    }
  }
  userLoaded.value = true
}

function handleNewMessage(data) {
  console.log('SSE newMessage event:', data)
  window.dispatchEvent(new CustomEvent('sse:newMessage', { detail: data }))
}

function handleNewGroupMessage(data) {
  window.dispatchEvent(new CustomEvent('sse:newGroupMessage', { detail: data }))
}

function handleBroadcast(data) {
  console.log('SSE broadcast:', data)
  window.dispatchEvent(new CustomEvent('sse:broadcast', { detail: data }))
  toastBus.info(data.content || data.title || '收到一条新通知')
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

watch(user, (newUser) => {
  if (newUser) {
    connectSSE(handleNewMessage, handleNewGroupMessage, handleEventUpdate, handleEventStatusChanged, handleBroadcast)
  } else {
    disconnectSSE()
  }
}, { immediate: true })

// 首次加载时获取最新用户信息
fetchCurrentUserInfo()

onUnmounted(() => {
  disconnectSSE()
})

provide('connectSSE', () => {
  if (user.value) {
    connectSSE(handleNewMessage, handleNewGroupMessage, handleEventUpdate, handleEventStatusChanged, handleBroadcast)
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
