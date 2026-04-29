<template>
  <div class="admin-events">
    <div class="admin-page-header">
      <h1>赛事管理</h1>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner spinner-lg"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="events.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <h3>暂无赛事数据</h3>
      <p>系统中还没有任何赛事或活动</p>
    </div>

    <div v-else class="admin-table-container ui-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>类型</th>
            <th>状态</th>
            <th>时间</th>
            <th>地点</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in events" :key="e.id">
            <td>{{ e.id }}</td>
            <td>{{ e.title }}</td>
            <td>
              <span class="type-badge" :class="e.type.toLowerCase()">
                {{ e.type === 'MATCH' ? '比赛' : '活动' }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="e.status.toLowerCase()">{{ statusText(e.status) }}</span>
            </td>
            <td>{{ formatTime(e.startTime) }}</td>
            <td>{{ e.location }}</td>
            <td>
              <select class="status-select" :value="e.status" @change="changeStatus(e, $event.target.value)">
                <option value="PREPARING">筹备中</option>
                <option value="REGISTERING">报名中</option>
                <option value="IN_PROGRESS">进行中</option>
                <option value="ENDED">已结束</option>
                <option value="CANCELLED">已取消</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="admin-pagination">
        <button class="btn btn-secondary" :disabled="page <= 0" @click="page--; loadEvents()">上一页</button>
        <span>第 {{ page + 1 }} 页</span>
        <button class="btn btn-secondary" :disabled="!hasMore" @click="page++; loadEvents()">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { admin } from '@/api'
import { toastBus } from '@/utils/toast'

const events = ref([])
const page = ref(0)
const size = 10
const hasMore = ref(false)
const loading = ref(false)

async function loadEvents() {
  loading.value = true
  try {
    const res = await admin.getEvents({ page: page.value, size })
    events.value = res.data.content || res.data || []
    hasMore.value = events.value.length === size
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function changeStatus(e, newStatus) {
  if (newStatus === e.status) return
  try {
    await admin.updateEventStatus(e.id, newStatus)
    toastBus.success('状态已更新')
    loadEvents()
  } catch (err) {
    toastBus.error(err.message || '更新失败')
  }
}

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
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
.admin-events {
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

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
}

.type-badge.match {
  background: #e8f4ff;
  color: #1890ff;
}

.type-badge.activity {
  background: #fff7e6;
  color: #fa8c16;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.status-badge.preparing {
  background: #f5f5f5;
  color: #999;
}

.status-badge.registering {
  background: #f6ffed;
  color: #52c41a;
}

.status-badge.in_progress {
  background: #fff7e6;
  color: #fa8c16;
}

.status-badge.ended {
  background: #f5f5f5;
  color: #999;
}

.status-badge.cancelled {
  background: #fff1f0;
  color: #ff4d4f;
}

.status-select {
  padding: var(--space-1) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  background: white;
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

.btn-secondary {
  background: var(--color-bg-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.admin-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  padding: var(--space-lg);
}
</style>
