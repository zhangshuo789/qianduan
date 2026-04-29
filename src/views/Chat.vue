<template>
  <div class="chat-page">
    <div class="chat-container">
      <div class="chat-header">
        <router-link to="/messages" class="back-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </router-link>
        <div class="chat-user" v-if="chatUser">
          <div class="user-avatar-wrapper">
            <img :src="chatUser.processedAvatar || defaultAvatar" class="chat-avatar" alt="头像" />
            <div class="online-dot"></div>
          </div>
          <div class="user-info">
            <span class="user-name">{{ chatUser.nickname }}</span>
            <span class="user-status">在线</span>
          </div>
        </div>
        <div class="header-actions">
          <router-link :to="`/user/${chatUserId}`" class="action-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </router-link>
        </div>
      </div>

      <div ref="messagesContainer" class="chat-messages">
        <div v-if="loading" class="loading-state">
          <div class="spinner spinner-lg"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="messages.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3>开始聊天</h3>
          <p>发送第一条消息给 {{ chatUser?.nickname || '对方' }}</p>
        </div>
        <div v-else class="messages-list">
          <template v-for="(group, groupIndex) in groupedMessages" :key="groupIndex">
            <div class="date-divider">
              <span>{{ group.date }}</span>
            </div>
            <div
              v-for="(msg, msgIndex) in group.messages"
              :key="msg.id"
              class="msg-row"
              :class="{
                'msg-self': msg.senderId === currentUserId,
                'msg-first': msgIndex === 0 || msg.isFirstInGroup,
                'msg-continue': msgIndex > 0 && !msg.isFirstInGroup
              }"
            >
              <!-- 头像区域 -->
              <div class="msg-avatar-area">
                <img
                  v-if="msgIndex === 0 || msg.isFirstInGroup"
                  :src="msg.senderId === currentUserId ? (myAvatar || defaultAvatar) : (chatUser.processedAvatar || defaultAvatar)"
                  class="msg-avatar"
                  alt="头像"
                />
              </div>

              <!-- 消息主体 -->
              <div class="msg-main">
                <div class="msg-bubble" :class="{
                  'msg-bubble-first': msgIndex === 0 || msg.isFirstInGroup,
                  'msg-bubble-middle': msgIndex > 0 && !msg.isFirstInGroup && msgIndex < group.messages.length - 1,
                  'msg-bubble-last': msgIndex === group.messages.length - 1,
                  'msg-bubble-single': group.messages.length === 1
                }">
                  <p class="msg-text">{{ msg.content }}</p>
                </div>
                <div class="msg-footer" v-if="msgIndex === group.messages.length - 1 || msg.showTime">
                  <span class="msg-time-bottom">{{ formatTime(msg.createdAt) }}</span>
                  <span v-if="msg.senderId === currentUserId" class="msg-check">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div class="chat-input">
        <div class="input-wrapper">
          <button class="emoji-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </button>
          <input
            v-model="newMessage"
            type="text"
            class="input-field"
            placeholder="输入消息..."
            @keydown.enter="sendMessage"
          />
          <button 
            class="send-btn" 
            :class="{ 'send-btn-active': newMessage.trim() }"
            :disabled="sending || !newMessage.trim()" 
            @click="sendMessage"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message as messageApi, user as userApi, getAvatarUrl, getUser, DEFAULT_AVATAR } from '@/api'
import { toastBus } from '@/utils/toast'

const route = useRoute()
const router = useRouter()
const messages = ref([])
const newMessage = ref('')
const loading = ref(true)
const sending = ref(false)
const messagesContainer = ref(null)
const defaultAvatar = DEFAULT_AVATAR
const currentUserId = ref(null)
const myAvatar = ref('')
const chatUser = ref(null)

const chatUserId = computed(() => route.params.userId)

