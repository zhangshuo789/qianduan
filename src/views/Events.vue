<template>
  <div class="events-page">
    <div class="events-hero">
      <div class="hero-bg">
        <div class="hero-shape hero-shape-1"></div>
        <div class="hero-shape hero-shape-2"></div>
        <div class="hero-shape hero-shape-3"></div>
      </div>
      <div class="hero-content">
        <div class="hero-icon">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="hero-text">
          <h1>赛事活动</h1>
          <p>发现精彩赛事，参与排球运动</p>
        </div>
        <router-link v-if="user" to="/create-event" class="create-btn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>发布赛事</span>
        </router-link>
      </div>
    </div>

    <div class="events-container">
      <div class="events-toolbar">
        <div class="stats-bar">
          <div class="stat-item">
            <span class="stat-value">{{ events.length }}</span>
            <span class="stat-label">赛事总数</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ registeringCount }}</span>
            <span class="stat-label">报名中</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ inProgressCount }}</span>
            <span class="stat-label">进行中</span>
          </div>
        </div>
        <button class="refresh-btn" @click="loadEvents" :disabled="loading">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spinning': loading }">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
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

      <div v-else class="events-grid">
        <router-link
          v-for="(evt, index) in events"
          :key="evt.id"
          :to="`/event/${evt.id}`"
          class="event-card"
          :style="{ animationDelay: `${index * 80}ms` }"
        >
          <div class="card-banner" v-if="evt.imageUrls && evt.imageUrls.length">
            <img :src="evt.imageUrls[0]" alt="赛事图片" />
            <div class="banner-overlay">
              <span class="event-type-badge" :class="evt.type.toLowerCase()">
                {{ evt.type === 'MATCH' ? '比赛' : '活动' }}
              </span>
              <span class="event-status-badge" :class="evt.status.toLowerCase()">
                {{ statusText(evt.status) }}
              </span>
            </div>
          </div>
          <div class="card-banner card-banner-placeholder" v-else>
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <div class="banner-overlay">
              <span class="event-type-badge" :class="evt.type.toLowerCase()">
                {{ evt.type === 'MATCH' ? '比赛' : '活动' }}
              </span>
              <span class="event-status-badge" :class="evt.status.toLowerCase()">
                {{ statusText(evt.status) }}
              </span>
            </div>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ evt.title }}</h3>
            <div class="card-info">
              <div class="info-row">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{{ formatTime(evt.startTime) }}</span>
              </div>
              <div class="info-row">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{{ evt.location }}</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="participant-bar">
                <div class="participant-progress" :style="{ width: `${Math.min((evt.registrationCount || 0) / evt.maxParticipants * 100, 100)}%` }"></div>
              </div>
              <div class="card-stats">
                <span class="stat">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  {{ evt.registrationCount || 0 }}/{{ evt.maxParticipants }}人
                </span>
                <span class="stat">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {{ evt.subscriberCount || 0 }}
                </span>
              </div>
            </div>
          </div>
        </router-link>
      </div>

      <div v-if="!loading && hasMore" class="load-more">
        <button class="load-more-btn" @click="loadMore" :disabled="loadingMore">
          <svg v-if="!loadingMore" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <div v-else class="spinner spinner-sm"></div>
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
const isAdmin = computed(() => user.value?.isAdmin === true)

const loading = ref(true)
const events = ref([])
const page = ref(0)
const size = 10
const hasMore = ref(true)
const loadingMore = ref(false)

const registeringCount = computed(() => events.value.filter(e => e.status === 'REGISTERING').length)
const inProgressCount = computed(() => events.value.filter(e => e.status === 'IN_PROGRESS').length)

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

.events-hero {
  position: relative;
  background: #667eea;
  padding: var(--space-2xl) var(--space-lg);
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.hero-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.hero-shape-1 {
  width: 200px;
  height: 200px;
  top: -50px;
  right: -50px;
  animation: float 8s ease-in-out infinite;
}

.hero-shape-2 {
  width: 150px;
  height: 150px;
  bottom: -30px;
  left: 10%;
  animation: float 6s ease-in-out infinite reverse;
}

.hero-shape-3 {
  width: 100px;
  height: 100px;
  top: 20%;
  left: 30%;
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

.hero-content {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.hero-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.hero-text {
  flex: 1;
}

.hero-text h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: white;
  margin: 0 0 var(--space-1);
}

.hero-text p {
  font-size: var(--text-base);
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-md) var(--space-xl);
  background: white;
  color: #667eea;
  border-radius: var(--radius-xl);
  text-decoration: none;
  font-size: var(--text-base);
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all var(--transition-fast);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.events-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.events-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-card);
  border-radius: var(--radius-xl);
  padding: var(--space-md) var(--space-lg);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
}

.stats-bar {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.stats-bar .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--color-border);
}

.refresh-btn {
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

.refresh-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn .spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-lg);
}

.event-card {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  overflow: hidden;
  text-decoration: none;
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-fast);
  animation: fadeSlideUp 0.5s ease forwards;
  opacity: 0;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.event-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-light);
}

.card-banner {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.card-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.event-card:hover .card-banner img {
  transform: scale(1.05);
}

.card-banner-placeholder {
  background: #e4e8eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.banner-overlay {
  position: absolute;
  top: var(--space-sm);
  left: var(--space-sm);
  right: var(--space-sm);
  display: flex;
  justify-content: space-between;
}

.event-type-badge,
.event-status-badge {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.event-type-badge.match {
  background: rgba(24, 144, 255, 0.9);
  color: white;
}

.event-type-badge.activity {
  background: rgba(250, 140, 22, 0.9);
  color: white;
}

.event-status-badge.registering {
  background: rgba(82, 196, 26, 0.9);
  color: white;
}

.event-status-badge.in_progress {
  background: rgba(250, 140, 22, 0.9);
  color: white;
}

.event-status-badge.ended {
  background: rgba(153, 153, 153, 0.9);
  color: white;
}

.event-status-badge.cancelled {
  background: rgba(255, 77, 79, 0.9);
  color: white;
}

.event-status-badge.preparing {
  background: rgba(114, 46, 209, 0.9);
  color: white;
}

.card-body {
  padding: var(--space-lg);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--space-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-md);
}

.info-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.info-row svg {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.card-footer {
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border-light);
}

.participant-bar {
  height: 6px;
  background: var(--color-bg-soft);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-sm);
}

.participant-progress {
  height: 100%;
  background: #667eea;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.card-stats {
  display: flex;
  justify-content: space-between;
}

.card-stats .stat {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.card-stats .stat svg {
  color: var(--color-text-muted);
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: var(--space-xl);
}

.load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-md) var(--space-2xl);
  border-radius: var(--radius-xl);
  border: 2px solid var(--color-primary);
  background: var(--color-card);
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.load-more-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-primary);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .hero-content {
    flex-wrap: wrap;
  }

  .create-btn {
    width: 100%;
    justify-content: center;
    margin-top: var(--space-md);
  }

  .events-toolbar {
    flex-direction: column;
    gap: var(--space-md);
  }

  .stats-bar {
    width: 100%;
    justify-content: space-around;
  }
}

@media (max-width: 640px) {
  .events-container {
    padding: var(--space-md);
  }

  .events-grid {
    grid-template-columns: 1fr;
  }

  .card-banner {
    height: 140px;
  }
}
</style>
