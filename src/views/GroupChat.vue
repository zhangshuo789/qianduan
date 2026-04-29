<template>
  <div class="group-chat-page ui-page">
    <div class="group-chat-container">
      <header class="group-chat-header ui-card ui-pop-in">
        <router-link to="/messages" class="group-chat-back">
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
        <div class="header-actions">
          <button v-if="isOwner" class="ui-button ui-button-secondary" @click="showInviteModal = true">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            邀请
          </button>
          <button v-if="isOwner" class="ui-button ui-button-secondary" @click="showMembersModal = true">管理成员</button>
          <button v-if="!isOwner" class="ui-button ui-button-secondary ui-button-danger" @click="leaveGroup">退群</button>
        </div>
      </header>

      <section ref="messagesContainer" class="group-chat-messages ui-card">
        <div v-if="loading" class="ui-loading">加载中...</div>
        <div v-else-if="messages.length === 0" class="ui-empty">暂无消息</div>
        <div v-else class="chat-message-list">
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
                <img v-if="msgIndex === 0 || msg.isFirstInGroup" :src="msg.processedAvatar || defaultAvatar" class="msg-avatar" alt="头像" />
              </div>

              <!-- 消息主体 -->
              <div class="msg-main">
                <div v-if="msgIndex === 0 || msg.isFirstInGroup" class="msg-header">
                  <span class="msg-name">{{ msg.senderNickname }}</span>
                  <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
                </div>
                <div class="msg-bubble" :class="{
                  'msg-bubble-first': msgIndex === 0 || msg.isFirstInGroup,
                  'msg-bubble-middle': msgIndex > 0 && !msg.isFirstInGroup && msgIndex < group.messages.length - 1,
                  'msg-bubble-last': msgIndex === group.messages.length - 1,
                  'msg-bubble-single': group.messages.length === 1
                }">
                  <p class="msg-text">{{ msg.content }}</p>
                </div>
                <!-- 非首条消息才在气泡下方显示时间（首条时间已在头部显示）-->
                <div class="msg-footer" v-if="!(msgIndex === 0 || msg.isFirstInGroup) && (msgIndex === group.messages.length - 1 || msg.showTime)">
                  <span class="msg-time-bottom">{{ formatTime(msg.createdAt) }}</span>
                </div>
              </div>
            </div>
          </template>
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
        <div class="modal-content members-modal">
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
              <h3>群成员管理</h3>
              <p class="modal-header-desc">{{ members.length }} 位成员</p>
            </div>
            <button class="modal-close" @click="showMembersModal = false">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="members-list">
              <div v-for="m in members" :key="m.userId" class="member-item">
                <img :src="m.processedAvatar || defaultAvatar" class="member-avatar" alt="头像" />
                <div class="member-info">
                  <span class="member-name">{{ m.nickname }}</span>
                  <span v-if="m.role === 'OWNER'" class="member-role owner">群主</span>
                </div>
                <button
                  v-if="isOwner && m.userId !== currentUserId"
                  class="btn btn-danger btn-sm"
                  @click="removeMember(m.userId)"
                >
                  移除
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showMembersModal = false">关闭</button>
          </div>
        </div>
      </div>

      <!-- 邀请成员弹窗 -->
      <div v-if="showInviteModal" class="modal-overlay" @click.self="showInviteModal = false">
        <div class="modal-content invite-modal">
          <div class="modal-header">
            <div class="modal-header-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <div class="modal-header-content">
              <h3>邀请成员</h3>
              <p class="modal-header-desc">邀请粉丝加入群聊</p>
            </div>
            <button class="modal-close" @click="showInviteModal = false">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="section-header">
              <label class="form-label">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                选择粉丝
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
              <p>暂无粉丝可邀请</p>
            </div>
            <div v-else class="invite-list">
              <label v-for="f in followers" :key="f.id" class="invite-item" :class="{ 'disabled': isMember(f.id) }">
                <input type="checkbox" :value="f.id" v-model="selectedInvitees" :disabled="isMember(f.id)" class="member-checkbox" />
                <img :src="f.processedAvatar || defaultAvatar" class="member-avatar" alt="头像" />
                <div class="member-info">
                  <span class="member-name">{{ f.nickname }}</span>
                </div>
                <span v-if="isMember(f.id)" class="already-member">已在群中</span>
                <div v-else class="check-icon" :class="{ 'checked': selectedInvitees.includes(f.id) }">
                  <svg v-if="selectedInvitees.includes(f.id)" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </label>
            </div>
            <div class="selected-summary">
              <span class="selected-label">已选择</span>
              <span class="selected-count">{{ selectedInvitees.length }}</span>
              <span class="selected-unit">人</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showInviteModal = false">取消</button>
            <button class="btn btn-primary" :disabled="selectedInvitees.length === 0 || inviting" @click="inviteMembers">
              <svg v-if="!inviting" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              {{ inviting ? '邀请中...' : '邀请成员' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { group as groupApi, follow as followApi, getAvatarUrl, getUser, DEFAULT_AVATAR } from '@/api'
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
const groupInfo = ref(null)
const members = ref([])
const showMembersModal = ref(false)
const showInviteModal = ref(false)
const followers = ref([])
const loadingFollowers = ref(false)
const selectedInvitees = ref([])
const inviting = ref(false)

const groupId = computed(() => route.params.id)
const isOwner = computed(() => {
  const owner = members.value.find(m => m.role === 'OWNER')
  return owner?.userId === currentUserId.value
})

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
    const nextIsSameSender = nextMsg && nextMsg.senderId === msg.senderId
    const showTime = !nextIsSameSender || nextTimeDiff > 5 * 60 * 1000

    currentGroup.messages.push({
      ...msg,
      isFirstInGroup,
      showTime
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

function formatTime(d) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

async function loadGroupInfo() {
  if (!groupId.value) return
  try {
    const res = await groupApi.getInfo(groupId.value)
    groupInfo.value = res.data
  } catch (e) {
    console.error(e)
  }
}

async function loadMembers() {
  if (!groupId.value) return
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
  if (!groupId.value) return
  loading.value = true
  try {
    const res = await groupApi.getMessages(groupId.value)
    const msgs = res.data?.content || []
    messages.value = msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    for (const msg of messages.value) {
      if (msg.senderAvatar) {
        msg.processedAvatar = await getAvatarUrl(msg.senderAvatar) || defaultAvatar
      } else {
        msg.processedAvatar = defaultAvatar
      }
    }
    await nextTick()
    scrollToBottom()
    // 清除该群的未读数
    window.dispatchEvent(new CustomEvent('sse:groupRead', { detail: { groupId: groupId.value } }))
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
    members.value = members.value.filter(m => m.userId !== userId)
    toastBus.success('移除成功')
  } catch (e) {
    toastBus.error(e.message)
  }
}

function isMember(userId) {
  return members.value.some(m => m.userId === userId)
}

async function loadFollowers() {
  if (!currentUserId.value) return
  loadingFollowers.value = true
  try {
    const res = await followApi.getFollowers(currentUserId.value, 0, 50)
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

async function inviteMembers() {
  if (selectedInvitees.value.length === 0) return
  inviting.value = true
  let successCount = 0
  let failCount = 0

  for (const userId of selectedInvitees.value) {
    try {
      await groupApi.addMember(groupId.value, userId)
      successCount++
    } catch (e) {
      failCount++
      console.error(`邀请用户 ${userId} 失败:`, e)
    }
  }

  inviting.value = false
  selectedInvitees.value = []
  
  if (successCount > 0) {
    toastBus.success(`成功邀请 ${successCount} 人`)
    await loadMembers()
  }
  if (failCount > 0) {
    toastBus.warning(`${failCount} 人邀请失败`)
  }
  if (successCount > 0 && failCount === 0) {
    showInviteModal.value = false
  }
}

async function leaveGroup() {
  if (!confirm('确定要退出该群聊吗？')) return
  try {
    await groupApi.leave(groupId.value, currentUserId.value)
    toastBus.success('已退出群聊')
    router.push('/messages')
  } catch (e) {
    toastBus.error(e.message || '退群失败')
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

async function handleNewGroupMessage(event) {
  const data = event.detail || event
  if (data.groupId && data.groupId !== groupId.value) return
  if (data.senderAvatar) {
    data.processedAvatar = await getAvatarUrl(data.senderAvatar) || defaultAvatar
  } else {
    data.processedAvatar = defaultAvatar
  }
  messages.value.push(data)
  nextTick(() => scrollToBottom())
}

watch(showInviteModal, (val) => {
  if (val && followers.value.length === 0) {
    loadFollowers()
  }
})

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

/* ========== 消息列表（群聊 & 私信统一风格）========== */
.chat-message-list {
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

/* 消息头部：名称 + 时间（群聊显示，仅第一条消息显示） */
.msg-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: 2px;
  padding: 0 var(--space-1);
}

.msg-name {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-primary);
  line-height: 1.3;
}

.msg-self .msg-name {
  color: var(--color-primary);
}

.msg-time {
  font-size: 11px;
  color: var(--color-text-muted);
  flex-shrink: 0;
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

/* 连续消息气泡圆角（同一人发多条，视觉上连在一起）*/
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

.msg-bubble-single {
  /* 保持默认全圆角 */
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

/* 消息底部时间（最后一条或需要显示时间的消息） */
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

.msg-self .msg-time-bottom {
  color: var(--color-text-muted);
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
  background: #FFFFFF;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--color-border-light);
}

.header-actions {
  display: flex;
  gap: var(--space-2);
}

.header-actions .ui-button {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.invite-modal {
  max-width: 450px;
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

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.form-label svg {
  color: var(--color-primary);
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

.invite-list {
  max-height: 240px;
  overflow-y: auto;
  border-radius: var(--radius-lg);
  background: #FFFFFF;
  border: 1px solid var(--color-border-light);
}

.invite-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-bottom: 1px solid var(--color-border-light);
  position: relative;
}

.invite-item:last-child {
  border-bottom: none;
}

.invite-item:hover:not(.disabled) {
  background: var(--color-bg-soft);
}

.invite-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.invite-item .member-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--color-border);
}

.invite-item .member-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.member-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.member-info {
  flex: 1;
}

.already-member {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  background: var(--color-bg-soft);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
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

.members-modal {
  max-width: 450px;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-height: 300px;
  overflow-y: auto;
}

.members-list .member-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: #FFFFFF;
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  border: 1px solid var(--color-border-light);
}

.members-list .member-item:hover {
  background: #F8FAFC;
}

.members-list .member-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--color-border);
}

.members-list .member-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.members-list .member-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.members-list .member-role {
  font-size: var(--text-xs);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.members-list .member-role.owner {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.btn-danger {
  background: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
}

.btn-danger:hover {
  background: var(--color-error);
  color: white;
}

.btn-sm {
  padding: var(--space-1) var(--space-md);
  font-size: var(--text-xs);
}

.ui-button-sm {
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
}

.ui-button-danger {
  color: var(--color-error);
  border-color: var(--color-error);
}

.ui-button-danger:hover {
  background: var(--color-error);
  color: white;
}
</style>
