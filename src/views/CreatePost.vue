<template>
  <div class="create-post-page">
    <div class="main-container">
      <div class="create-post-card">
        <div class="create-post-header">
          <h1 class="create-post-title">{{ isEdit ? '编辑帖子' : '发布帖子' }}</h1>
        </div>

        <form @submit.prevent="handleSubmit" class="create-post-form">
          <div class="form-group">
            <label class="form-label">板块</label>
            <select v-model="form.boardId" class="board-select" required :disabled="isEdit">
              <option value="">请选择板块</option>
              <option v-for="b in boards" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">标题</label>
            <input v-model="form.title" class="form-input" type="text" placeholder="请输入标题 (5-100字符)" required maxlength="100" />
          </div>
          <div class="form-group">
            <label class="form-label">内容</label>
            <textarea v-model="form.content" class="form-input" placeholder="请输入内容，支持 Markdown 格式" rows="16" required></textarea>
          </div>
          <div v-if="error" class="error-message">{{ error }}</div>
          <div class="form-group">
            <div class="file-upload-area">
              <p>点击或拖拽文件到此处上传</p>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="router.push('/')">取消</button>
            <button type="submit" class="btn-submit" :disabled="loading">
              {{ loading ? '提交中...' : '提交' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { board, post as postApi, getUser } from '@/api'

const route = useRoute()
const router = useRouter()
const user = getUser()

if (!user) {
  router.push('/login')
}

const isEdit = ref(false)
const loading = ref(false)
const error = ref('')
const boards = ref([])
const form = ref({
  boardId: route.query.boardId || '',
  title: '',
  content: ''
})

onMounted(async () => {
  try {
    const res = await board.list()
    boards.value = res.data
  } catch (e) {
    error.value = e.message
  }

  if (route.params.id) {
    isEdit.value = true
    try {
      const res = await postApi.getDetail(route.params.id)
      form.value = {
        boardId: res.data.board.id,
        title: res.data.title,
        content: res.data.content
      }
    } catch (e) {
      error.value = e.message
    }
  }
})

async function handleSubmit() {
  loading.value = true
  try {
    if (isEdit.value) {
      await postApi.update(route.params.id, {
        title: form.value.title,
        content: form.value.content
      })
    } else {
      await postApi.create(form.value)
    }
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-post-page {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.create-post-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-xl);
}

.create-post-header {
  margin-bottom: var(--space-lg);
}

.create-post-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-secondary);
}

.create-post-form .form-group {
  margin-bottom: var(--space-md);
}

.create-post-form .form-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.create-post-form .form-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.create-post-form .form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
}

.create-post-form textarea {
  min-height: 200px;
  resize: vertical;
}

.board-select {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background: var(--color-card);
  cursor: pointer;
}

.board-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
}

.file-upload-area {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  text-align: center;
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.file-upload-area:hover {
  border-color: var(--color-primary);
  background: rgba(255, 107, 53, 0.05);
}

.file-upload-area p {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.btn-cancel {
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  color: var(--color-text);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-cancel:hover {
  background: var(--color-bg);
}

.btn-submit {
  padding: var(--space-sm) var(--space-lg);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-submit:hover {
  background: var(--color-primary-dark);
  transform: scale(1.02);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: #FEF2F2;
  color: var(--color-error);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
}
</style>
