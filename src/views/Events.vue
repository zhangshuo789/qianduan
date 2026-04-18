<template>
  <div class="events-page">
    <div class="events-container">
      <div class="events-header">
        <div class="header-content">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="header-info">
            <h1 class="header-title">赛事活动</h1>
            <p class="header-subtitle">{{ events.length }} 个赛事</p>
          </div>
        </div>
        <div class="header-actions">
          <router-link v-if="user" to="/create-event" class="action-btn action-btn-create">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>发布赛事</span>
          </router-link>
          <button class="action-btn" @click="loadEvents">
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

      <div v-else-if="events.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <h3>暂无赛事</h3>
        <p>敬请期待更多赛事活动</p>
      </div>

      <div v-else class="events-list">
        <router-link
          v-for="(evt, index) in events"
          :key="evt.id"
          :to="`/event/${evt.id}`"
          class="event-card ui-card animate-fade-in-up"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <div class="event-image" v-if="evt.imageUrls && evt.imageUrls.length">
            <img :src="evt.imageUrls[0]" alt="赛事图片" />
          </div>
          <div class="event-content">
            <div class="event-meta">
              <span class="event-type" :class="evt.type.toLowerCase()">{{ evt.type === 'MATCH' ? '比赛' : '活动' }}</span>
              <span class="event-status" :class="evt.status.toLowerCase()">{{ statusText(evt.status) }}</span>
            </div>
            <h3 class="event-title">{{ evt.title }}</h3>
            <div class="event-info">
              <div class="info-item">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{{ formatTime(evt.startTime) }}</span>
              </div>
              <div class="info-item">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{{ evt.location }}</span>
              </div>
            </div>
            <div class="event-stats">
              <span class="stat-item">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                {{ evt.registrationCount || 0 }} / {{ evt.maxParticipants }}人
              </span>
              <span class="stat-item">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {{ evt.subscriberCount || 0 }} 订阅
              </span>
            </div>
          </div>
        </router-link>
      </div>

      <div v-if="!loading && hasMore" class="load-more">
        <button class="load-more-btn" @click="loadMore" :disabled="loadingMore">
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { event as eventApi, getUser } from '@/api'

const user = getUser()
const isAdmin = computed(() => user.value?.roles?.includes('ADMIN'))

const loading = ref(true)
const events = ref([])
const page = ref(0)
const size = 10
const hasMore = ref(true)
const loadingMore = ref(false)

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

async function loadEvents() {
  loading.value = true
  try {
    const res = await eventApi.list(0, size)
    events.value = res.data?.content || []
    page.value = 0
    hasMore.value = !res.data?.last
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    const res = await eventApi.list(page.value + 1, size)
    const newEvents = res.data?.content || []
    events.value.push(...newEvents)
    page.value++
    hasMore.value = !res.data?.last
  } catch (e) {
    console.error(e)
  } finally {
    loadingMore.value = false
  }
}

onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
.events-page {
  min-height: calc(100vh - 72px);
  background: var(--color-bg-soft);
}

.events-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.events-header {
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.action-btn-create {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-lg);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.action-btn-create:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
  color: white;
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

.events-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--space-lg);
}

.event-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  overflow: hidden;
  transition: all var(--transition-fast);
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-light);
}

.event-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-content {
  padding: var(--space-lg);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.event-meta {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-sm);
}

.event-type {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
}

.event-type.match {
  background: #e8f4ff;
  color: #1890ff;
}

.event-type.activity {
  background: #fff7e6;
  color: #fa8c16;
}

.event-status {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
}

.event-status.registering {
  background: #f6ffed;
  color: #52c41a;
}

.event-status.in_progress {
  background: #fff7e6;
  color: #fa8c16;
}

.event-status.ended {
  background: #f5f5f5;
  color: #999;
}

.event-status.cancelled {
  background: #fff2f0;
  color: #ff4d4f;
}

.event-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--space-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-md);
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.info-item svg {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.event-stats {
  display: flex;
  gap: var(--space-lg);
  margin-top: auto;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border-light);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.stat-item svg {
  color: var(--color-text-muted);
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: var(--space-xl);
}

.load-more-btn {
  padding: var(--space-md) var(--space-2xl);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-primary);
  background: var(--color-card);
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.load-more-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .events-container {
    padding: var(--space-md);
  }

  .events-list {
    grid-template-columns: 1fr;
  }

  .event-image {
    height: 140px;
  }
}
</style>
