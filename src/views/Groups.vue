<template>
  <div class="groups-page ui-page">
    <div class="groups-container">
      <header class="groups-header ui-card ui-pop-in">
        <h1 class="groups-title">我的群聊</h1>
        <button v-if="showCreate" class="ui-button ui-button-primary" @click="showCreateModal = true">创建群聊</button>
      </header>

      <section v-if="loading" class="ui-card ui-loading">加载中...</section>

      <section v-else-if="groups.length === 0" class="ui-card ui-empty">
        暂无群聊
      </section>

      <section v-else class="groups-list">
        <router-link
          v-for="g in groups"
          :key="g.id"
          :to="`/group/${g.id}`"
          class="group-item ui-card"
        >
          <div class="group-icon">{{ g.name?.charAt(0) || '群' }}</div>
          <div class="group-info">
            <h3 class="group-name">{{ g.name }}</h3>
            <p class="group-desc">{{ g.description || '暂无描述' }}</p>
            <span class="group-members">{{ g.memberCount || 0 }} 位成员</span>
          </div>
        </router-link>
      </section>

      <!-- 创建群聊弹窗 -->
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal-panel ui-card ui-pop-in">
          <div class="modal-header">
            <div class="modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h2 class="modal-title">创建群聊</h2>
            <button class="modal-close" @click="showCreateModal = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-item">
              <label class="form-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                群名称
              </label>
              <input v-model="newGroup.name" type="text" class="form-input" placeholder="给群聊起个名字" />
            </div>
            <div class="form-item">
              <label class="form-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                群描述
              </label>
              <input v-model="newGroup.description" type="text" class="form-input" placeholder="简单描述一下群聊（可选）" />
            </div>
            <p class="form-hint create-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              创建后可邀请成员加入群聊
            </p>
          </div>
          <div v-if="createError" class="form-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ createError }}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showCreateModal = false">取消</button>
            <button class="btn btn-primary" :disabled="creating" @click="createGroup">
              <svg v-if="creating" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin">
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="6" y2="12"/>
                <line x1="18" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
              </svg>
              {{ creating ? '创建中...' : '创建群聊' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { group as groupApi, getUser } from '@/api'

const router = useRouter()
const loading = ref(true)
const groups = ref([])
const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref('')
const newGroup = ref({ name: '', description: '' })
const showCreate = ref(true)

async function loadGroups() {
  loading.value = true
  try {
    const user = getUser()
    if (!user) {
      groups.value = []
      return
    }
    const res = await groupApi.getMyGroups()
    // 处理分页数据格式和普通数组格式
    let list = res.data
    if (list && list.content) {
      list = list.content
    }
    if (Array.isArray(list)) {
      // 去重
      const seen = new Set()
      groups.value = list.filter(g => {
        if (seen.has(g.id)) return false
        seen.add(g.id)
        return true
      })
    } else {
      groups.value = []
    }
  } catch (e) {
    console.error(e)
    groups.value = []
  } finally {
    loading.value = false
  }
}

async function createGroup() {
  if (!newGroup.value.name.trim()) {
    createError.value = '请输入群名称'
    return
  }
  creating.value = true
  createError.value = ''
  try {
    const res = await groupApi.create({
      name: newGroup.value.name.trim(),
      description: newGroup.value.description.trim(),
      memberIds: []
    })
    showCreateModal.value = false
    newGroup.value = { name: '', description: '' }
    if (res.data?.id) {
      router.push(`/group/${res.data.id}`)
    } else {
      createError.value = '创建成功，但无法获取群ID'
    }
  } catch (e) {
    createError.value = e.message
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  loadGroups()
})
</script>

<style scoped>
.groups-page {
  min-height: calc(100vh - 72px);
  padding: var(--space-6);
}

.groups-container {
  max-width: 800px;
  margin: 0 auto;
}

.groups-header {
  padding: var(--space-5);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.groups-title {
  font-size: var(--text-lg);
  font-weight: 700;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.group-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  transition: all var(--transition-fast);
  text-decoration: none;
  color: inherit;
}

.group-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.group-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background-color: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xl);
  font-weight: 700;
  flex-shrink: 0;
}

.group-info {
  flex: 1;
  min-width: 0;
}

.group-name {
  font-size: var(--text-base);
  font-weight: 700;
}

.group-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-members {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
  display: block;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--space-4);
}

.modal-panel {
  width: 100%;
  max-width: 420px;
  padding: 0;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-2xl);
  background: var(--color-card);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-bg-soft);
}

.modal-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  background: var(--color-primary-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-title {
  flex: 1;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--color-error-soft);
  color: var(--color-error);
}

.modal-body {
  padding: var(--space-5);
}

.form-item {
  margin-bottom: var(--space-4);
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.form-label svg {
  color: var(--color-text-muted);
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-card);
  transition: all var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.form-input::placeholder {
  color: var(--color-text-muted);
}

.form-hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.create-hint {
  padding: var(--space-3);
  background: var(--color-info-soft);
  color: var(--color-info);
  border-radius: var(--radius-md);
  margin-top: var(--space-4);
}

.create-hint svg {
  flex-shrink: 0;
}

.form-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0 var(--space-5);
  padding: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-error);
  background: var(--color-error-soft);
  border-radius: var(--radius-md);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border-light);
  background: var(--color-bg-soft);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
