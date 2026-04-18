<template>
  <div class="admin-groups">
    <div class="admin-page-header">
      <h1>群聊管理</h1>
    </div>

    <div class="admin-table-container ui-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>群名称</th>
            <th>群主</th>
            <th>成员数</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in groups" :key="g.id">
            <td>{{ g.id }}</td>
            <td>{{ g.name }}</td>
            <td>{{ g.ownerNickname || g.ownerId }}</td>
            <td>{{ g.memberCount || 0 }}</td>
            <td>{{ formatTime(g.createdAt) }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn btn-sm btn-danger" @click="dissolveGroup(g)">解散</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="admin-pagination">
        <button class="btn btn-secondary" :disabled="page <= 0" @click="page--; loadGroups()">上一页</button>
        <span>第 {{ page + 1 }} 页</span>
        <button class="btn btn-secondary" :disabled="!hasMore" @click="page++; loadGroups()">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { admin } from '@/api'

const groups = ref([])
const page = ref(0)
const size = 10
const hasMore = ref(false)

async function loadGroups() {
  try {
    const res = await admin.getGroups({ page: page.value, size })
    groups.value = res.data.content || res.data || []
    hasMore.value = groups.value.length === size
  } catch (e) {
    console.error(e)
  }
}

async function dissolveGroup(g) {
  if (!confirm(`确定要解散群聊"${g.name}"吗？此操作不可恢复。`)) return
  try {
    await admin.dissolveGroup(g.id)
    alert('群聊已解散')
    loadGroups()
  } catch (err) {
    alert(err.message || '操作失败')
  }
}

function formatTime(time) {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadGroups()
})
</script>

<style scoped>
.admin-groups {
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

.btn-secondary {
  background: var(--color-bg-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-danger {
  background: var(--color-error);
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
