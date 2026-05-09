<template>
  <div class="events-page ui-page">
    <div class="events-container">
      <header class="events-header ui-card ui-pop-in">
        <h1 class="events-title">赛事中心</h1>
        <router-link to="/create-event" class="ui-button ui-button-primary">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          发布赛事
        </router-link>
      </header>

      <nav class="events-filters ui-card">
        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-btn"
          :class="{ active: currentFilter === f.value }"
          @click="switchFilter(f.value)"
        >{{ f.label }}</button>
      </nav>

      <section v-if="loading && events.length === 0" class="ui-card ui-loading">加载中...</section>

      <section v-else-if="events.length === 0" class="ui-card ui-empty">
        暂无赛事
      </section>

      <section v-else class="events-list">
        <router-link
          v-for="ev in events"
          :key="ev.id"
          :to="`/event/${ev.id}`"
          class="event-card ui-card"
        >
          <div class="event-card-header">
            <span class="event-badge badge-format">{{ formatLabel(ev.format) }}</span>
            <span class="event-badge" :class="'badge-' + ev.status?.toLowerCase()">{{ statusLabel(ev.status) }}</span>
          </div>
          <h3 class="event-card-title">{{ ev.title }}</h3>
          <div class="event-card-meta">
            <span class="meta-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {{ formatTime(ev.startTime) }}
            </span>
            <span v-if="ev.location" class="meta-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {{ ev.location }}
            </span>
          </div>
          <div class="event-card-footer">
            <span class="teams-count">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {{ ev.registrationCount || 0 }}/{{ ev.bracketSize }} 队
            </span>
            <span class="event-card-arrow">&rsaquo;</span>
          </div>
        </router-link>
      </section>

      <div v-if="hasMore" class="load-more">
        <button class="ui-button ui-button-ghost" :disabled="loading" @click="loadMore">
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { event as eventApi } from '@/api'

const loading = ref(false)
const events = ref([])
const currentFilter = ref('ALL')
const page = ref(0)
const hasMore = ref(false)

const filters = [
  { label: '全部', value: 'ALL' },
  { label: '报名中', value: 'REGISTERING' },
  { label: '进行中', value: 'IN_PROGRESS' },
  { label: '已结束', value: 'ENDED' },
  { label: '已取消', value: 'CANCELLED' }
]

const formatMap = {
  SINGLE_ELIMINATION: '单败淘汰',
  GROUP_ELIMINATION: '小组+淘汰'
}

const statusMap = {
  REGISTERING: '报名中',
  IN_PROGRESS: '进行中',
  ENDED: '已结束',
  CANCELLED: '已取消'
}

function formatLabel(format) {
  return formatMap[format] || format
}

function statusLabel(status) {
  return statusMap[status] || status
}

function formatTime(time) {
  if (!time) return ''
  const d = new Date(time)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hour}:${min}`
}

async function loadEvents(reset = false) {
  if (reset) {
    page.value = 0
    events.value = []
  }
  loading.value = true
  try {
    const res = await eventApi.list(page.value, 10)
    const data = res.data
    let list = data?.content || data || []
    if (currentFilter.value !== 'ALL') {
      list = list.filter(e => e.status === currentFilter.value)
    }
    if (reset) {
      events.value = list
    } else {
      events.value.push(...list)
    }
    hasMore.value = data ? (page.value + 1) < data.totalPages : false
  } catch (e) {
    console.error('加载赛事列表失败:', e)
  } finally {
    loading.value = false
  }
}

function switchFilter(value) {
  currentFilter.value = value
  loadEvents(true)
}

function loadMore() {
  page.value++
  loadEvents(false)
}

onMounted(() => {
  loadEvents(true)
})
</script>

<style scoped>
.events-page {
  min-height: calc(100vh - 72px);
  padding: var(--space-6);
}

.events-container {
  max-width: 900px;
  margin: 0 auto;
}

.events-header {
  padding: var(--space-5);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.events-title {
  font-size: var(--text-lg);
  font-weight: 700;
  margin: 0;
}

.events-filters {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-4);
  overflow-x: auto;
}

.filter-btn {
  padding: var(--space-2) var(--space-4);
  border: none;
  background: transparent;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.filter-btn:hover {
  background: var(--color-bg-soft);
  color: var(--color-text);
}

.filter-btn.active {
  background: var(--color-primary);
  color: white;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.event-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-5);
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-fast);
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.event-card-header {
  display: flex;
  gap: var(--space-2);
}

.event-badge {
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
}

.badge-format {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.badge-registering {
  background: #e6f7ff;
  color: #1890ff;
}

.badge-in_progress {
  background: #f6ffed;
  color: #52c41a;
}

.badge-ended {
  background: var(--color-bg-soft);
  color: var(--color-text-muted);
}

.badge-cancelled {
  background: #fff1f0;
  color: #ff4d4f;
}

.event-card-title {
  font-size: var(--text-base);
  font-weight: 600;
  margin: 0;
  line-height: 1.4;
}

.event-card-meta {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.meta-item svg {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.event-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border-light);
}

.teams-count {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-primary);
}

.event-card-arrow {
  font-size: 20px;
  color: var(--color-text-muted);
  line-height: 1;
}

.load-more {
  text-align: center;
  padding: var(--space-6) 0;
}

@media (max-width: 640px) {
  .events-page {
    padding: var(--space-4);
  }

  .events-header {
    flex-direction: column;
    gap: var(--space-3);
    align-items: stretch;
  }
}
</style>
