<template>
  <div class="admin-reports">
    <div class="admin-page-header">
      <h1>内容审核</h1>
    </div>

    <div class="admin-toolbar">
      <select v-model="statusFilter" class="admin-select" @change="loadReports">
        <option value="">全部</option>
        <option value="PENDING">待处理</option>
        <option value="RESOLVED">已处理</option>
        <option value="REJECTED">已驳回</option>
      </select>
    </div>

    <div class="admin-table-container ui-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>举报类型</th>
            <th>目标ID</th>
            <th>举报原因</th>
            <th>详细说明</th>
            <th>状态</th>
            <th>举报时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reports" :key="r.id">
            <td>{{ r.id }}</td>
            <td>
              <span class="type-badge">{{ r.targetType }}</span>
            </td>
            <td>{{ r.targetId }}</td>
            <td>{{ r.reason }}</td>
            <td class="detail-cell">{{ r.detail || '-' }}</td>
            <td>
              <span class="status-badge" :class="r.status.toLowerCase()">{{ statusText(r.status) }}</span>
            </td>
            <td>{{ formatTime(r.createdAt) }}</td>
            <td>
              <div class="action-buttons" v-if="r.status === 'PENDING'">
                <button class="btn btn-sm btn-success" @click="handleReport(r, true)">通过</button>
                <button class="btn btn-sm btn-danger" @click="handleReport(r, false)">驳回</button>
              </div>
              <span v-else class="handled-text">已处理</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="admin-pagination">
        <button class="btn btn-secondary" :disabled="page <= 0" @click="page--; loadReports()">上一页</button>
        <span>第 {{ page + 1 }} 页</span>
        <button class="btn btn-secondary" :disabled="!hasMore" @click="page++; loadReports()">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { admin } from '@/api'
import { toastBus } from '@/utils/toast'

const reports = ref([])
const page = ref(0)
const size = 10
const statusFilter = ref('')
const hasMore = ref(false)

async function loadReports() {
  try {
    const res = await admin.getReports({
      page: page.value,
      size,
      status: statusFilter.value
    })
    reports.value = res.data.content || res.data || []
    hasMore.value = reports.value.length === size
  } catch (e) {
    console.error(e)
  }
}

async function handleReport(r, approved) {
  const result = approved ? '已通过' : '已驳回'
  try {
    await admin.handleReport(r.id, approved, result)
    toastBus.success('处理成功')
    loadReports()
  } catch (e) {
    toastBus.error(e.message || '操作失败')
  }
}

function statusText(status) {
  const map = { PENDING: '待处理', RESOLVED: '已处理', REJECTED: '已驳回' }
  return map[status] || status
}

function formatTime(time) {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadReports()
})
</script>

<style scoped>
.admin-reports {
  max-width: 1200px;
}

.admin-page-header {
  margin-bottom: var(--space-xl);
}

.admin-page-header h1 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.admin-toolbar {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.admin-select {
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  background: white;
}

.admin-table-container {
  overflow-x: auto;
}

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

.detail-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  background: #e8f4ff;
  color: #1890ff;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.status-badge.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.status-badge.resolved {
  background: #f6ffed;
  color: #52c41a;
}

.status-badge.rejected {
  background: #fff1f0;
  color: #ff4d4f;
}

.action-buttons {
  display: flex;
  gap: var(--space-2);
}

.handled-text {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

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

.btn-secondary {
  background: var(--color-bg-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-danger {
  background: var(--color-error);
  color: white;
}

.btn-success {
  background: var(--color-success);
  color: white;
}

.admin-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  padding: var(--space-lg);
}
</style>
