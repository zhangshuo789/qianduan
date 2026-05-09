<template>
  <div class="admin-announcements">
    <div class="admin-page-header">
      <h1>公告管理</h1>
      <button class="btn btn-primary" @click="openCreate">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        发布公告
      </button>
    </div>

    <div class="ui-card">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-else-if="announcements.length === 0" class="empty-state-small">
        <span>暂无公告，点击上方按钮发布公告</span>
      </div>
      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>置顶</th>
            <th>发布者</th>
            <th>发布时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in announcements" :key="a.id">
            <td>{{ a.id }}</td>
            <td class="title-cell">{{ a.title }}</td>
            <td>
              <span v-if="a.pinned" class="pin-badge">置顶</span>
              <span v-else class="pin-badge pin-off">-</span>
            </td>
            <td>{{ a.publishedBy?.nickname || '-' }}</td>
            <td>{{ formatTime(a.createdAt) }}</td>
            <td class="action-cell">
              <button class="btn btn-sm btn-secondary" @click="openEdit(a)">编辑</button>
              <button class="btn btn-sm btn-danger" @click="confirmDelete(a)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="pagination">
        <button
          class="btn btn-sm btn-secondary"
          :disabled="page <= 0"
          @click="page--; loadAnnouncements()"
        >上一页</button>
        <span class="page-info">{{ page + 1 }} / {{ totalPages }}</span>
        <button
          class="btn btn-sm btn-secondary"
          :disabled="page >= totalPages - 1"
          @click="page++; loadAnnouncements()"
        >下一页</button>
      </div>
    </div>

    <!-- 创建/编辑弹窗 -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
      <div class="modal ui-card modal-lg">
        <h3>{{ editingId ? '编辑公告' : '发布公告' }}</h3>
        <div class="form-group">
          <label>标题 <span class="required">*</span></label>
          <input v-model="form.title" type="text" placeholder="请输入公告标题" maxlength="200" />
        </div>
        <div class="form-group">
          <label>内容 <span class="required">*</span></label>
          <textarea v-model="form.content" placeholder="请输入公告内容" rows="8"></textarea>
        </div>
        <div class="form-group">
          <label class="switch-label">
            <span class="switch-text">置顶公告</span>
            <button
              type="button"
              class="switch"
              :class="{ active: form.pinned }"
              @click="form.pinned = !form.pinned"
            >
              <span class="switch-knob"></span>
            </button>
          </label>
          <p class="form-hint">置顶公告将始终显示在列表最前面</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showModal = false">取消</button>
          <button class="btn btn-primary" @click="submit" :disabled="submitting">
            {{ submitting ? '提交中...' : (editingId ? '保存修改' : '发布公告') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div class="modal-overlay" v-if="showDeleteModal" @click.self="showDeleteModal = false">
      <div class="modal ui-card">
        <h3>确认删除</h3>
        <p class="delete-text">确定要删除公告「{{ deletingItem?.title }}」吗？此操作不可撤销。</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteModal = false">取消</button>
          <button class="btn btn-danger" @click="doDelete" :disabled="deleting">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { announcement } from '@/api'
import { toastBus } from '@/utils/toast'

const announcements = ref([])
const loading = ref(false)
const page = ref(0)
const totalPages = ref(0)

const showModal = ref(false)
const editingId = ref(null)
const form = ref({ title: '', content: '', pinned: false })
const submitting = ref(false)

const showDeleteModal = ref(false)
const deletingItem = ref(null)
const deleting = ref(false)

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

async function loadAnnouncements() {
  loading.value = true
  try {
    const res = await announcement.list(page.value, 10)
    const data = res.data
    announcements.value = data?.content || []
    totalPages.value = data?.totalPages || 0
  } catch (e) {
    toastBus.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { title: '', content: '', pinned: false }
  showModal.value = true
}

function openEdit(item) {
  editingId.value = item.id
  form.value = {
    title: item.title,
    content: item.content,
    pinned: item.pinned
  }
  showModal.value = true
}

async function submit() {
  if (!form.value.title.trim()) {
    toastBus.warning('请输入公告标题')
    return
  }
  if (!form.value.content.trim()) {
    toastBus.warning('请输入公告内容')
    return
  }
  submitting.value = true
  try {
    if (editingId.value) {
      await announcement.update(editingId.value, form.value)
      toastBus.success('公告已更新')
    } else {
      await announcement.create(form.value)
      toastBus.success('公告已发布')
    }
    showModal.value = false
    await loadAnnouncements()
  } catch (e) {
    toastBus.error(e.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

function confirmDelete(item) {
  deletingItem.value = item
  showDeleteModal.value = true
}

async function doDelete() {
  deleting.value = true
  try {
    await announcement.delete(deletingItem.value.id)
    toastBus.success('公告已删除')
    showDeleteModal.value = false
    await loadAnnouncements()
  } catch (e) {
    toastBus.error(e.message || '删除失败')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadAnnouncements()
})
</script>

<style scoped>
.admin-announcements {
  max-width: 900px;
}

.admin-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xl);
}

.admin-page-header h1 {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
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

.title-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pin-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  background: #fff1f0;
  color: #ff4d4f;
}

.pin-off {
  background: transparent;
  color: var(--color-text-muted);
}

.action-cell {
  display: flex;
  gap: var(--space-2);
  white-space: nowrap;
}

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

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-bg-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-danger {
  background: var(--color-error);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 400px;
  padding: var(--space-xl);
  background: white;
  border-radius: var(--radius-xl);
}

.modal-lg {
  max-width: 560px;
}

.modal h3 {
  margin: 0 0 var(--space-lg);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
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

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color var(--transition-fast);
}

.form-group input[type="text"]:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.switch-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.switch-text {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.switch {
  position: relative;
  width: 44px;
  height: 24px;
  background: var(--color-border);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
  padding: 0;
}

.switch.active {
  background: var(--color-primary);
}

.switch-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.switch.active .switch-knob {
  transform: translateX(20px);
}

.modal-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
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

.required {
  color: var(--color-error);
}

.form-hint {
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.delete-text {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
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
