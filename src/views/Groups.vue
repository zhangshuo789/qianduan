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
        <div class="modal-content ui-card ui-pop-in">
          <h2 class="modal-title">创建群聊</h2>
          <div class="modal-field">
            <label class="modal-label">群名称</label>
            <input v-model="newGroup.name" type="text" class="ui-input" placeholder="输入群名称" />
          </div>
          <div class="modal-field">
            <label class="modal-label">群描述</label>
            <input v-model="newGroup.description" type="text" class="ui-input" placeholder="输入群描述（可选）" />
          </div>
          <div class="modal-field">
            <label class="modal-label">成员ID（用逗号分隔）</label>
            <input v-model="newGroup.memberIds" type="text" class="ui-input" placeholder="如: 2,3,4" />
          </div>
          <div v-if="createError" class="ui-error">{{ createError }}</div>
          <div class="modal-actions">
            <button class="ui-button ui-button-secondary" @click="showCreateModal = false">取消</button>
            <button class="ui-button ui-button-primary" :disabled="creating" @click="createGroup">
              {{ creating ? '创建中...' : '创建' }}
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
const newGroup = ref({ name: '', description: '', memberIds: '' })
const showCreate = ref(true)

async function loadGroups() {
  loading.value = true
  try {
    const user = getUser()
    if (!user) {
      groups.value = []
      return
    }
    // 获取用户参与的群聊 - 暂时显示空列表，需要后端提供用户群聊列表API
    // 目前先通过获取用户关注的人来模拟，或者等待后端实现
    groups.value = []
  } catch (e) {
    console.error(e)
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
    const memberIdList = newGroup.value.memberIds
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n))

    const res = await groupApi.create({
      name: newGroup.value.name.trim(),
      description: newGroup.value.description.trim(),
      memberIds: memberIdList
    })
    showCreateModal.value = false
    newGroup.value = { name: '', description: '', memberIds: '' }
    router.push(`/group/${res.data.id}`)
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  width: 90%;
  max-width: 400px;
  padding: var(--space-5);
  border-radius: var(--radius-xl);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: 700;
  margin-bottom: var(--space-4);
}

.modal-field {
  margin-bottom: var(--space-4);
}

.modal-label {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-4);
}
</style>
