<template>
  <div class="admin-feedback">
    <div class="admin-page-header">
      <h1>反馈管理</h1>
    </div>

    <nav class="filter-bar">
      <button
        v-for="f in filters"
        :key="f.value"
        class="filter-btn"
        :class="{ active: currentFilter === f.value }"
        @click="switchFilter(f.value)"
      >{{ f.label }}<span v-if="f.count != null" class="filter-count">{{ f.count }}</span></button>
    </nav>

    <div class="ui-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-else-if="feedbacks.length === 0" class="empty-state-small">
        暂无反馈数据
      </div>
      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户</th>
            <th>标题</th>
            <th>分类</th>
            <th>状态</th>
            <th>提交时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in feedbacks" :key="f.id" :class="{ 'row-pending': f.status === 'PENDING' }">
            <td>{{ f.id }}</td>
            <td>{{ f.userNickname || '-' }}</td>
            <td class="title-cell">{{ f.title }}</td>
            <td>
              <span class="category-tag" :class="'cat-' + f.category?.toLowerCase()">
                {{ categoryLabel(f.category) }}
              </span>
            </td>
            <td>
              <span class="status-tag" :class="'st-' + f.status?.toLowerCase()">
                {{ statusLabel(f.status) }}
              </span>
            </td>
            <td class="time-cell">{{ formatTime(f.createdAt) }}</td>
            <td class="action-cell">
              <button class="btn btn-sm btn-primary" @click="openDetail(f)">查看</button>
              <button
                v-if="f.status !== 'CLOSED'"
                class="btn btn-sm btn-danger"
                @click="closeFeedback(f)"
              >关闭</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="pagination">
        <button class="btn btn-sm btn-secondary" :disabled="page <= 0" @click="page--; loadFeedbacks()">上一页</button>
        <span class="page-info">{{ page + 1 }} / {{ totalPages }}</span>
        <button class="btn btn-sm btn-secondary" :disabled="page >= totalPages - 1" @click="page++; loadFeedbacks()">下一页</button>
      </div>
    </div>

    <!-- 详情/回复弹窗 -->
    <div class="modal-overlay" v-if="showDetail" @click.self="showDetail = false">
      <div class="modal ui-card modal-lg">
        <div class="modal-header">
          <h3>反馈详情</h3>
          <button class="close-btn" @click="showDetail = false">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="detail-body">
          <div class="detail-row">
            <span class="category-tag" :class="'cat-' + current.category?.toLowerCase()">{{ categoryLabel(current.category) }}</span>
            <span class="status-tag" :class="'st-' + current.status?.toLowerCase()">{{ statusLabel(current.status) }}</span>
          </div>
          <h4 class="detail-title">{{ current.title }}</h4>
          <div class="detail-meta">
            <span>{{ current.userNickname || '匿名用户' }}</span>
            <span class="meta-dot">·</span>
            <span>{{ formatTime(current.createdAt) }}</span>
          </div>
          <div class="detail-content">{{ current.content }}</div>

          <!-- 已有回复 -->
          <div v-if="current.reply" class="reply-box">
            <div class="reply-header">
              <span class="reply-label">管理员回复</span>
              <span class="reply-meta">{{ current.repliedBy?.nickname }} · {{ formatTime(current.repliedAt) }}</span>
            </div>
            <div class="reply-content">{{ current.reply }}</div>
          </div>

          <!-- 回复输入 -->
          <div v-if="current.status !== 'CLOSED'" class="reply-form">
            <label>{{ current.reply ? '追加回复' : '回复反馈' }}</label>
            <textarea v-model="replyText" placeholder="输入回复内容..." rows="4"></textarea>
            <div class="reply-actions">
              <button class="btn btn-secondary" @click="showDetail = false">取消</button>
              <button class="btn btn-primary" @click="sendReply" :disabled="replying">
                {{ replying ? '发送中...' : '发送回复' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { feedback } from '@/api'
import { toastBus } from '@/utils/toast'

const feedbacks = ref([])
const loading = ref(false)
const page = ref(0)
const totalPages = ref(0)
const currentFilter = ref('')

const showDetail = ref(false)
const current = ref({})
const replyText = ref('')
const replying = ref(false)
const pendingCount = ref(0)

const filters = ref([
  { label: '全部', value: '', count: null },
  { label: '待处理', value: 'PENDING', count: 0 },
  { label: '已回复', value: 'REPLIED', count: null },
  { label: '已关闭', value: 'CLOSED', count: null }
])

const statusMap = { PENDING: '待处理', REPLIED: '已回复', CLOSED: '已关闭' }
const categoryMap = { BUG: '问题', SUGGESTION: '建议', OTHER: '其他' }

function statusLabel(s) { return statusMap[s] || s }
function categoryLabel(c) { return categoryMap[c] || c }

function formatTime(t) {
  if (!t) return '-'
  const d = new Date(t)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

function switchFilter(value) {
  currentFilter.value = value
  page.value = 0
  loadFeedbacks()
}

async function loadFeedbacks() {
  loading.value = true
  try {
    const res = await feedback.getAll({ page: page.value, size: 10, status: currentFilter.value || undefined })
    const data = res.data
    feedbacks.value = data?.content || []
    totalPages.value = data?.totalPages || 0
  } catch (e) {
    toastBus.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

async function loadPendingCount() {
  try {
    const res = await feedback.getAll({ page: 0, size: 1, status: 'PENDING' })
    pendingCount.value = res.data?.totalElements || 0
    filters.value[1].count = pendingCount.value
  } catch (e) {
    // ignore
  }
}

function openDetail(f) {
  current.value = { ...f }
  replyText.value = ''
  showDetail.value = true
}

async function sendReply() {
  if (!replyText.value.trim()) {
    toastBus.warning('请输入回复内容')
    return
  }
  replying.value = true
  try {
    const res = await feedback.reply(current.value.id, replyText.value)
    toastBus.success('回复成功')
    showDetail.value = false
    await loadFeedbacks()
    await loadPendingCount()
  } catch (e) {
    toastBus.error(e.message || '回复失败')
  } finally {
    replying.value = false
  }
}

async function closeFeedback(f) {
  if (!confirm(`确定关闭反馈「${f.title}」吗？`)) return
  try {
    await feedback.close(f.id)
    toastBus.success('反馈已关闭')
    await loadFeedbacks()
    await loadPendingCount()
  } catch (e) {
    toastBus.error(e.message || '操作失败')
  }
}

onMounted(() => {
  loadFeedbacks()
  loadPendingCount()
})
</script>

<style scoped>
.admin-feedback {
  max-width: 1000px;
}

.admin-page-header {
  margin-bottom: var(--space-xl);
}

.admin-page-header h1 {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  overflow-x: auto;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-lg);
  border: none;
  background: var(--color-card);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.filter-btn:hover {
  background: var(--color-bg-soft);
  color: var(--color-text);
}

.filter-btn.active {
  background: var(--color-primary);
  color: white;
}

.filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 700;
  background: #fff1f0;
  color: #ff4d4f;
}

.filter-btn.active .filter-count {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

/* 表格 */
.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  padding: var(--space-md);
  text-align: left;
  border-bottom: 1px solid var(--color-border-light);
}

.admin-table th {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  background: var(--color-bg-soft);
}

.admin-table td {
  font-size: var(--text-sm);
  color: var(--color-text);
}

.row-pending {
  background: #fffbe6;
}

.title-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-cell {
  white-space: nowrap;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.action-cell {
  display: flex;
  gap: var(--space-2);
  white-space: nowrap;
}

/* 标签 */
.category-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
}

.cat-bug { background: #fff1f0; color: #ff4d4f; }
.cat-suggestion { background: #f6ffed; color: #52c41a; }
.cat-other { background: var(--color-primary-soft); color: var(--color-primary); }

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
}

.st-pending { background: #fff7e6; color: #fa8c16; }
.st-replied { background: #f6ffed; color: #52c41a; }
.st-closed { background: var(--color-bg-soft); color: var(--color-text-muted); }

/* 按钮 */
.btn {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.btn-sm {
  padding: var(--space-1) var(--space-sm);
  font-size: var(--text-xs);
}

.btn-primary { background: var(--color-primary); color: white; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: var(--color-bg-soft); color: var(--color-text); border: 1px solid var(--color-border); }
.btn-danger { background: var(--color-error); color: white; }

/* 弹窗 */
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

.modal {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: var(--radius-xl);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-lg {
  max-width: 580px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-xl);
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
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

.detail-body {
  padding: var(--space-xl);
  overflow-y: auto;
}

.detail-row {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-md);
}

.detail-title {
  margin: 0 0 var(--space-2);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--space-lg);
}

.meta-dot {
  color: var(--color-border);
}

.detail-content {
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: 1.7;
  white-space: pre-wrap;
  padding: var(--space-md);
  background: var(--color-bg-soft);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
}

.reply-box {
  background: #f0f9ff;
  border: 1px solid #bae7ff;
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
}

.reply-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.reply-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: #1890ff;
}

.reply-meta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.reply-content {
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: 1.7;
  white-space: pre-wrap;
}

.reply-form {
  border-top: 1px solid var(--color-border-light);
  padding-top: var(--space-lg);
}

.reply-form label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.reply-form textarea {
  width: 100%;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: inherit;
  box-sizing: border-box;
  resize: vertical;
  transition: border-color var(--transition-fast);
}

.reply-form textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

/* 状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-xl);
  color: var(--color-text-muted);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state-small {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  background: var(--color-bg-soft);
  border-radius: var(--radius-lg);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-4);
  border-top: 1px solid var(--color-border-light);
}

.page-info {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
</style>
