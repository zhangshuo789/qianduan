<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="announcement-modal">
      <div class="modal-header">
        <h2 class="modal-title">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/>
          </svg>
          社区公告
        </h2>
        <button class="close-btn" @click="$emit('close')">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- 列表视图 -->
        <template v-if="!currentDetail">
          <div v-if="loading" class="modal-loading">加载中...</div>
          <div v-else-if="announcements.length === 0" class="modal-empty">暂无公告</div>
          <div v-else class="announcement-list">
            <div
              v-for="a in announcements"
              :key="a.id"
              class="announcement-item"
              @click="viewDetail(a)"
            >
              <div class="item-row">
                <span v-if="a.pinned" class="pin-badge">置顶</span>
                <span class="item-title">{{ a.title }}</span>
                <span class="item-time">{{ formatTime(a.createdAt) }}</span>
              </div>
              <p class="item-excerpt">{{ excerpt(a.content) }}</p>
            </div>
          </div>
          <div v-if="totalPages > 1 && !loading" class="load-more-row">
            <button
              class="load-more-btn"
              :disabled="page >= totalPages - 1"
              @click="page++; loadAnnouncements()"
            >加载更多</button>
          </div>
        </template>

        <!-- 详情视图 -->
        <template v-else>
          <button class="back-btn" @click="currentDetail = null">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            返回列表
          </button>
          <div class="detail-title-row">
            <span v-if="currentDetail.pinned" class="pin-badge">置顶</span>
            <h3 class="detail-title">{{ currentDetail.title }}</h3>
          </div>
          <div class="detail-meta">
            <span>{{ currentDetail.publishedBy?.nickname || '管理员' }}</span>
            <span class="meta-dot">·</span>
            <span>{{ formatTime(currentDetail.createdAt) }}</span>
          </div>
          <div class="detail-content" v-html="renderContent(currentDetail.content)"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { announcement } from '@/api'

defineEmits(['close'])

const announcements = ref([])
const loading = ref(false)
const page = ref(0)
const totalPages = ref(0)
const currentDetail = ref(null)

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}月${day}日 ${h}:${min}`
}

function excerpt(content) {
  if (!content) return ''
  const text = content.replace(/<[^>]*>/g, '')
  return text.length > 80 ? text.slice(0, 80) + '...' : text
}

function renderContent(content) {
  if (!content) return ''
  return content.replace(/\n/g, '<br>')
}

async function loadAnnouncements() {
  loading.value = true
  try {
    const res = await announcement.list(page.value, 20)
    const data = res.data
    if (page.value === 0) {
      announcements.value = data?.content || []
    } else {
      announcements.value.push(...(data?.content || []))
    }
    totalPages.value = data?.totalPages || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function viewDetail(item) {
  currentDetail.value = item
}

onMounted(() => {
  loadAnnouncements()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.announcement-modal {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: modalIn 0.2s ease-out;
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-xl);
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-bg-soft);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--color-border-light);
  color: var(--color-text);
}

.modal-body {
  padding: var(--space-lg) var(--space-xl);
  overflow-y: auto;
  flex: 1;
}

.modal-loading,
.modal-empty {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.announcement-list {
  display: flex;
  flex-direction: column;
}

.announcement-item {
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-item:hover {
  background: var(--color-bg-soft);
  margin: 0 calc(var(--space-md) * -1);
  padding-left: var(--space-md);
  padding-right: var(--space-md);
  border-radius: var(--radius-md);
}

.item-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.item-title {
  flex: 1;
  min-width: 0;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-time {
  flex-shrink: 0;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.item-excerpt {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.pin-badge {
  flex-shrink: 0;
  display: inline-block;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 700;
  background: #fff1f0;
  color: #ff4d4f;
}

.load-more-row {
  text-align: center;
  padding-top: var(--space-md);
}

.load-more-btn {
  border: none;
  background: none;
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.load-more-btn:hover:not(:disabled) {
  background: var(--color-primary-soft);
}

.load-more-btn:disabled {
  color: var(--color-text-muted);
  cursor: default;
}

/* 详情视图 */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  border: none;
  background: none;
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-bottom: var(--space-md);
}

.detail-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.detail-title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.4;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
}

.meta-dot {
  color: var(--color-border);
}

.detail-content {
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: 1.8;
}

@media (max-width: 640px) {
  .announcement-modal {
    max-height: 90vh;
  }

  .modal-header {
    padding: var(--space-md) var(--space-lg);
  }

  .modal-body {
    padding: var(--space-md) var(--space-lg);
  }
}
</style>
