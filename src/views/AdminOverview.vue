<template>
  <div class="admin-overview">
    <div class="admin-page-header">
      <h1>系统概览</h1>
      <p class="header-subtitle">欢迎回来，管理员</p>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner spinner-lg"></div>
      <span>加载中...</span>
    </div>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon users">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalUsers || 0 }}</span>
            <span class="stat-label">注册用户</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon posts">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalPosts || 0 }}</span>
            <span class="stat-label">帖子总数</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon comments">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalComments || 0 }}</span>
            <span class="stat-label">评论总数</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon events">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalEvents || 0 }}</span>
            <span class="stat-label">赛事活动</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon groups">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalGroups || 0 }}</span>
            <span class="stat-label">群聊数量</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon reports">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
              <line x1="4" y1="22" x2="4" y2="15"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.pendingReports || 0 }}</span>
            <span class="stat-label">待处理举报</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon disabled">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.disabledUsers || 0 }}</span>
            <span class="stat-label">已禁用用户</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon total-reports">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalReports || 0 }}</span>
            <span class="stat-label">举报总数</span>
          </div>
        </div>
      </div>

      <div class="overview-grid">
        <div class="overview-section ui-card">
          <div class="section-header">
            <h2>快捷操作</h2>
          </div>
          <div class="quick-actions">
            <router-link to="/admin/users" class="quick-action-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              <span>用户管理</span>
            </router-link>
            <router-link to="/admin/reports" class="quick-action-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
              <span>内容审核</span>
              <span v-if="stats.pendingReports > 0" class="action-badge">{{ stats.pendingReports }}</span>
            </router-link>
            <router-link to="/admin/events" class="quick-action-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
              </svg>
              <span>赛事管理</span>
            </router-link>
            <router-link to="/admin/settings" class="quick-action-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span>系统配置</span>
            </router-link>
          </div>
        </div>

        <div class="overview-section ui-card">
          <div class="section-header">
            <h2>系统状态</h2>
          </div>
          <div class="status-list">
            <div class="status-item">
              <div class="status-dot online"></div>
              <span class="status-name">后端服务</span>
              <span class="status-value online">运行正常</span>
            </div>
            <div class="status-item">
              <div class="status-dot online"></div>
              <span class="status-name">数据库连接</span>
              <span class="status-value online">正常</span>
            </div>
            <div class="status-item">
              <div class="status-dot online"></div>
              <span class="status-name">SSE推送服务</span>
              <span class="status-value online">正常</span>
            </div>
          </div>
        </div>

        <div class="overview-section ui-card">
          <div class="section-header">
            <h2>最近活动</h2>
          </div>
          <div v-if="recentActivities.length === 0" class="empty-state-small">
            <span>暂无最近活动</span>
          </div>
          <div v-else class="activity-list">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-icon" :class="activity.type">
                <svg v-if="activity.type === 'user'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <svg v-else-if="activity.type === 'post'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                </svg>
              </div>
              <div class="activity-content">
                <span class="activity-text">{{ activity.message }}</span>
                <span class="activity-time">{{ formatTime(activity.time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { admin } from '@/api'

const loading = ref(true)
const stats = ref({
  totalUsers: 0,
  totalPosts: 0,
  totalComments: 0,
  totalEvents: 0,
  totalGroups: 0,
  totalReports: 0,
  pendingReports: 0,
  disabledUsers: 0
})
const recentActivities = ref([])

async function loadStats() {
  try {
    const res = await admin.getOverview()
    if (res.data) {
      stats.value = {
        totalUsers: res.data.totalUsers || 0,
        totalPosts: res.data.totalPosts || 0,
        totalComments: res.data.totalComments || 0,
        totalEvents: res.data.totalEvents || 0,
        totalGroups: res.data.totalGroups || 0,
        totalReports: res.data.totalReports || 0,
        pendingReports: res.data.pendingReports || 0,
        disabledUsers: res.data.disabledUsers || 0
      }
    }
  } catch (e) {
    console.error('加载统计数据失败:', e)
  }
}

function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

onMounted(async () => {
  await loadStats()
  loading.value = false
})
</script>

<style scoped>
.admin-overview {
  max-width: 1200px;
}

.admin-page-header {
  margin-bottom: var(--space-xl);
}

.admin-page-header h1 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--space-1);
}

.header-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  gap: var(--space-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.stat-card {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.users {
  background: #e8f4ff;
  color: #1890ff;
}

.stat-icon.posts {
  background: #f6ffed;
  color: #52c41a;
}

.stat-icon.comments {
  background: #f0f5ff;
  color: #597ef7;
}

.stat-icon.events {
  background: #fff7e6;
  color: #fa8c16;
}

.stat-icon.groups {
  background: #fcffe6;
  color: #bae637;
}

.stat-icon.reports {
  background: #fff1f0;
  color: #ff4d4f;
}

.stat-icon.disabled {
  background: #f5f5f5;
  color: #8c8c8c;
}

.stat-icon.total-reports {
  background: #fff0f6;
  color: #eb2f96;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
}

.overview-section {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  border: 1px solid var(--color-border-light);
}

.section-header {
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
}

.section-header h2 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-bg-soft);
  border-radius: var(--radius-lg);
  color: var(--color-text);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.quick-action-btn:hover {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.action-badge {
  margin-left: auto;
  background: var(--color-error);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: #52c41a;
}

.status-dot.offline {
  background: #ff4d4f;
}

.status-name {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-text);
}

.status-value {
  font-size: var(--text-sm);
  font-weight: 500;
}

.status-value.online {
  color: #52c41a;
}

.status-value.offline {
  color: #ff4d4f;
}

.empty-state-small {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.user {
  background: #e8f4ff;
  color: #1890ff;
}

.activity-icon.post {
  background: #f6ffed;
  color: #52c41a;
}

.activity-icon.report {
  background: #fff7e6;
  color: #fa8c16;
}

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.activity-text {
  font-size: var(--text-sm);
  color: var(--color-text);
}

.activity-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