const groupedMessages = computed(() => {
  if (!messages.value.length) return []
  
  const groups = []
  let currentDate = ''
  let currentGroup = null
  
  messages.value.forEach((msg, index) => {
    const msgDate = formatDate(msg.createdAt)
    
    if (msgDate !== currentDate) {
      if (currentGroup) groups.push(currentGroup)
      currentDate = msgDate
      currentGroup = {
        date: msgDate,
        messages: []
      }
    }
    
    const prevMsg = index > 0 ? messages.value[index - 1] : null
    const timeDiff = prevMsg ? new Date(msg.createdAt) - new Date(prevMsg.createdAt) : Infinity
    const isSameSender = prevMsg && prevMsg.senderId === msg.senderId
    const isFirstInGroup = !isSameSender || timeDiff > 5 * 60 * 1000
    
    const nextMsg = index < messages.value.length - 1 ? messages.value[index + 1] : null
    const nextTimeDiff = nextMsg ? new Date(nextMsg.createdAt) - new Date(msg.createdAt) : Infinity
    const isSameSenderNext = nextMsg && nextMsg.senderId === msg.senderId
    const showTime = !isSameSenderNext || nextTimeDiff > 5 * 60 * 1000
    
    currentGroup.messages.push({
      ...msg,
      isFirstInGroup,
      showTime
    })
  })
  
  if (currentGroup) groups.push(currentGroup)
  
  return groups
})

function isValidUserId(id) {
  return id && id !== 'undefined' && id !== 'null'
}

function formatTime(d) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  
  if (messageDate.getTime() === today.getTime()) {
    return '今天'
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return '昨天'
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
  }
}

async function loadChatUser() {
  if (!isValidUserId(chatUserId.value)) return
  try {
    const res = await userApi.getInfo(chatUserId.value)
    chatUser.value = res.data
    if (chatUser.value.avatar) {
      chatUser.value.processedAvatar = await getAvatarUrl(chatUser.value.avatar) || defaultAvatar
    } else {
      chatUser.value.processedAvatar = defaultAvatar
    }
  } catch (e) {
    console.error('loadChatUser error:', e)
  }
}

async function loadMessages() {
  if (!isValidUserId(chatUserId.value)) return
  loading.value = true
  try {
    const res = await messageApi.getPrivateMessages(chatUserId.value)
    const msgs = res.data?.content || []
    messages.value = msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    await nextTick()
    scrollToBottom()
    try {
      await messageApi.markAsRead(chatUserId.value)
    } catch (e) {
      console.error(e)
    }
  } catch (e) {
    console.error('loadMessages error:', e)
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
    toastBus.error(e.message)
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

function handleNewMessage(event) {
  const data = event.detail
  console.log('SSE newMessage received:', data)
  if (data.senderId == chatUserId.value || data.senderId == currentUserId) {
    messages.value.push(data)
    nextTick(() => scrollToBottom())
    if (data.senderId == chatUserId.value) {
      messageApi.markAsRead(chatUserId.value).catch(console.error)
    }
  }
}

onMounted(() => {
  if (!isValidUserId(chatUserId.value)) return
  const user = getUser()
  currentUserId.value = user?.id
  if (user?.avatar) {
    getAvatarUrl(user.avatar).then(url => {
      myAvatar.value = url || defaultAvatar
    })
  }
  loadChatUser()
  loadMessages()
  window.addEventListener('sse:newMessage', handleNewMessage)
})

watch(() => route.params.userId, (newId) => {
  if (isValidUserId(newId)) {
    messages.value = []
    chatUser.value = null
    loadChatUser()
    loadMessages()
  }
})

onUnmounted(() => {
  window.removeEventListener('sse:newMessage', handleNewMessage)
})

defineExpose({ handleNewMessage })
</script>

<style scoped>
.chat-page {
  min-height: calc(100vh - 72px);
  background: var(--color-bg-soft);
}

.chat-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 72px);
}

.chat-header {
  background: var(--color-card);
  padding: var(--space-md) var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background: var(--color-bg-soft);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.back-btn:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  text-decoration: none;
}

.chat-user {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex: 1;
}

.user-avatar-wrapper {
  position: relative;
}

.chat-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--color-border-light);
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: var(--color-success);
  border: 2px solid var(--color-card);
  border-radius: var(--radius-full);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
}

