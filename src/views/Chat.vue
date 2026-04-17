<template>
  <div class="chat-page ui-page">
    <div class="chat-container">
      <header class="chat-header ui-card ui-pop-in">
        <router-link to="/messages" class="chat-back">
          <span class="chat-back-icon">&lt;</span>
          返回
        </router-link>
        <div class="chat-user-info" v-if="chatUser">
          <img :src="chatUser.processedAvatar || defaultAvatar" class="chat-user-avatar" alt="头像" />
          <span class="chat-user-name">{{ chatUser.nickname }}</span>
        </div>
      </header>

      <section ref="messagesContainer" class="chat-messages ui-card">
        <div v-if="loading" class="ui-loading">加载中...</div>
        <div v-else-if="messages.length === 0" class="ui-empty">暂无消息，开始聊天吧</div>
        <div v-else class="chat-message-list">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="chat-message"
            :class="{ 'chat-message-self': msg.senderId === currentUserId }"
          >
            <img v-if="msg.senderId !== currentUserId" :src="chatUser.processedAvatar || defaultAvatar" class="chat-message-avatar" alt="头像" />
            <div class="chat-message-bubble">
              <p class="chat-message-content">{{ msg.content }}</p>
              <span class="chat-message-time">{{ formatTime(msg.createdAt) }}</span>
            </div>
          </div>
        </div>
      </section>

      <footer class="chat-input-area ui-card ui-float-enter">
        <div class="chat-input-wrapper">
          <input
            v-model="newMessage"
            type="text"
            class="chat-input"
            placeholder="输入消息..."
            @keydown.enter="sendMessage"
          />
          <button class="ui-button ui-button-primary" :disabled="sending || !newMessage.trim()" @click="sendMessage">
            {{ sending ? '发送中...' : '发送' }}
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message as messageApi, user as userApi, getAvatarUrl, getUser } from '@/api'

const route = useRoute()
const router = useRouter()
const messages = ref([])
const newMessage = ref('')
const loading = ref(true)
const sending = ref(false)
const messagesContainer = ref(null)
const defaultAvatar = 'https://via.placeholder.com/36'
const currentUserId = ref(null)
const chatUser = ref(null)

const chatUserId = computed(() => route.params.userId)

function formatTime(d) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

async function loadChatUser() {
  try {
    const res = await userApi.getInfo(chatUserId.value)
    chatUser.value = res.data
    if (chatUser.value.avatar) {
      chatUser.value.processedAvatar = await getAvatarUrl(chatUser.value.avatar) || defaultAvatar
    } else {
      chatUser.value.processedAvatar = defaultAvatar
    }
  } catch (e) {
    console.error(e)
  }
}

async function loadMessages() {
  loading.value = true
  try {
    const res = await messageApi.getPrivateMessages(chatUserId.value)
    messages.value = res.data?.content || []
    // 滚动到底部
    await nextTick()
    scrollToBottom()
    // 标记已读
    try {
      await messageApi.markAsRead(chatUserId.value)
    } catch (e) {
      console.error(e)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || sending.value) return
  sending.value = true
  const content = newMessage.value.trim()
  newMessage.value = ''

  try {
    const res = await messageApi.sendPrivateMessage(chatUserId.value, content)
    messages.value.push(res.data)
    await nextTick()
    scrollToBottom()
  } catch (e) {
    alert(e.message)
    newMessage.value = content
  } finally {
    sending.value = false
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function handleNewMessage(data) {
  if (data.senderId == chatUserId.value || data.senderId == currentUserId) {
    messages.value.push(data)
    nextTick(() => scrollToBottom())
    if (data.senderId == chatUserId.value) {
      messageApi.markAsRead(chatUserId.value).catch(console.error)
    }
  }
}

onMounted(() => {
  if (!chatUserId.value) return
  const user = getUser()
  currentUserId.value = user?.id
  loadChatUser()
  loadMessages()
  window.addEventListener('sse:newMessage', handleNewMessage)
})

onUnmounted(() => {
  window.removeEventListener('sse:newMessage', handleNewMessage)
})

defineExpose({ handleNewMessage })
</script>

<style scoped>
.chat-page {
  min-height: calc(100vh - 72px);
  padding: var(--space-6);
}

.chat-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 72px - var(--space-6) * 2 - 60px);
}

.chat-header {
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.chat-back {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  text-decoration: none;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.chat-back:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-soft);
}

.chat-back-icon {
  font-size: var(--text-lg);
}

.chat-user-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.chat-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.chat-user-name {
  font-weight: 600;
  font-size: var(--text-base);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-3);
}

.chat-message-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.chat-message {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
}

.chat-message-self {
  flex-direction: row-reverse;
}

.chat-message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

.chat-message-bubble {
  max-width: 70%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-soft);
}

.chat-message-self .chat-message-bubble {
  background-color: var(--color-primary);
  color: #fff;
}

.chat-message-content {
  font-size: var(--text-sm);
  word-break: break-word;
}

.chat-message-time {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.chat-message-self .chat-message-time {
  color: rgba(255, 255, 255, 0.7);
}

.chat-input-area {
  padding: var(--space-3);
  border-radius: var(--radius-xl);
}

.chat-input-wrapper {
  display: flex;
  gap: var(--space-3);
}

.chat-input {
  flex: 1;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
}

.chat-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.14);
}
</style>
