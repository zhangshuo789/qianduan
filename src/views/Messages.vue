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
            <h1 class="header-title">消息中心</h1>
            <p class="header-subtitle">
              {{ validNotifications.length }} 条通知 · {{ conversations.length }} 个私聊 · {{ groups.length }} 个群聊
            </p>
          </div>
        </div>
        <div class="header-actions">
          <button class="action-btn create-group-btn" @click="showCreateGroupModal = true" title="创建群聊">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>创建群聊</span>
          </button>
          <button class="action-btn" @click="handleRefresh" title="刷新">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
          <button v-if="validNotifications.length > 0" class="action-btn" @click="markAllRead" title="全部已读">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner spinner-lg"></div>
        <span>加载中...</span>
      </div>

      <div v-else-if="validNotifications.length === 0 && conversations.length === 0 && groups.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <h3>暂无消息</h3>
        <p>开始与其他用户交流吧</p>
      </div>

      <div v-else class="conversations-list">
        <!-- 通知列表 -->
        <div v-if="validNotifications.length > 0" class="section-divider">
          <span class="section-label">通知</span>
        </div>

        <div
          v-for="notif in validNotifications"
          :key="notif.id"
          class="conversation-item notification-item animate-fade-in-up"
          :class="[`notif-type-${notif.type}`]"
          @click="handleNotificationClick(notif)"
        >
          <div class="avatar-wrapper">
            <div class="notification-avatar" :class="`avatar-type-${notif.type}`">
              <span v-if="notif.type === 'broadcast'">📢</span>
              <span v-else-if="notif.type === 'event'">🏆</span>
              <span v-else-if="notif.type === 'registration'">📝</span>
              <span v-else-if="notif.type === 'system'">⚙️</span>
              <span v-else>📢</span>
            </div>
          </div>
          <div class="conversation-info">
            <div class="conversation-header">
              <span class="conversation-name notification-name">{{ notif.title || '系统通知' }}</span>
              <span class="conversation-time">{{ formatDate(notif.createdAt || notif.sentAt) }}</span>
            </div>
            <div class="conversation-preview">
              <span class="preview-text">{{ notif.content || notif.message }}</span>
            </div>
          </div>
          <div class="conversation-arrow">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>

        <!-- 群聊列表 -->
        <div v-if="groups.length > 0" class="section-divider">
          <span class="section-label">群聊</span>
        </div>

        <router-link
          v-for="group in groups"
          :key="group.id"
          :to="`/group/${group.id}`"
          class="conversation-item group-item animate-fade-in-up"
        >
          <div class="avatar-wrapper">
            <div class="group-avatar">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
          <div class="conversation-info">
            <div class="conversation-header">
              <span class="conversation-name">{{ group.name }}</span>
              <span class="conversation-time">{{ formatDate(group.lastMessageTime) }}</span>
            </div>
            <div class="conversation-preview">
              <span class="preview-text">{{ group.lastMessage || '暂无消息' }}</span>
              <span class="member-count">{{ group.memberCount }}人</span>
            </div>
          </div>
          <div class="conversation-arrow">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </router-link>

        <!-- 私信列表 -->
        <div v-if="conversations.length > 0" class="section-divider">
          <span class="section-label">私信</span>
        </div>

        <router-link
          v-for="conv in conversations"
          :key="conv.oderId"
          :to="`/chat/${conv.oderId}`"
          class="conversation-item animate-fade-in-up"
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

    <!-- 创建群聊弹窗 -->
    <div class="modal-overlay" v-if="showCreateGroupModal" @click.self="showCreateGroupModal = false">
      <div class="modal create-group-modal">
        <div class="modal-header">
          <div class="modal-header-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="modal-header-content">
            <h3>创建群聊</h3>
            <p class="modal-header-desc">与粉丝一起创建专属群聊</p>
          </div>
          <button class="modal-close" @click="showCreateGroupModal = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-section">
            <div class="form-group">
              <label class="form-label">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                群名称 <span class="required">*</span>
              </label>
              <input v-model="groupForm.name" type="text" placeholder="请输入群名称" maxlength="20" class="form-input" />
              <span class="char-count">{{ groupForm.name.length }}/20</span>
            </div>
            <div class="form-group">
              <label class="form-label">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="17" y1="10" x2="3" y2="10"/>
                  <line x1="21" y1="6" x2="3" y2="6"/>
                  <line x1="21" y1="14" x2="3" y2="14"/>
                  <line x1="17" y1="18" x2="3" y2="18"/>
                </svg>
                群描述
              </label>
              <textarea v-model="groupForm.description" placeholder="请输入群描述（可选）" rows="3" maxlength="100" class="form-textarea"></textarea>
              <span class="char-count">{{ groupForm.description.length }}/100</span>
            </div>
          </div>
          <div class="form-section">
            <div class="section-header">
              <label class="form-label">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                选择成员
              </label>
              <span class="hint-badge">仅限粉丝</span>
            </div>
            <div v-if="loadingFollowers" class="loading-members">
              <div class="spinner spinner-sm"></div>
              <span>加载粉丝列表...</span>
            </div>
            <div v-else-if="followers.length === 0" class="empty-followers">
              <div class="empty-icon">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </div>
              <p>暂无粉丝</p>
              <p class="hint">需要先有粉丝才能创建群聊</p>
            </div>
            <div v-else class="member-select-list">
              <label v-for="f in followers" :key="f.id" class="member-select-item">
                <input type="checkbox" :value="f.id" v-model="groupForm.memberIds" class="member-checkbox" />
                <img :src="f.processedAvatar || defaultAvatar" class="member-avatar" alt="头像" />
                <div class="member-info">
                  <span class="member-name">{{ f.nickname }}</span>
                </div>
                <div class="check-icon" :class="{ 'checked': groupForm.memberIds.includes(f.id) }">
                  <svg v-if="groupForm.memberIds.includes(f.id)" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </label>
            </div>
            <div class="selected-summary">
              <span class="selected-label">已选择</span>
              <span class="selected-count">{{ groupForm.memberIds.length }}</span>
              <span class="selected-unit">人</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateGroupModal = false">取消</button>
          <button class="btn btn-primary" @click="createGroup" :disabled="creatingGroup || !groupForm.name">
            <svg v-if="!creatingGroup" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {{ creatingGroup ? '创建中...' : '创建群聊' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message as messageApi, admin, group as groupApi, follow as followApi, getAvatarUrl, getUser, DEFAULT_AVATAR } from '@/api'
import { toastBus } from '@/utils/toast'

const router = useRouter()
const loading = ref(true)
const conversations = ref([])
const notifications = ref([])
const groups = ref([])
const defaultAvatar = DEFAULT_AVATAR
const user = getUser()

const showCreateGroupModal = ref(false)
const groupForm = ref({ name: '', description: '', memberIds: [] })
const followers = ref([])
const loadingFollowers = ref(false)
const creatingGroup = ref(false)

const validNotifications = computed(() => {
  if (!Array.isArray(notifications.value)) return []
  return notifications.value.filter(n => {
    if (!n) return false
    const hasTitle = n.title && n.title.trim()
    const hasContent = n.content && n.content.trim() || n.message && n.message.trim()
    return hasTitle || hasContent
  })
})

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
    console.error('加载私信列表失败:', e)
  }
}

