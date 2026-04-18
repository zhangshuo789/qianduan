<template>
  <div class="group-chat-page ui-page">
    <div class="group-chat-container">
      <header class="group-chat-header ui-card ui-pop-in">
        <router-link to="/groups" class="group-chat-back">
          <span class="group-chat-back-icon">&lt;</span>
          返回
        </router-link>
        <div class="group-chat-info" v-if="groupInfo">
          <div class="group-chat-icon">{{ groupInfo.name?.charAt(0) || '群' }}</div>
          <div class="group-chat-meta">
            <h1 class="group-chat-name">{{ groupInfo.name }}</h1>
            <span class="group-chat-member-count">{{ members.length }} 位成员</span>
          </div>
        </div>
        <button v-if="isOwner" class="ui-button ui-button-secondary" @click="showMembersModal = true">管理成员</button>
      </header>

      <section ref="messagesContainer" class="group-chat-messages ui-card">
        <div v-if="loading" class="ui-loading">加载中...</div>
        <div v-else-if="messages.length === 0" class="ui-empty">暂无消息</div>
        <div v-else class="chat-message-list">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="chat-message"
            :class="{ 'chat-message-self': msg.senderId === currentUserId }"
          >
            <img :src="msg.processedAvatar || defaultAvatar" class="chat-message-avatar" alt="头像" />
            <div class="chat-message-bubble">
              <div class="chat-message-sender">{{ msg.senderNickname }}</div>
              <p class="chat-message-content">{{ msg.content }}</p>
              <span class="chat-message-time">{{ formatTime(msg.createdAt) }}</span>
            </div>
          </div>
        </div>
      </section>

      <footer class="group-chat-input-area ui-card ui-float-enter">
        <div class="chat-input-wrapper">
          <input
            v-model="newMessage"
            type="text"
            class="chat-input"
            placeholder="输入群消息..."
            @keydown.enter="sendMessage"
          />
          <button class="ui-button ui-button-primary" :disabled="sending || !newMessage.trim()" @click="sendMessage">
            {{ sending ? '发送中...' : '发送' }}
          </button>
        </div>
      </footer>

      <!-- 成员管理弹窗 -->
      <div v-if="showMembersModal" class="modal-overlay" @click.self="showMembersModal = false">
        <div class="modal-content ui-card ui-pop-in">
          <h2 class="modal-title">群成员管理</h2>
          <div class="members-list">
            <div v-for="m in members" :key="m.id" class="member-item">
              <img :src="m.processedAvatar || defaultAvatar" class="member-avatar" alt="头像" />
              <span class="member-name">{{ m.nickname }}</span>
              <span v-if="m.role === 'OWNER'" class="member-role">群主</span>
              <span v-else-if="m.role === 'ADMIN'" class="member-role">管理员</span>
              <button
                v-if="isOwner && m.id !== currentUserId"
                class="ui-button ui-button-secondary"
                @click="removeMember(m.id)"
              >
                移除
              </button>
            </div>
          </div>
          <div class="modal-actions">
            <button class="ui-button ui-button-primary" @click="showMembersModal = false">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { group as groupApi, getAvatarUrl, getUser } from '@/api'
import { toastBus } from '@/utils/toast'

const route = useRoute()
const router = useRouter()
const messages = ref([])
const newMessage = ref('')
const loading = ref(true)
const sending = ref(false)
const messagesContainer = ref(null)
const defaultAvatar = 'https://via.placeholder.com/36'
const currentUserId = ref(null)
const groupInfo = ref(null)
const members = ref([])
const showMembersModal = ref(false)

const groupId = computed(() => route.params.id)
const isOwner = computed(() => {
  const owner = members.value.find(m => m.role === 'OWNER')
  return owner?.id === currentUserId.value
})

function formatTime(d) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

async function loadGroupInfo() {
  try {
    const res = await groupApi.getInfo(groupId.value)
    groupInfo.value = res.data
  } catch (e) {
    console.error(e)
  }
}

async function loadMembers() {
  try {
    const res = await groupApi.getMembers(groupId.value)
    members.value = res.data || []
    for (const m of members.value) {
      if (m.avatar) {
        m.processedAvatar = await getAvatarUrl(m.avatar) || defaultAvatar
      } else {
        m.processedAvatar = defaultAvatar
      }
    }
  } catch (e) {
    console.error(e)
  }
}

async function loadMessages() {
  loading.value = true
  try {
    const res = await groupApi.getMessages(groupId.value)
    messages.value = res.data?.content || []
    for (const msg of messages.value) {
      if (msg.senderAvatar) {
        msg.processedAvatar = await getAvatarUrl(msg.senderAvatar) || defaultAvatar
      } else {
        msg.processedAvatar = defaultAvatar
      }
    }
    await nextTick()
    scrollToBottom()
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
    const res = await groupApi.sendMessage(groupId.value, content)
    const msg = res.data
    if (msg.senderAvatar) {
      msg.processedAvatar = await getAvatarUrl(msg.senderAvatar) || defaultAvatar
    } else {
      msg.processedAvatar = defaultAvatar
    }
    messages.value.push(msg)
    await nextTick()
    scrollToBottom()
  } catch (e) {
    toastBus.error(e.message)
    newMessage.value = content
  } finally {
    sending.value = false
  }
}

async function removeMember(userId) {
  try {
    await groupApi.removeMember(groupId.value, userId)
    members.value = members.value.filter(m => m.id !== userId)
  } catch (e) {
    toastBus.error(e.message)
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function handleNewGroupMessage(data) {
  messages.value.push(data)
  nextTick(() => scrollToBottom())
}

onMounted(() => {
  const user = getUser()
  currentUserId.value = user?.id
  loadGroupInfo()
  loadMembers()
  loadMessages()
  window.addEventListener('sse:newGroupMessage', handleNewGroupMessage)
})

onUnmounted(() => {
  window.removeEventListener('sse:newGroupMessage', handleNewGroupMessage)
})

defineExpose({ handleNewGroupMessage })
</script>

<style scoped>
.group-chat-page {
  min-height: calc(100vh - 72px);
  padding: var(--space-6);
}

.group-chat-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 72px - var(--space-6) * 2 - 60px);
}

.group-chat-header {
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.group-chat-back {
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

.group-chat-back:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-soft);
}

.group-chat-back-icon {
  font-size: var(--text-lg);
}

.group-chat-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.group-chat-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background-color: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
  font-weight: 700;
}

.group-chat-meta {
  display: flex;
  flex-direction: column;
}

.group-chat-name {
  font-size: var(--text-base);
  font-weight: 700;
}

.group-chat-member-count {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.group-chat-messages {
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

.chat-message-sender {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: var(--space-1);
}

.chat-message-self .chat-message-sender {
  color: rgba(255, 255, 255, 0.8);
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

.group-chat-input-area {
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

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  padding: var(--space-5);
  border-radius: var(--radius-xl);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: 700;
  margin-bottom: var(--space-4);
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.member-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
  border-radius: var(--radius-md);
}

.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.member-name {
  flex: 1;
  font-size: var(--text-sm);
  font-weight: 500;
}

.member-role {
  font-size: var(--text-xs);
  color: var(--color-primary);
  background-color: var(--color-primary-soft);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
