<template>
  <div class="messages-page">
    <div class="messages-container">
      <div class="messages-header">
        <div class="header-content">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="header-info">
            <h1 class="header-title">私信</h1>
            <p class="header-subtitle">{{ conversations.length }} 个对话</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-btn" @click="loadConversations">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner spinner-lg"></div>
        <span>加载中...</span>
      </div>

      <div v-else-if="conversations.length === 0 && notifications.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h3>暂无私信</h3>
        <p>开始与其他用户交流吧</p>
      </div>

      <div v-else class="conversations-list">
        <!-- 通知列表 -->
        <router-link
          v-for="(notif, index) in notifications"
          :key="notif.id"
          to="/events"
          class="conversation-item notification-item animate-fade-in-up"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <div class="avatar-wrapper">
            <div class="notification-avatar">{{ notif.eventData?.approved !== undefined ? (notif.eventData.approved ? '✅' : '❌') : notif.eventData?.newStatus ? '🔔' : '📢' }}</div>
          </div>
          <div class="conversation-info">
            <div class="conversation-header">
              <span class="conversation-name notification-name">{{ notif.oderNickname }}</span>
              <span class="conversation-time">{{ formatDate(notif.lastMessageTime) }}</span>
            </div>
            <div class="conversation-preview">
              <span class="preview-text">{{ notif.lastMessage }}</span>
              <span v-if="notif.unreadCount > 0" class="unread-badge">
                {{ notif.unreadCount > 99 ? '99+' : notif.unreadCount }}
              </span>
            </div>
          </div>
        </router-link>

        <!-- 私信列表 -->
        <router-link
          v-for="(conv, index) in conversations"
          :key="conv.oderId"
          :to="`/chat/${conv.oderId}`"
          class="conversation-item animate-fade-in-up"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <div class="avatar-wrapper">
            <img :src="conv.processedAvatar || defaultAvatar" class="conversation-avatar" alt="头像" />
            <div v-if="conv.online" class="online-indicator"></div>
          </div>
          <div class="conversation-info">
            <div class="conversation-header">
              <span class="conversation-name">{{ conv.oderNickname }}</span>
              <span class="conversation-time">{{ formatDate(conv.lastMessageTime) }}</span>
            </div>
            <div class="conversation-preview">
              <span class="preview-text">{{ conv.lastMessage }}</span>
              <span v-if="conv.unreadCount > 0" class="unread-badge">
                {{ conv.unreadCount > 99 ? '99+' : conv.unreadCount }}
              </span>
            </div>
          </div>
          <div class="conversation-arrow">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { message as messageApi, getAvatarUrl, getUser } from '@/api'

const loading = ref(true)
const conversations = ref([])
const notifications = ref([])
const defaultAvatar = 'https://via.placeholder.com/50'
const user = getUser()

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const diff = now - date
  const oneDay = 24 * 60 * 60 * 1000

  if (diff < oneDay) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (diff < 7 * oneDay) {
    const days = Math.floor(diff / oneDay)
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

async function loadConversations() {
  loading.value = true
  try {
    const res = await messageApi.getConversations()
    conversations.value = res.data?.content || []
    for (const conv of conversations.value) {
      if (conv.oderAvatar) {
        conv.processedAvatar = await getAvatarUrl(conv.oderAvatar) || defaultAvatar
      } else {
        conv.processedAvatar = defaultAvatar
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadConversations()
  window.addEventListener('sse:newMessage', handleNewMessage)
  window.addEventListener('sse:eventUpdate', handleEventNotification)
  window.addEventListener('sse:eventStatusChanged', handleEventNotification)
  window.addEventListener('sse:newRegistration', handleEventNotification)
  window.addEventListener('sse:registrationResult', handleEventNotification)
})

onUnmounted(() => {
  window.removeEventListener('sse:newMessage', handleNewMessage)
  window.removeEventListener('sse:eventUpdate', handleEventNotification)
  window.removeEventListener('sse:eventStatusChanged', handleEventNotification)
  window.removeEventListener('sse:newRegistration', handleEventNotification)
  window.removeEventListener('sse:registrationResult', handleEventNotification)
})

function handleNewMessage(event) {
  const data = event.detail
  console.log('Messages SSE newMessage:', data)
  // 找到对应的会话，更新最新消息和未读数
  const conv = conversations.value.find(c => c.oderId === data.senderId)
  if (conv) {
    conv.lastMessage = data.content
    conv.lastMessageTime = data.createdAt
    if (data.senderId !== data.targetId) {
      conv.unreadCount = (conv.unreadCount || 0) + 1
    }
  }
  // 将最新消息的会话移到顶部
  conversations.value.sort((a, b) => {
    return new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
  })
}

function handleEventNotification(event) {
  const data = event.detail
  const typeMap = {
    'eventUpdate': { icon: '📢', text: '赛事更新' },
    'eventStatusChanged': { icon: '🔔', text: '状态变更' },
    'newRegistration': { icon: '📝', text: '新报名' },
    'registrationResult': { icon: data?.approved ? '✅' : '❌', text: data?.approved ? '报名通过' : '报名被拒' }
  }
  const typeInfo = typeMap[event.type.replace('sse:', '')] || { icon: '📢', text: '通知' }

  const notification = {
    id: `notif-${Date.now()}`,
    oderId: 'system-notification',
    oderNickname: typeInfo.text,
    lastMessage: data.message || data.eventTitle || '收到一条赛事通知',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 1,
    processedAvatar: null,
    isNotification: true,
    eventData: data
  }

  notifications.value.unshift(notification)
}
</script>
</script>

<style scoped>
.messages-page {
  min-height: calc(100vh - 72px);
  background: var(--color-bg-soft);
}

.messages-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.messages-header {
  background: var(--color-card);
  border-radius: var(--radius-2xl);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.header-icon {
  width: 56px;
  height: 56px;
  background: var(--color-primary-gradient);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.header-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-card);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  background: var(--color-card);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
}

.loading-state span {
  margin-top: var(--space-md);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  background: var(--color-card);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  text-align: center;
}

.empty-icon {
  color: var(--color-text-muted);
  margin-bottom: var(--space-lg);
}

.empty-state h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--space-2);
}

.empty-state p {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.conversations-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-card);
  border-radius: var(--radius-xl);
  text-decoration: none;
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.conversation-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-light);
  text-decoration: none;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.conversation-avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--color-border-light);
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: var(--color-success);
  border: 2px solid var(--color-card);
  border-radius: var(--radius-full);
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-1);
}

.conversation-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
}

.conversation-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.conversation-preview {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.preview-text {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.unread-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 var(--space-2);
  font-size: var(--text-xs);
  font-weight: 600;
  color: white;
  background: var(--color-error);
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.conversation-arrow {
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.conversation-item:hover .conversation-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}

.notification-item {
  border-left: 3px solid var(--color-primary);
}

.notification-avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--color-bg-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  border: 2px solid var(--color-border-light);
}

.notification-name {
  color: var(--color-primary);
}

@media (max-width: 640px) {
  .messages-container {
    padding: var(--space-md);
  }

  .messages-header {
    padding: var(--space-md);
  }

  .header-icon {
    width: 48px;
    height: 48px;
  }

  .conversation-avatar {
    width: 48px;
    height: 48px;
  }
}
</style>
