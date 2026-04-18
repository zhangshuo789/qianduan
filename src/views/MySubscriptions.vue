<template>
  <div class="subscriptions-page">
    <div class="subscriptions-container">
      <div class="subscriptions-header">
        <div class="header-content">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div class="header-info">
            <h1 class="header-title">我的订阅</h1>
            <p class="header-subtitle">{{ subscriptions.length }} 个订阅赛事</p>
          </div>
        </div>
        <router-link to="/events" class="action-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          浏览赛事
        </router-link>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner spinner-lg"></div>
        <span>加载中...</span>
      </div>

      <div v-else-if="!user" class="login-prompt">
        <h3>请先登录</h3>
        <router-link to="/login" class="btn btn-primary">去登录</router-link>
      </div>

      <div v-else-if="subscriptions.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <h3>暂无订阅</h3>
        <p>去订阅你感兴趣的赛事吧</p>
        <router-link to="/events" class="btn btn-primary">浏览赛事</router-link>
      </div>

      <div v-else class="subscriptions-list">
        <router-link
          v-for="(sub, index) in subscriptions"
          :key="sub.id"
          :to="`/event/${sub.id}`"
          class="subscription-card ui-card animate-fade-in-up"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <div class="subscription-image" v-if="sub.imageUrls && sub.imageUrls.length">
            <img :src="sub.imageUrls[0]" alt="赛事图片" />
          </div>
          <div class="subscription-content">
            <div class="subscription-meta">
              <span class="subscription-type" :class="sub.type.toLowerCase()">{{ sub.type === 'MATCH' ? '比赛' : '活动' }}</span>
              <span class="subscription-status" :class="sub.status.toLowerCase()">{{ statusText(sub.status) }}</span>
            </div>
            <h3 class="subscription-title">{{ sub.title }}</h3>
            <div class="subscription-info">
              <div class="info-item">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{{ formatTime(sub.startTime) }}</span>
              </div>
              <div class="info-item">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{{ sub.location }}</span>
              </div>
            </div>
          </div>
          <button class="unsubscribe-btn" @click.prevent="handleUnsubscribe(sub.id)" :disabled="unsubbing === sub.id">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { event as eventApi, getUser } from '@/api'

const user = getUser()
const loading = ref(true)
const subscriptions = ref([])
const unsubbing = ref(null)

function statusText(status) {
  const map = {
    'PREPARING': '筹备中',
    'REGISTERING': '报名中',
    'IN_PROGRESS': '进行中',
    'ENDED': '已结束',
    'CANCELLED': '已取消'
  }
  return map[status] || status
}

function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function loadSubscriptions() {
  if (!user.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    const res = await eventApi.getSubscriptions(user.value.id)
    subscriptions.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleUnsubscribe(eventId) {
  if (unsubbing.value) return
  unsubbing.value = eventId
  try {
    await eventApi.unsubscribe(eventId)
    subscriptions.value = subscriptions.value.filter(s => s.id !== eventId)
  } catch (e) {
    console.error(e)
    alert(e.message || '取消订阅失败')
  } finally {
    unsubbing.value = null
  }
}

onMounted(() => {
  loadSubscriptions()
})
</script>

<style scoped>
.subscriptions-page {
  min-height: calc(100vh - 72px);
  background: var(--color-bg-soft);
}

.subscriptions-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.subscriptions-header {
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
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
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

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-card);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  background: var(--color-card);
  border-radius: var(--radius-2xl);
  gap: var(--space-md);
  color: var(--color-text-muted);
}

.login-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  background: var(--color-card);
  border-radius: var(--radius-2xl);
  gap: var(--space-lg);
}

.login-prompt h3 {
  color: var(--color-text-secondary);
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  background: var(--color-card);
  border-radius: var(--radius-2xl);
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
  margin: 0 0 var(--space-xl);
}

.btn {
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}

.subscriptions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.subscription-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.subscription-card:hover {
  transform: translateX(4px);
  border-color: var(--color-primary-light);
}

.subscription-image {
  width: 100px;
  height: 70px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
}

.subscription-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.subscription-content {
  flex: 1;
  min-width: 0;
}

.subscription-meta {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.subscription-type {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
}

.subscription-type.match {
  background: #e8f4ff;
  color: #1890ff;
}

.subscription-type.activity {
  background: #fff7e6;
  color: #fa8c16;
}

.subscription-status {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
}

.subscription-status.registering {
  background: #f6ffed;
  color: #52c41a;
}

.subscription-status.in_progress {
  background: #fff7e6;
  color: #fa8c16;
}

.subscription-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--space-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subscription-info {
  display: flex;
  gap: var(--space-md);
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.unsubscribe-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-card);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.unsubscribe-btn:hover:not(:disabled) {
  border-color: var(--color-error);
  color: var(--color-error);
  background: #fff2f0;
}

.unsubscribe-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .subscriptions-container {
    padding: var(--space-md);
  }

  .subscription-image {
    width: 80px;
    height: 60px;
  }

  .subscription-info {
    flex-direction: column;
    gap: var(--space-1);
  }
}
</style>
