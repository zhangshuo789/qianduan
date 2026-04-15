<template>
  <div class="app-shell">
    <NavBar />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, provide, ref } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { connectSSE, disconnectSSE, getUser, message as messageApi } from '@/api'

const user = ref(getUser())

// 提供 SSE 事件处理
function handleNewMessage(data) {
  // 触发自定义事件，让 Chat 组件处理
  window.dispatchEvent(new CustomEvent('sse:newMessage', { detail: data }))
}

function handleNewGroupMessage(data) {
  // 触发自定义事件，让 GroupChat 组件处理
  window.dispatchEvent(new CustomEvent('sse:newGroupMessage', { detail: data }))
}

onMounted(() => {
  if (user.value) {
    connectSSE(handleNewMessage, handleNewGroupMessage)
  }
})

onUnmounted(() => {
  disconnectSSE()
})

// 当用户登录后，连接 SSE
provide('connectSSE', () => {
  if (user.value) {
    connectSSE(handleNewMessage, handleNewGroupMessage)
  }
})

provide('disconnectSSE', () => {
  disconnectSSE()
})

// 提供更新未读数的方法
provide('refreshUnread', async () => {
  // NavBar 会自动处理
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