.user-status {
  font-size: var(--text-xs);
  color: var(--color-success);
}

.header-actions {
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background: var(--color-bg-soft);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.action-btn:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  text-decoration: none;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--color-text-muted);
}

.empty-icon {
  margin-bottom: var(--space-md);
  opacity: 0.5;
}

.empty-state h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--space-2);
}

.empty-state p {
  font-size: var(--text-sm);
  margin: 0;
}

/* ========== 消息列表（私信 & 群聊统一风格）========== */
.messages-list {
  display: flex;
  flex-direction: column;
}

.date-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: var(--space-lg) 0 var(--space-md);
}

.date-divider:first-child {
  margin-top: 0;
}

.date-divider span {
  padding: var(--space-1) var(--space-3);
  background: var(--color-card);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  box-shadow: var(--shadow-xs);
}

/* 消息行 */
.msg-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: 0 var(--space-2);
}

.msg-row.msg-first {
  margin-top: var(--space-3);
}

.msg-row.msg-continue {
  margin-top: 2px;
}

/* 自己的消息靠右 */
.msg-row.msg-self {
  flex-direction: row-reverse;
}

/* 头像区域 */
.msg-avatar-area {
  flex-shrink: 0;
  width: 36px;
  padding-top: 2px;
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--color-border-light);
  display: block;
}

.msg-self .msg-avatar {
  border-color: var(--color-primary-light);
}

/* 消息主体 */
.msg-main {
  max-width: 70%;
  min-width: 0;
}

.msg-self .msg-main {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* 消息气泡 */
.msg-bubble {
  padding: var(--space-2) var(--space-3);
  background: var(--color-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
  word-wrap: break-word;
  overflow-wrap: break-word;
  display: inline-block;
  max-width: 100%;
}

/* 自己的气泡 */
.msg-self .msg-bubble {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

/* 连续消息气泡圆角 */
.msg-bubble-first {
  border-bottom-left-radius: var(--radius-sm);
}

.msg-self .msg-bubble-first {
  border-bottom-left-radius: var(--radius-xl);
  border-bottom-right-radius: var(--radius-sm);
}

.msg-bubble-middle {
  border-radius: var(--radius-sm);
}

.msg-bubble-last {
  border-top-left-radius: var(--radius-sm);
  border-top-right-radius: var(--radius-xl);
  border-bottom-left-radius: var(--radius-xl);
  border-bottom-right-radius: var(--radius-xl);
}

.msg-self .msg-bubble-last {
  border-top-left-radius: var(--radius-xl);
  border-top-right-radius: var(--radius-sm);
  border-bottom-left-radius: var(--radius-xl);
  border-bottom-right-radius: var(--radius-xl);
}

/* 消息文本 */
.msg-text {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
}

.msg-self .msg-text {
  color: #fff;
}

/* 消息底部时间 */
.msg-footer {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: 2px;
  padding: 0 var(--space-1);
}

.msg-time-bottom {
  font-size: 11px;
  color: var(--color-text-muted);
}

.msg-check {
  color: var(--color-primary);
  display: flex;
  align-items: center;
}

.chat-input {
  background: var(--color-card);
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-bg-soft);
  border-radius: var(--radius-2xl);
  padding: var(--space-2);
}

.emoji-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.emoji-btn:hover {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.input-field {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text);
}

.input-field:focus {
  outline: none;
}

.input-field::placeholder {
  color: var(--color-text-muted);
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  background: var(--color-bg-soft);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.send-btn-active {
  background: var(--color-primary);
  color: white;
}

.send-btn-active:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-primary);
}

.send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (max-width: 640px) {
  .chat-header {
    padding: var(--space-md);
  }

  .chat-messages {
    padding: var(--space-md);
  }

  .chat-input {
    padding: var(--space-md);
  }

  .msg-main {
    max-width: 80%;
  }

  .msg-avatar {
    width: 30px;
    height: 30px;
  }

  .msg-avatar-area {
    width: 30px;
  }
}
</style>
