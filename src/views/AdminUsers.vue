<template>
  <div class="admin-users">
    <div class="admin-page-header">
      <h1>用户管理</h1>
    </div>

    <div class="admin-toolbar">
      <input v-model="keyword" type="text" placeholder="搜索用户名或邮箱..." class="admin-search-input" @keydown.enter="loadUsers" />
      <select v-model="disabledFilter" class="admin-select" @change="loadUsers">
        <option value="">全部用户</option>
        <option value="false">正常用户</option>
        <option value="true">已禁用用户</option>
      </select>
      <button class="btn btn-primary" @click="loadUsers">搜索</button>
    </div>

    <div class="admin-table-container ui-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.id }}</td>
            <td>{{ u.nickname }}</td>
            <td>{{ u.email }}</td>
            <td>
              <span class="role-badge" :class="u.roles?.[0]?.toLowerCase() || 'user'">
                {{ u.roles?.[0] || 'USER' }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="u.disabled ? 'disabled' : 'active'">
                {{ u.disabled ? '已禁用' : '正常' }}
              </span>
            </td>
            <td>{{ formatTime(u.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <button v-if="!u.disabled" class="btn btn-sm btn-danger" @click="disableUser(u)">禁用</button>
                <button v-else class="btn btn-sm btn-success" @click="enableUser(u)">启用</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="admin-pagination">
        <button class="btn btn-secondary" :disabled="page <= 0" @click="page--; loadUsers()">上一页</button>
        <span>第 {{ page + 1 }} 页，共 {{ totalPages }} 页</span>
        <button class="btn btn-secondary" :disabled="page >= totalPages - 1" @click="page++; loadUsers()">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { admin } from '@/api'

const users = ref([])
const page = ref(0)
const size = 10
const totalElements = ref(0)
const keyword = ref('')
const disabledFilter = ref('')

const totalPages = computed(() => Math.ceil(totalElements.value / size))

async function loadUsers() {
  try {
    const res = await admin.getUsers({
      page: page.value,
      size,
      keyword: keyword.value,
      disabled: disabledFilter.value
    })
    users.value = res.data.content || []
    totalElements.value = res.data.totalElements || 0
  } catch (e) {
    console.error(e)
  }
}

async function disableUser(u) {
  const reason = prompt('请输入禁用原因：')
  if (!reason) return
  try {
    await admin.setUserStatus(u.id, true, reason)
    alert('已禁用该用户')
    loadUsers()
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

async function enableUser(u) {
  try {
    await admin.setUserStatus(u.id, false, '')
    alert('已启用该用户')
    loadUsers()
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

function formatTime(time) {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users {
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

.admin-search-input {
  flex: 1;
  max-width: 300px;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
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

.role-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
}

.role-badge.admin {
  background: #fff7e6;
  color: #fa8c16;
}

.role-badge.user {
  background: #e8f4ff;
  color: #1890ff;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.status-badge.active {
  background: #f6ffed;
  color: #52c41a;
}

.status-badge.disabled {
  background: #fff1f0;
  color: #ff4d4f;
}

.action-buttons {
  display: flex;
  gap: var(--space-2);
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

.btn-primary {
  background: var(--color-primary);
  color: white;
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
