<template>
  <div class="notif-page">
    <div class="notif-container">
      <header class="notif-header ui-card">
        <router-link to="/messages" class="notif-back">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </router-link>
        <div class="notif-header-info">
          <h1 class="notif-title">通知收件箱</h1>
          <p class="notif-subtitle" v-if="notifications.length">
            {{ notifications.length }} 条通知
            <span v-if="unreadCount > 0" class="unread-dot">{{ unreadCount }} 条未读</span>
          </p>
        </div>
        <button v-if="notifications.length > 0" class="mark-all-btn" @click="markAllRead">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          全部已读
        </button>
      </header>

      <section class="notif-list">
        <div v-if="loading" class="loading-state">
          <div class="spinner spinner-lg"></div>
          <span>加载中...</span>
        </div>

        <div v-else-if="notifications.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 12h-6l-2 3H10l-2-3H2"/>
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
            </svg>
          </div>
          <h3>暂无通知</h3>
          <p>管理员通知将会显示在这里</p>
        </div>

        <template v-else>
          <template v-for="(group, gi) in groupedNotifications" :key="gi">
            <div class="date-divider">
              <span>{{ group.date }}</span>
            </div>
            <div
              v-for="notif in group.items"
              :key="notif.uniqueId"
              class="notif-item ui-card"
              :class="[`notif-type-${notif.type}`, { 'notif-unread': !notif.read }]"
              @click="markOneRead(notif)"
            >
              <div class="notif-icon" :class="`icon-type-${notif.type}`">
                <span v-if="notif.type === 'broadcast'">📢</span>
                <span v-else-if="notif.type === 'event'">🏆</span>
                <span v-else-if="notif.type === 'registration'">📝</span>
                <span v-else-if="notif.type === 'system'">⚙️</span>
                <span v-else>📢</span>
              </div>
              <div class="notif-body">
                <div class="notif-head">
                  <span class="notif-name">{{ notif.title || '系统通知' }}</span>
                  <span class="notif-type-tag" :class="`tag-${notif.type}`">{{ typeLabel(notif.type) }}</span>
                </div>
                <p class="notif-content" v-if="notif.content">{{ notif.content }}</p>
                <span class="notif-time">{{ formatTime(notif.createdAt || notif.sentAt) }}</span>
              </div>
            </div>
          </template>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { admin } from '@/api'

const loading = ref(true)
const notifications = ref([])

// ========== 通知本地已读缓存 ==========
const NOTIF_READ_KEY = 'notif_read_ids'

function getNotifId(n) {
  return n?.id || n?.eventId || ''
}

