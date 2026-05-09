<template>
  <div class="feedback-page ui-page">
    <div class="feedback-container">
      <header class="feedback-header ui-card">
        <h1 class="feedback-title">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          问题反馈
        </h1>
        <nav class="tab-nav">
          <button
            class="tab-btn"
            :class="{ active: tab === 'submit' }"
            @click="tab = 'submit'"
          >提交反馈</button>
          <button
            class="tab-btn"
            :class="{ active: tab === 'mine' }"
            @click="tab = 'mine'; loadMyFeedback()"
          >我的反馈</button>
        </nav>
      </header>

      <!-- 提交反馈 -->
      <div v-if="tab === 'submit'" class="ui-card feedback-form-card">
        <div class="form-group">
          <label>反馈标题 <span class="required">*</span></label>
          <input v-model="form.title" type="text" placeholder="简要描述你的问题或建议" maxlength="200" />
        </div>
        <div class="form-group">
          <label>反馈分类 <span class="required">*</span></label>
          <div class="category-options">
            <button
              v-for="c in categories"
              :key="c.value"
              type="button"
              class="category-btn"
              :class="{ active: form.category === c.value, ['cat-' + c.value.toLowerCase()]: true }"
              @click="form.category = c.value"
            >{{ c.label }}</button>
          </div>
        </div>
        <div class="form-group">
          <label>详细描述 <span class="required">*</span></label>
          <textarea v-model="form.content" placeholder="请详细描述你遇到的问题或建议，以便我们更好地处理" rows="6"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="submitFeedback" :disabled="submitting">
            {{ submitting ? '提交中...' : '提交反馈' }}
          </button>
        </div>
      </div>

      <!-- 我的反馈 -->
      <template v-if="tab === 'mine'">
        <div v-if="loading" class="ui-card ui-loading">加载中...</div>
        <div v-else-if="feedbacks.length === 0" class="ui-card ui-empty">
          暂无反馈记录
        </div>
        <div v-else class="feedback-list">
          <div
            v-for="f in feedbacks"
            :key="f.id"
            class="feedback-item ui-card"
            :class="{ expanded: expandedId === f.id }"
          >
            <div class="item-header" @click="toggleExpand(f.id)">
              <div class="item-left">
                <span class="category-tag" :class="'cat-' + f.category?.toLowerCase()">
                  {{ categoryLabel(f.category) }}
                </span>
                <span class="status-tag" :class="'st-' + f.status?.toLowerCase()">
                  {{ statusLabel(f.status) }}
                </span>
                <span class="item-title">{{ f.title }}</span>
              </div>
              <div class="item-right">
                <span class="item-time">{{ formatTime(f.createdAt) }}</span>
                <svg
                  class="expand-arrow"
                  :class="{ open: expandedId === f.id }"
                  viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
            <div v-if="expandedId === f.id" class="item-detail">
              <div class="detail-section">
                <div class="detail-label">反馈内容</div>
                <div class="detail-text">{{ f.content }}</div>
              </div>
              <div v-if="f.reply" class="detail-section reply-section">
                <div class="detail-label">
                  管理员回复
                  <span class="reply-meta">{{ f.repliedBy?.nickname }} · {{ formatTime(f.repliedAt) }}</span>
                </div>
                <div class="detail-text reply-text">{{ f.reply }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="totalPages > 1" class="load-more">
          <button
            class="btn btn-ghost"
            :disabled="loading || page >= totalPages - 1"
            @click="page++; loadMyFeedback()"
          >加载更多</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { feedback } from '@/api'
import { toastBus } from '@/utils/toast'

const tab = ref('submit')
const form = ref({ title: '', content: '', category: 'BUG' })
const submitting = ref(false)

const feedbacks = ref([])
const loading = ref(false)
const page = ref(0)
const totalPages = ref(0)
const expandedId = ref(null)

const categories = [
  { label: '问题', value: 'BUG' },
  { label: '建议', value: 'SUGGESTION' },
  { label: '其他', value: 'OTHER' }
]

const statusMap = { PENDING: '待处理', REPLIED: '已回复', CLOSED: '已关闭' }
const categoryMap = { BUG: '问题', SUGGESTION: '建议', OTHER: '其他' }

function statusLabel(s) { return statusMap[s] || s }
function categoryLabel(c) { return categoryMap[c] || c }

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}月${day}日 ${h}:${min}`
}

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

async function submitFeedback() {
  if (!form.value.title.trim()) { toastBus.warning('请输入反馈标题'); return }
  if (!form.value.content.trim()) { toastBus.warning('请输入反馈内容'); return }
  submitting.value = true
  try {
    await feedback.create(form.value)
    toastBus.success('反馈提交成功')
    form.value = { title: '', content: '', category: 'BUG' }
    tab.value = 'mine'
    page.value = 0
    await loadMyFeedback()
  } catch (e) {
    toastBus.error(e.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

async function loadMyFeedback() {
  loading.value = true
  try {
    const res = await feedback.getMine(page.value, 10)
    const data = res.data
    if (page.value === 0) {
      feedbacks.value = data?.content || []
    } else {
      feedbacks.value.push(...(data?.content || []))
    }
    totalPages.value = data?.totalPages || 0
  } catch (e) {
    toastBus.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 默认加载我的反馈看看有没有数据，或保持在提交页
})
</script>

<style scoped>
.feedback-page {
  min-height: calc(100vh - 72px);
  padding: var(--space-6);
}

.feedback-container {
  max-width: 720px;
  margin: 0 auto;
}

.feedback-header {
  padding: var(--space-5);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-4);
}

.feedback-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0 0 var(--space-4);
  font-size: var(--text-lg);
  font-weight: 700;
}

.tab-nav {
  display: flex;
  gap: var(--space-1);
  background: var(--color-bg-soft);
  border-radius: var(--radius-lg);
  padding: 3px;
}

.tab-btn {
  flex: 1;
  padding: var(--space-2) var(--space-4);
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--color-text);
}

.tab-btn.active {
  background: white;
  color: var(--color-text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* 表单 */
.feedback-form-card {
  padding: var(--space-6);
  border-radius: var(--radius-xl);
}

.form-group {
  margin-bottom: var(--space-lg);
}

.form-group label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.required {
  color: var(--color-error);
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-group textarea {
  resize: vertical;
}

.category-options {
  display: flex;
  gap: var(--space-2);
}

.category-btn {
  padding: var(--space-2) var(--space-lg);
  border: 1.5px solid var(--color-border);
  background: white;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.category-btn:hover {
  border-color: var(--color-text-muted);
}

.category-btn.active.cat-bug {
  border-color: #ff4d4f;
  background: #fff1f0;
  color: #ff4d4f;
}

.category-btn.active.cat-suggestion {
  border-color: #52c41a;
  background: #f6ffed;
  color: #52c41a;
}

.category-btn.active.cat-other {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border-light);
}

/* 按钮 */
.btn {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-ghost {
  background: none;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

/* 反馈列表 */
.feedback-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.feedback-item {
  overflow: hidden;
  transition: all var(--transition-fast);
}

.feedback-item.expanded {
  border-color: var(--color-primary);
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.item-header:hover {
  background: var(--color-bg-soft);
}

.item-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  flex: 1;
}

.item-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.item-title {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.expand-arrow {
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
  flex-shrink: 0;
}

.expand-arrow.open {
  transform: rotate(180deg);
}

.category-tag {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
}

.cat-bug { background: #fff1f0; color: #ff4d4f; }
.cat-suggestion { background: #f6ffed; color: #52c41a; }
.cat-other { background: var(--color-primary-soft); color: var(--color-primary); }

.status-tag {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
}

.st-pending { background: #fff7e6; color: #fa8c16; }
.st-replied { background: #f6ffed; color: #52c41a; }
.st-closed { background: var(--color-bg-soft); color: var(--color-text-muted); }

/* 详情 */
.item-detail {
  padding: 0 var(--space-lg) var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.detail-section {
  padding-top: var(--space-md);
}

.detail-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reply-meta {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  margin-left: var(--space-2);
}

.detail-text {
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: 1.7;
  white-space: pre-wrap;
}

.reply-section {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: var(--color-bg-soft);
  border-radius: var(--radius-md);
}

.reply-text {
  color: var(--color-text);
}

.ui-loading {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-secondary);
  border-radius: var(--radius-xl);
}

.ui-empty {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  border-radius: var(--radius-xl);
}

.load-more {
  text-align: center;
  padding: var(--space-6) 0;
}

@media (max-width: 640px) {
  .feedback-page {
    padding: var(--space-4);
  }

  .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .item-right {
    width: 100%;
    justify-content: space-between;
  }

  .category-options {
    flex-wrap: wrap;
  }
}
</style>
