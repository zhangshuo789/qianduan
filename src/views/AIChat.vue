<template>
  <div class="ai-chat-page">
    <div class="ai-chat-container">
      <!-- 左侧会话列表 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>AI 助手</h2>
          <button class="new-chat-btn" @click="createNewChat">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        <div class="conversation-list">
          <div
            v-for="conv in conversations"
            :key="conv.id"
            class="conversation-item"
            :class="{ active: conv.id === currentConversationId }"
            @click="selectConversation(conv.id)"
          >
            <div class="conversation-info">
              <span class="conversation-title">{{ conv.title || '新对话' }}</span>
              <span class="conversation-time">{{ formatDate(conv.updatedAt) }}</span>
            </div>
            <button class="delete-btn" @click.stop="deleteConversation(conv.id)">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
          <div v-if="conversations.length === 0" class="empty-conversations">
            <span>暂无会话</span>
          </div>
        </div>

        <!-- 知识图谱入口 -->
        <div class="sidebar-footer">
          <button class="knowledge-btn" @click="goToKnowledgeGraph">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4"/>
              <line x1="12" y1="2" x2="12" y2="4"/>
              <line x1="12" y1="20" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="4" y2="12"/>
              <line x1="20" y1="12" x2="22" y2="12"/>
            </svg>
            <span>知识图谱</span>
          </button>
        </div>
      </aside>

      <!-- 右侧聊天区域 -->
      <main class="chat-area">
        <div v-if="!currentConversationId" class="no-chat-selected">
          <div class="no-chat-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3>开始与 AI 对话</h3>
          <p>选择左侧会话或创建新对话开始聊天</p>
        </div>

        <template v-else>
          <div ref="messagesContainer" class="messages-container">
            <div v-if="loadingMessages" class="loading-state">
              <div class="spinner spinner-lg"></div>
              <span>加载中...</span>
            </div>
            <div v-else-if="messages.length === 0" class="empty-messages">
              <div class="empty-ai-avatar">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/>
                  <path d="M12 16v-4"/>
                  <path d="M12 8h.01"/>
                </svg>
              </div>
              <p>你好！我是 AI 助手，有什么可以帮助你的吗？</p>
            </div>
            <div v-else class="messages-list">
              <template v-for="(msg, index) in messages" :key="index">
                <div
                  class="message-wrapper"
                  :class="{ 'message-ai': msg.role === 'assistant', 'message-user': msg.role === 'user' }"
                >
                  <div class="message-avatar">
                    <div v-if="msg.role === 'assistant'" class="ai-avatar">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/>
                        <path d="M12 16v-4"/>
                        <path d="M12 8h.01"/>
                      </svg>
                    </div>
                    <div v-else class="user-avatar">
                      <img v-if="myAvatar" :src="myAvatar" alt="我的头像" />
                    </div>
                  </div>
                  <div class="message-content">
                    <div v-if="msg.role === 'assistant' && !msg.content" class="message-bubble typing-bubble">
                      <span class="typing-dot"></span>
                      <span class="typing-dot"></span>
                      <span class="typing-dot"></span>
                    </div>
                    <div v-else class="message-bubble">
                      <p class="message-text">{{ msg.content }}</p>
                    </div>
                    <span v-if="msg.content" class="message-time">{{ formatTime(msg.createdAt) }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div class="chat-input-area">
            <div class="input-wrapper">
              <textarea
                v-model="newMessage"
                class="input-field"
                placeholder="输入消息..."
                rows="1"
                @keydown.enter.exact.prevent="sendMessage"
                @input="autoResize"
              ></textarea>
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
        </template>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ai, getAvatarUrl, getUser } from '@/api'
import { toastBus } from '@/utils/toast'

const router = useRouter()
const conversations = ref([])
const currentConversationId = ref(null)
const messages = ref([])
const newMessage = ref('')
const loadingMessages = ref(false)
const sending = ref(false)
const messagesContainer = ref(null)
const myAvatar = ref('')