function loadLocalReadIds() {
  try {
    const raw = localStorage.getItem(NOTIF_READ_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveLocalReadIds(ids) {
  localStorage.setItem(NOTIF_READ_KEY, JSON.stringify(ids))
}

// 将 API 通知列表与本地已读状态合并
function mergeReadStatus(list) {
  const readIds = loadLocalReadIds()
  return list.map(n => ({
    ...n,
    read: readIds.includes(getNotifId(n))
  }))
}

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const groupedNotifications = computed(() => {
  if (!notifications.value.length) return []

  const groups = []
  let currentDate = ''
  let currentGroup = null

  // 按时间正序（旧→新），最新的在最下面
  const sorted = [...notifications.value].sort(
    (a, b) => new Date(a.createdAt || a.sentAt) - new Date(b.createdAt || b.sentAt)
  )

  sorted.forEach((n) => {
    const d = formatDate(n.createdAt || n.sentAt)
    if (d !== currentDate) {
      if (currentGroup) groups.push(currentGroup)
      currentDate = d
      currentGroup = { date: d, items: [] }
    }
    currentGroup.items.push({
      ...n,
      uniqueId: n.id || n.eventId || `${n.type}-${n.createdAt}`
    })
  })

  if (currentGroup) groups.push(currentGroup)
  return groups
})

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const yesterday = new Date(today.getTime() - 86400000)

  if (msgDate.getTime() === today.getTime()) return '今天'
  if (msgDate.getTime() === yesterday.getTime()) return '昨天'
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

function formatTime(d) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function typeLabel(type) {
  const map = { broadcast: '广播', event: '赛事', registration: '报名', system: '系统' }
  return map[type] || '通知'
}

async function loadNotifications() {
  loading.value = true
  try {
    const res = await admin.getNotificationList()
    let list = res.data
    if (!list) { notifications.value = []; return }
    if (!Array.isArray(list)) {
      list = list.content || []
    }
    const filtered = list.filter(n => {
      if (!n) return false
      return (n.title && n.title.trim()) || (n.content && n.content.trim()) || (n.message && n.message.trim())
    })
    // 合并本地已读状态
    notifications.value = mergeReadStatus(filtered)
  } catch (e) {
    console.error('加载通知失败:', e)
    notifications.value = []
  } finally {
    loading.value = false
  }
}

function markOneRead(notif) {
  if (notif.read) return
  const nid = getNotifId(notif)
  if (!nid) return

  // 更新本地缓存
  const ids = loadLocalReadIds()
  if (!ids.includes(nid)) {
    ids.push(nid)
    saveLocalReadIds(ids)
  }
  // 更新内存
  const idx = notifications.value.findIndex(n => getNotifId(n) === nid)
  if (idx >= 0) {
    notifications.value[idx] = { ...notifications.value[idx], read: true }
  }
  // 后台调 API
  admin.markNotificationRead(nid).catch(() => {})
}

async function markAllRead() {
  if (notifications.value.length === 0) return

  // 写本地缓存
  const ids = loadLocalReadIds()
  let changed = false
  for (const n of notifications.value) {
    const nid = getNotifId(n)
    if (nid && !ids.includes(nid)) {
      ids.push(nid)
      changed = true
    }
  }
  if (changed) saveLocalReadIds(ids)
  // 更新内存
  notifications.value = notifications.value.map(n => ({ ...n, read: true }))

  // 异步调后端
  try {
    await admin.markAllNotificationsRead()
  } catch (e) {
    console.error('后端全部已读失败:', e)
  }
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.notif-page {
  min-height: calc(100vh - 72px);
  background: var(--color-bg-soft);
}

.notif-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-lg);
}

/* 头部 */
.notif-header {
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.notif-back {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background: var(--color-bg-soft);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.notif-back:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  text-decoration: none;
}

.notif-header-info {
  flex: 1;
}

.notif-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.notif-subtitle {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: var(--space-1) 0 0;
}

.mark-all-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-card);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mark-all-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

/* 加载 & 空状态 */
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

/* 日期分隔 */
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

/* 通知列表 */
.notif-list {
  display: flex;
  flex-direction: column;
}

/* 通知卡片 */
.notif-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-sm);
  border-left: 3px solid var(--color-primary);
  transition: all var(--transition-fast);
}

.notif-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.notif-type-broadcast { border-left-color: #f59e0b; }
.notif-type-event { border-left-color: #3b82f6; }
.notif-type-registration { border-left-color: #22c55e; }
.notif-type-system { border-left-color: #a855f7; }

.notif-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: var(--color-bg-soft);
}

.icon-type-broadcast { background: #fef3c7; }
.icon-type-event { background: #dbeafe; }
.icon-type-registration { background: #dcfce7; }
.icon-type-system { background: #f3e8ff; }

.notif-body {
  flex: 1;
  min-width: 0;
}

.notif-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.notif-name {
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-text);
}

.notif-type-tag {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.tag-broadcast { background: #fef3c7; color: #b45309; }
.tag-event { background: #dbeafe; color: #1d4ed8; }
.tag-registration { background: #dcfce7; color: #15803d; }
.tag-system { background: #f3e8ff; color: #7c3aed; }

.notif-content {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-1);
  line-height: 1.5;
  word-break: break-word;
}

.notif-time {
  font-size: 11px;
  color: var(--color-text-muted);
}

/* 未读通知高亮 */
.notif-unread {
  background: #fefce8;
  border-left-width: 4px;
}

.unread-dot {
  color: var(--color-error);
  font-weight: 600;
  margin-left: var(--space-3);
}

@media (max-width: 640px) {
  .notif-container {
    padding: var(--space-md);
  }

  .notif-item {
    padding: var(--space-md);
  }

  .notif-icon {
    width: 38px;
    height: 38px;
    font-size: 18px;
  }
}
</style>
