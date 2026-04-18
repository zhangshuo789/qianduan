<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-sidebar-header">
        <h2>管理后台</h2>
      </div>
      <nav class="admin-nav">
        <router-link to="/admin/overview" class="admin-nav-item">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span>概览</span>
        </router-link>
        <router-link to="/admin/users" class="admin-nav-item">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>用户管理</span>
        </router-link>
        <router-link to="/admin/reports" class="admin-nav-item">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
          <span>内容审核</span>
          <span v-if="pendingCount > 0" class="admin-nav-badge">{{ pendingCount }}</span>
        </router-link>
        <router-link to="/admin/events" class="admin-nav-item">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>赛事管理</span>
        </router-link>
        <router-link to="/admin/groups" class="admin-nav-item">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>群聊管理</span>
        </router-link>
        <router-link to="/admin/settings" class="admin-nav-item">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>系统配置</span>
        </router-link>
      </nav>
    </aside>
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUser, admin } from '@/api'

const user = useUser()
const pendingCount = ref(0)

async function loadPendingCount() {
  try {
    const res = await admin.getPendingCount()
    pendingCount.value = res.data || 0
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadPendingCount()
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: calc(100vh - 72px);
  background: var(--color-bg-page);
}

.admin-sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.admin-sidebar-header {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.admin-sidebar-header h2 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

.admin-nav {
  padding: var(--space-md);
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
  margin-bottom: var(--space-1);
}

.admin-nav-item:hover {
  background: var(--color-bg-soft);
  color: var(--color-text);
}

.admin-nav-item.router-link-active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.admin-nav-badge {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 var(--space-2);
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: var(--color-error);
  border-radius: var(--radius-full);
}

.admin-main {
  flex: 1;
  padding: var(--space-xl);
  overflow-y: auto;
}
</style>