async function loadNotifications() {
  try {
    const res = await admin.getNotificationList()
    let list = res.data
    if (!list) {
      notifications.value = []
      return
    }
    if (!Array.isArray(list)) {
      if (list.content && Array.isArray(list.content)) {
        list = list.content
      } else {
        notifications.value = []
        return
      }
    }
    notifications.value = list.filter(n => {
      if (!n) return false
      const hasTitle = n.title && n.title.trim()
      const hasContent = (n.content && n.content.trim()) || (n.message && n.message.trim())
      return hasTitle || hasContent
    })
  } catch (e) {
    console.error('加载通知列表失败:', e)
    notifications.value = []
  }
}

async function loadGroups() {
  try {
    const res = await groupApi.getMyGroups()
    groups.value = res.data?.content || res.data || []
  } catch (e) {
    console.error('加载群聊列表失败:', e)
    groups.value = []
  }
}

async function loadFollowers() {
  if (!user) return
  loadingFollowers.value = true
  try {
    const res = await followApi.getFollowers(user.id, 0, 50)
    const list = res.data?.content || []
    for (const f of list) {
      if (f.avatar) {
        f.processedAvatar = await getAvatarUrl(f.avatar) || defaultAvatar
      } else {
        f.processedAvatar = defaultAvatar
      }
    }
    followers.value = list
  } catch (e) {
    console.error('加载粉丝列表失败:', e)
    followers.value = []
  } finally {
    loadingFollowers.value = false
  }
}

async function createGroup() {
  if (!groupForm.value.name) {
    toastBus.warning('请输入群名称')
    return
  }
  creatingGroup.value = true
  try {
    const res = await groupApi.create({
      name: groupForm.value.name,
      description: groupForm.value.description,
      memberIds: groupForm.value.memberIds
    })
    toastBus.success('创建成功')
    showCreateGroupModal.value = false
    groupForm.value = { name: '', description: '', memberIds: [] }
    await loadGroups()
    if (res.data?.id) {
      router.push(`/group/${res.data.id}`)
    }
  } catch (e) {
    toastBus.error(e.message || '创建失败')
  } finally {
    creatingGroup.value = false
  }
}

