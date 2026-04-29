<template>
  <div class="admin-settings">
    <div class="admin-page-header">
      <h1>系统配置</h1>
    </div>

    <div class="settings-section ui-card">
      <h2>板块管理</h2>
      <div class="settings-actions">
        <button class="btn btn-primary" @click="showBoardModal = true">添加板块</button>
      </div>
      <div v-if="loadingBoards" class="loading-state">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-else-if="boards.length === 0" class="empty-state-small">
        <span>暂无板块数据，点击上方按钮添加</span>
      </div>
      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>描述</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in boards" :key="b.id">
            <td>{{ b.id }}</td>
            <td>{{ b.name }}</td>
            <td>{{ b.description || '-' }}</td>
            <td>
              <button class="btn btn-sm btn-danger" @click="deleteBoard(b)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="settings-section ui-card">
      <h2>敏感词管理</h2>
      <div class="settings-actions">
        <button class="btn btn-primary" @click="showWordModal = true">添加敏感词</button>
      </div>
      <div v-if="loadingWords" class="loading-state">
        <div class="spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-else-if="words.length === 0" class="empty-state-small">
        <span>暂无敏感词数据，点击上方按钮添加</span>
      </div>
      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>敏感词</th>
            <th>替换词</th>
            <th>级别</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="w in words" :key="w.id">
            <td>{{ w.id }}</td>
            <td>{{ w.word }}</td>
            <td>{{ w.replacement || '***' }}</td>
            <td>
              <span class="level-badge" :class="w.level?.toLowerCase() || 'warn'">
                {{ w.level === 'BLOCK' ? '拦截' : '警告' }}
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-danger" @click="deleteWord(w)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="settings-section ui-card">
      <h2>系统通知</h2>
      <p class="section-desc">向全体用户发送广播通知，支持实时推送和持久化存储</p>
      <div class="notification-form">
        <div class="form-group">
          <label>通知标题</label>
          <input v-model="notificationForm.title" type="text" placeholder="请输入通知标题" />
        </div>
        <div class="form-group">
          <label>通知内容</label>
          <textarea v-model="notificationForm.content" placeholder="请输入通知内容" rows="4"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>通知类型</label>
            <select v-model="notificationForm.type" class="form-select">
              <option value="BROADCAST">广播通知</option>
              <option value="PRIVATE">私信通知</option>
            </select>
          </div>
          <div class="form-group" v-if="notificationForm.type === 'BROADCAST'">
            <label>是否持久化</label>
            <select v-model="notificationForm.persist" class="form-select">
              <option :value="true">保存到数据库</option>
              <option :value="false">仅实时推送</option>
            </select>
          </div>
          <div class="form-group" v-if="notificationForm.type === 'PRIVATE'">
            <label>目标用户ID</label>
            <input v-model.number="notificationForm.targetUserId" type="number" placeholder="请输入用户ID" />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="sendNotification" :disabled="sendingNotification">
            {{ sendingNotification ? '发送中...' : '发送通知' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 添加板块弹窗 -->
    <div class="modal-overlay" v-if="showBoardModal" @click.self="showBoardModal = false">
      <div class="modal ui-card">
        <h3>添加板块</h3>
        <div class="form-group">
          <label>板块名称</label>
          <input v-model="boardForm.name" type="text" placeholder="请输入板块名称" />
        </div>
        <div class="form-group">
          <label>板块描述</label>
          <textarea v-model="boardForm.description" placeholder="请输入板块描述" rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showBoardModal = false">取消</button>
          <button class="btn btn-primary" @click="createBoard">确定</button>
        </div>
      </div>
    </div>

    <!-- 添加敏感词弹窗 -->
    <div class="modal-overlay" v-if="showWordModal" @click.self="showWordModal = false">
      <div class="modal ui-card modal-lg">
        <h3>添加敏感词</h3>
        <div class="form-group">
          <label>敏感词 <span class="required">*</span></label>
          <input v-model="wordForm.word" type="text" placeholder="请输入敏感词" />
        </div>
        <div class="form-group">
          <label>替换词</label>
          <input v-model="wordForm.replacement" type="text" placeholder="默认为 ***" />
          <p class="form-hint">敏感词将被替换为此内容，如 ***、[已屏蔽]、***等</p>
        </div>
        <div class="form-group">
          <label>处理级别</label>
          <select v-model="wordForm.level" class="form-select">
            <option value="WARN">警告 - 仅替换敏感词</option>
            <option value="BLOCK">拦截 - 阻止内容发布</option>
          </select>
          <p class="form-hint">警告级别会替换敏感词后允许发布，拦截级别会直接拒绝发布</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showWordModal = false">取消</button>
          <button class="btn btn-primary" @click="createWord">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { admin } from '@/api'
import { toastBus } from '@/utils/toast'

const boards = ref([])
const words = ref([])
const showBoardModal = ref(false)
const showWordModal = ref(false)
const boardForm = ref({ name: '', description: '' })
const wordForm = ref({ word: '', replacement: '', level: 'WARN' })
const loadingBoards = ref(false)
const loadingWords = ref(false)
const notificationForm = ref({
  title: '',
  content: '',
  type: 'BROADCAST',
  persist: true,
  targetUserId: null
})
const sendingNotification = ref(false)

async function loadBoards() {
  loadingBoards.value = true
  try {
    const res = await admin.getBoards()
    boards.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loadingBoards.value = false
  }
}

async function loadWords() {
  loadingWords.value = true
  try {
    const res = await admin.getSensitiveWords()
    words.value = res.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loadingWords.value = false
  }
}

async function createBoard() {
  if (!boardForm.value.name) {
    toastBus.warning('请输入板块名称')
    return
  }
  try {
    await admin.createBoard(boardForm.value)
    toastBus.success('添加成功')
    showBoardModal.value = false
    boardForm.value = { name: '', description: '' }
    loadBoards()
  } catch (e) {
    toastBus.error(e.message || '添加失败')
  }
}

async function deleteBoard(b) {
  if (!confirm(`确定删除板块"${b.name}"吗？`)) return
  try {
    await admin.deleteBoard(b.id)
    toastBus.success('删除成功')
    loadBoards()
  } catch (e) {
    toastBus.error(e.message || '删除失败')
  }
}

async function createWord() {
  if (!wordForm.value.word) {
    toastBus.warning('请输入敏感词')
    return
  }
  try {
    await admin.addSensitiveWord({
      word: wordForm.value.word,
      replacement: wordForm.value.replacement || '***',
      level: wordForm.value.level || 'WARN'
    })
    toastBus.success('添加成功')
    showWordModal.value = false
    wordForm.value = { word: '', replacement: '', level: 'WARN' }
    loadWords()
  } catch (e) {
    toastBus.error(e.message || '添加失败')
  }
}

async function deleteWord(w) {
  if (!confirm(`确定删除敏感词"${w.word}"吗？`)) return
  try {
    await admin.deleteSensitiveWord(w.id)
    toastBus.success('删除成功')
    loadWords()
  } catch (e) {
    toastBus.error(e.message || '删除失败')
  }
}

async function sendNotification() {
  if (!notificationForm.value.title) {
    toastBus.warning('请输入通知标题')
    return
  }
  if (!notificationForm.value.content) {
    toastBus.warning('请输入通知内容')
    return
  }
  if (notificationForm.value.type === 'PRIVATE' && !notificationForm.value.targetUserId) {
    toastBus.warning('请输入目标用户ID')
    return
  }

  sendingNotification.value = true
  try {
    await admin.sendNotification({
      title: notificationForm.value.title,
      content: notificationForm.value.content,
      type: notificationForm.value.type,
      persist: notificationForm.value.persist,
      targetUserId: notificationForm.value.targetUserId
    })
    toastBus.success('通知发送成功')
    notificationForm.value = {
      title: '',
      content: '',
      type: 'BROADCAST',
      persist: true,
      targetUserId: null
    }
  } catch (e) {
    toastBus.error(e.message || '发送失败')
  } finally {
    sendingNotification.value = false
  }
}

onMounted(() => {
  loadBoards()
  loadWords()
})
</script>

<style scoped>
.admin-settings {
  max-width: 900px;
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

.settings-section {
  margin-bottom: var(--space-xl);
}

.settings-section h2 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--space-sm);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
}

.section-desc {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0 0 var(--space-lg);
}

.settings-actions {
  margin-bottom: var(--space-lg);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-xl);
  color: var(--color-text-muted);
}

.empty-state-small {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  background: var(--color-bg-soft);
  border-radius: var(--radius-lg);
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

.level-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 500;
}

.level-badge.warn {
  background: #fff7e6;
  color: #fa8c16;
}

.level-badge.block {
  background: #fff1f0;
  color: #ff4d4f;
}

.notification-form {
  background: var(--color-bg-soft);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-lg);
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

/* Modal */
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
  max-width: 500px;
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

.required {
  color: var(--color-error);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  box-sizing: border-box;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-select {
  width: 100%;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background: white;
  cursor: pointer;
}

.form-hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: var(--space-1) 0 0;
}

.modal-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