const user = getUser()

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const yesterday = new Date(today.getTime() - 86400000)

  if (msgDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (msgDate.getTime() === yesterday.getTime()) {
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

async function loadConversations() {
  try {
    const res = await ai.getConversations()
    conversations.value = res.data || []
  } catch (e) {
    console.error('加载会话列表失败', e)
  }
}

async function createNewChat() {
  try {
    const res = await ai.createConversation()
    const newConv = res.data
    conversations.value.unshift(newConv)
    selectConversation(newConv.id)
    await nextTick()
    scrollToBottom()
  } catch (e) {
    toastBus.error('创建会话失败')
    console.error(e)
  }
}

async function selectConversation(id) {
  if (currentConversationId.value === id) return
  currentConversationId.value = id
  messages.value = []
  await loadMessages()
}

async function loadMessages() {
  if (!currentConversationId.value) return
  loadingMessages.value = true
  try {
    const res = await ai.getMessages(currentConversationId.value)
    messages.value = res.data || []
    await nextTick()
    scrollToBottom()
  } catch (e) {
    console.error('加载消息失败', e)
  } finally {
    loadingMessages.value = false
  }
}

async function deleteConversation(id) {
  if (!confirm('确定删除该会话？')) return
  try {
    await ai.deleteConversation(id)
    conversations.value = conversations.value.filter(c => c.id !== id)
    if (currentConversationId.value === id) {
      currentConversationId.value = null
      messages.value = []
    }
    toastBus.success('会话已删除')
  } catch (e) {
    toastBus.error('删除失败')
    console.error(e)
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || sending.value || !currentConversationId.value) return

  sending.value = true
  const content = newMessage.value.trim()
  newMessage.value = ''

  const userMsg = {
    role: 'user',
    content: content,
    createdAt: new Date().toISOString()
  }
  messages.value.push(userMsg)
  await nextTick()
  scrollToBottom()

  const aiMsg = {
    role: 'assistant',
    content: '',
    createdAt: new Date().toISOString()
  }
  messages.value.push(aiMsg)

  try {
    const res = await ai.sendMessage(currentConversationId.value, content)

    const fullContent = res.data.content || ''

    for (let i = 0; i < fullContent.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 15))
      aiMsg.content = fullContent.slice(0, i + 1)
      await nextTick()
      scrollToBottom()
    }

    if (conversations.value.length > 0) {
      const conv = conversations.value.find(c => c.id === currentConversationId.value)
      if (conv && !conv.title) {
        conv.title = content.slice(0, 20)
      }
    }
  } catch (e) {
    toastBus.error(e.message || '发送失败')
    messages.value = messages.value.filter(m => m !== aiMsg)
  } finally {
    sending.value = false
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function autoResize(e) {
  const textarea = e.target
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px'
}

function goToKnowledgeGraph() {
  toastBus.info('知识图谱功能正在开发中，敬请期待')
}

onMounted(async () => {
  await loadConversations()
  if (user?.avatar) {
    myAvatar.value = await getAvatarUrl(user.avatar) || ''
  }
})
</script>

<style scoped>
.ai-chat-page {
  min-height: calc(100vh - 72px);
  background: var(--color-bg-page);
}

.ai-chat-container {
  display: flex;
  height: calc(100vh - 72px);
  max-width: 1400px;
  margin: 0 auto;
}

/* 侧边栏 */
.sidebar {
  width: 280px;
  background: var(--color-card);
  border-right: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border-light);
}

.sidebar-header h2 {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.new-chat-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.new-chat-btn:hover {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md);
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: var(--space-xs);
}

.conversation-item:hover {
  background: var(--color-bg-soft);
}

.conversation-item.active {
  background: var(--color-primary-soft);
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-title {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.delete-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  opacity: 0;
  transition: all var(--transition-fast);
}

.conversation-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: var(--color-error-soft);
  color: var(--color-error);
}

.empty-conversations {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.sidebar-footer {
  padding: var(--space-md);
  border-top: 1px solid var(--color-border-light);
}

.knowledge-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-bg-soft);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-secondary);
}

.knowledge-btn:hover {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.knowledge-btn .badge {
  margin-left: auto;
  font-size: var(--text-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-page);
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
}

/* 聊天区域 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.no-chat-icon {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: var(--color-bg-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-lg);
  opacity: 0.5;
}

.no-chat-selected h3 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--space-sm);
}

.no-chat-selected p {
  font-size: var(--text-sm);
  margin: 0;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
}

.loading-state,
.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-muted);
}

.empty-ai-avatar {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: var(--color-primary-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  margin-bottom: var(--space-lg);
}

.empty-messages p {
  font-size: var(--text-sm);
  text-align: center;
  max-width: 300px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  max-width: 80%;
}

.message-wrapper.message-user {
  flex-direction: row-reverse;
  margin-left: auto;
}

.message-avatar {
  flex-shrink: 0;
}

.ai-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.message-user .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-xl);
  background: var(--color-card);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}

.message-user .message-bubble {
  background: var(--color-primary);
  border: none;
  color: white;
}

.typing-bubble {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md) var(--space-lg);
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-text-muted);
  animation: typing 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1);
  }
}

.message-text {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.6;
  word-break: break-word;
  color: inherit;
}

.message-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* 输入区域 */
.chat-input-area {
  padding: var(--space-lg);
  background: var(--color-card);
  border-top: 1px solid var(--color-border-light);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: var(--space-md);
  background: var(--color-bg-soft);
  border-radius: var(--radius-2xl);
  padding: var(--space-md);
  max-width: 900px;
  margin: 0 auto;
}

.input-field {
  flex: 1;
  border: none;
  background: transparent;
  padding: var(--space-sm);
  font-size: var(--text-sm);
  color: var(--color-text);
  resize: none;
  max-height: 150px;
  line-height: 1.5;
}

.input-field:focus {
  outline: none;
}

.input-field::placeholder {
  color: var(--color-text-muted);
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-soft);
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
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
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 960px) {
  .sidebar {
    width: 240px;
  }

  .message-wrapper {
    max-width: 90%;
  }
}

@media (max-width: 640px) {
  .sidebar {
    display: none;
  }

  .message-wrapper {
    max-width: 95%;
  }
}
</style>