async function handleRefresh() {
  loading.value = true
  await Promise.all([loadConversations(), loadNotifications(), loadGroups()])
  loading.value = false
  toastBus.success('刷新成功')
}

function getNotificationId(notif) {
  return notif?.id || notif?.eventId
}

async function handleNotificationClick(notif) {
  const id = getNotificationId(notif)

  if (!id) {
    notifications.value = notifications.value.filter(n => n !== notif)
    return
  }

  try {
    await admin.markNotificationRead(id)
    notifications.value = notifications.value.filter(n => getNotificationId(n) !== id)
    toastBus.success('已标记为已读')
  } catch (e) {
    console.error('标记已读失败:', e)
    notifications.value = notifications.value.filter(n => getNotificationId(n) !== id)
  }
}

async function markAllRead() {
  const ids = validNotifications.value.map(n => getNotificationId(n)).filter(Boolean)
  if (ids.length === 0) return

  try {
    await Promise.all(ids.map(id => admin.markNotificationRead(id)))
    notifications.value = []
    toastBus.success('已全部标记为已读')
  } catch (e) {
    console.error('批量标记已读失败:', e)
    toastBus.error('操作失败')
  }
}

function handleNewMessage(event) {
  const data = event.detail
  if (!data) return

  const conv = conversations.value.find(c => c.oderId === data.senderId)
  if (conv) {
    conv.lastMessage = data.content
    conv.lastMessageTime = data.createdAt
    if (data.senderId !== data.targetId) {
      conv.unreadCount = (conv.unreadCount || 0) + 1
    }
  }
  conversations.value.sort((a, b) => {
    return new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
  })
}

function addNotification(data, type = 'broadcast') {
  if (!data) return

  const hasTitle = data.title && data.title.trim()
  const hasContent = (data.content && data.content.trim()) || (data.message && data.message.trim())
  
  if (!hasTitle && !hasContent) {
    console.log('无效通知，忽略:', data)
    return
  }

  const id = data.id || data.eventId || `${type}-${Date.now()}`

  if (notifications.value.find(n => (n.id || n.eventId) === id)) {
    console.log('通知已存在，忽略')
    return
  }

  notifications.value.unshift({
    id: id,
    eventId: data.eventId,
    title: data.title,
    content: data.content || data.message,
    type: type,
    createdAt: data.sentAt || data.createdAt || new Date().toISOString(),
    read: false
  })
}

function handleBroadcastNotification(event) {
  addNotification(event.detail, 'broadcast')
}

function handleEventNotification(event) {
  const data = event.detail
  if (!data) return

  let type = 'event'
  if (event.type === 'sse:newRegistration') type = 'registration'
  if (event.type === 'sse:registrationResult') type = 'registration'

  addNotification(data, type)
}

watch(showCreateGroupModal, (val) => {
  if (val && followers.value.length === 0) {
    loadFollowers()
  }
})

onMounted(() => {
  Promise.all([loadConversations(), loadNotifications(), loadGroups()]).finally(() => {
    loading.value = false
  })

  window.addEventListener('sse:newMessage', handleNewMessage)
  window.addEventListener('sse:eventUpdate', handleEventNotification)
  window.addEventListener('sse:eventStatusChanged', handleEventNotification)
  window.addEventListener('sse:newRegistration', handleEventNotification)
  window.addEventListener('sse:registrationResult', handleEventNotification)
  window.addEventListener('sse:broadcast', handleBroadcastNotification)
})

onUnmounted(() => {
  window.removeEventListener('sse:newMessage', handleNewMessage)
  window.removeEventListener('sse:eventUpdate', handleEventNotification)
  window.removeEventListener('sse:eventStatusChanged', handleEventNotification)
  window.removeEventListener('sse:newRegistration', handleEventNotification)
  window.removeEventListener('sse:registrationResult', handleEventNotification)
  window.removeEventListener('sse:broadcast', handleBroadcastNotification)
})
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
  background: var(--color-primary);
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
  color: var(--color-text-muted);
  gap: var(--space-md);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  text-align: center;
}

.empty-icon {
  width: 120px;
  height: 120px;
  background: var(--color-bg-soft);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-lg);
  color: var(--color-text-muted);
}

.empty-state h3 {
  font-size: var(--text-lg);
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
  gap: var(--space-sm);
}

