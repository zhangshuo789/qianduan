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
      <table class="admin-table">
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
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>词汇</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="w in words" :key="w.id">
            <td>{{ w.id }}</td>
            <td>{{ w.word }}</td>
            <td>
              <button class="btn btn-sm btn-danger" @click="deleteWord(w)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
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
      <div class="modal ui-card">
        <h3>添加敏感词</h3>
        <div class="form-group">
          <label>敏感词</label>
          <input v-model="wordForm.word" type="text" placeholder="请输入敏感词" />
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
const wordForm = ref({ word: '' })

async function loadBoards() {
  try {
    const res = await admin.getBoards()
    boards.value = res.data || []
  } catch (e) {
    console.error(e)
  }
}

async function loadWords() {
  try {
    const res = await admin.getSensitiveWords()
    words.value = res.data || []
  } catch (e) {
    console.error(e)
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
    await admin.addSensitiveWord(wordForm.value)
    toastBus.success('添加成功')
    showWordModal.value = false
    wordForm.value = { word: '' }
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
  margin: 0 0 var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
}

.settings-actions {
  margin-bottom: var(--space-lg);
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

.modal-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
}
</style>
