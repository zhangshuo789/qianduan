<template>
  <div class="messages-page ui-page">
    <div class="messages-container">
      <header class="messages-header ui-card ui-pop-in">
        <h1 class="messages-title">我的私信</h1>
      </header>

      <section v-if="loading" class="ui-card ui-loading">加载中...</section>

      <section v-else-if="conversations.length === 0" class="ui-card ui-empty">
        暂无私信
      </section>

      <section v-else class="messages-list">
        <router-link
          v-for="conv in conversations"
          :key="conv.userId"
          :to="`/chat/${conv.userId}`"
          class="message-item ui-card"
        >
          <img :src="conv.processedAvatar || defaultAvatar" class="message-avatar" alt="头像" />
          <div class="message-info">
            <div class="message-header">
              <span class="message-nickname">{{ conv.userNickname }}</span>
              <span class="message-time">{{ formatDate(conv.lastMessageTime) }}</span>
            </div>
            <div class="message-preview">
              <span class="message-content">{{ conv.lastMessage }}</span>
              <span v-if="conv.unreadCount > 0" class="message-unread">{{ conv.unreadCount }}</span>
            </div>
          </div>
        </router-link>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { message as messageApi, getAvatarUrl, getUser } from '@/api'

const loading = ref(true)
const conversations = ref([])
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
    console.log('conversations response:', res)
    console.log('conversations data:', res.data)
    conversations.value = res.data?.content || []
    console.log('conversations list:', conversations.value)
    // 处理头像
    for (const conv of conversations.value) {
      console.log('conv:', conv, 'userId:', conv.userId)
      if (conv.userAvatar) {
        conv.processedAvatar = await getAvatarUrl(conv.userAvatar) || defaultAvatar
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
})
</script>

<style scoped>
.messages-page {
  min-height: calc(100vh - 72px);
  padding: var(--space-6);
}

.messages-container {
  max-width: 800px;
  margin: 0 auto;
}

.messages-header {
  padding: var(--space-5);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-4);
}

.messages-title {
  font-size: var(--text-lg);
  font-weight: 700;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.message-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  transition: all var(--transition-fast);
  text-decoration: none;
  color: inherit;
}

.message-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.message-avatar {
  width: 50px;
  height: 50px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

.message-info {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-nickname {
  font-size: var(--text-base);
  font-weight: 600;
}

.message-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.message-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-1);
}

.message-content {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.message-unread {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background-color: #ef4444;
  border-radius: 999px;
  margin-left: var(--space-2);
  flex-shrink: 0;
}
</style>