.section-divider {
  display: flex;
  align-items: center;
  padding: var(--space-md) 0 var(--space-sm);
}

.section-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--color-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.conversation-item:hover {
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.conversation-avatar {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--color-border-light);
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #22c55e;
  border-radius: 50%;
  border: 2px solid var(--color-card);
}

.notification-avatar {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-full);
  background: var(--color-bg-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 2px solid var(--color-border-light);
}

.avatar-type-broadcast {
  background: #fef3c7;
}

.avatar-type-event {
  background: #dbeafe;
}

.avatar-type-registration {
  background: #dcfce7;
}

.avatar-type-system {
  background: #f3e8ff;
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
  font-weight: 600;
  color: var(--color-text);
  font-size: var(--text-base);
}

.notification-name {
  color: var(--color-primary);
}

.conversation-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.conversation-preview {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.preview-text {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.unread-badge {
  background: var(--color-primary);
  color: white;
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.conversation-arrow {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.notification-item {
  border-left: 3px solid var(--color-primary);
}

.notif-type-broadcast {
  border-left-color: #f59e0b;
}

.notif-type-event {
  border-left-color: #3b82f6;
}

.notif-type-registration {
  border-left-color: #22c55e;
}

.notif-type-system {
  border-left-color: #a855f7;
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.create-group-btn {
  width: auto;
  padding: 0 var(--space-md);
  gap: var(--space-1);
}

.create-group-btn span {
  font-size: var(--text-sm);
  font-weight: 500;
}

.group-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-count {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  background: var(--color-bg-soft);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-md);
}

.modal {
  background: #FFFFFF;
  border-radius: var(--radius-2xl);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--color-border-light);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-xl);
  border-bottom: 1px solid var(--color-border-light);
  background: #F8FAFC;
}

.modal-header-icon {
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.modal-header-content {
  flex: 1;
}

.modal-header-content h3 {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
}

.modal-header-desc {
  margin: var(--space-1) 0 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--color-card);
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--color-error);
  color: white;
}

.modal-body {
  padding: var(--space-lg);
  overflow-y: auto;
  flex: 1;
  background: #FFFFFF;
}

.form-section {
  background: #F8FAFC;
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-group {
  margin-bottom: var(--space-lg);
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.form-label svg {
  color: var(--color-primary);
}

.form-group .hint {
  font-weight: 400;
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

.form-group .required {
  color: var(--color-error);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: var(--space-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  box-sizing: border-box;
  font-family: inherit;
  background: #FFFFFF;
  transition: all var(--transition-fast);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.1);
}

.form-textarea {
  resize: none;
}

.char-count {
  display: block;
  text-align: right;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-2);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.section-header .form-label {
  margin-bottom: 0;
}

.hint-badge {
  font-size: var(--text-xs);
  color: var(--color-primary);
  background: var(--color-primary-soft);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-weight: 500;
}

.loading-members,
.empty-followers {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  gap: var(--space-md);
  background: #FFFFFF;
  border-radius: var(--radius-lg);
  border: 2px dashed var(--color-border);
}

.empty-followers .empty-icon {
  color: var(--color-text-muted);
  opacity: 0.5;
}

.empty-followers p {
  margin: 0;
  font-size: var(--text-sm);
}

.empty-followers .hint {
  font-size: var(--text-xs);
}

.member-select-list {
  max-height: 240px;
  overflow-y: auto;
  border-radius: var(--radius-lg);
  background: #FFFFFF;
  border: 1px solid var(--color-border-light);
}

.member-select-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-bottom: 1px solid var(--color-border-light);
  position: relative;
}

.member-select-item:last-child {
  border-bottom: none;
}

.member-select-item:hover {
  background: var(--color-bg-soft);
}

.member-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--color-border);
  transition: all var(--transition-fast);
}

.member-select-item:hover .member-avatar {
  border-color: var(--color-primary);
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.check-icon {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  color: transparent;
}

.check-icon.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.selected-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-md);
  background: var(--color-card);
  border-radius: var(--radius-lg);
  margin-top: var(--space-md);
}

.selected-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.selected-count {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-primary);
}

.selected-unit {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-xl);
  border-top: 1px solid var(--color-border-light);
  background: #F8FAFC;
}

.btn {
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #FFFFFF;
  color: var(--color-text);
  border: 2px solid var(--color-border);
}

.btn-secondary:hover {
  border-color: var(--color-text-muted);
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

  .conversation-item {
    padding: var(--space-md);
  }

  .conversation-avatar,
  .notification-avatar {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }

  .create-group-btn span {
    display: none;
  }

  .create-group-btn {
    width: 40px;
    padding: 0;
  }
}
</style>
