<template>
  <div class="create-page">
    <NavBar />

    <div class="main-container">
      <div class="content-area">
        <div class="page-header">
          <h1>{{ isEdit ? '编辑帖子' : '发布帖子' }}</h1>
          <router-link to="/" class="back-link">返回首页</router-link>
        </div>

        <form @submit.prevent="handleSubmit" class="post-form">
          <div class="form-group">
            <label>板块</label>
            <select v-model="form.boardId" required :disabled="isEdit">
              <option value="">请选择板块</option>
              <option v-for="b in boards" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>标题</label>
            <input v-model="form.title" type="text" placeholder="请输入标题 (5-100字符)" required maxlength="100" />
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea v-model="form.content" placeholder="请输入内容，支持 Markdown 格式" rows="16" required></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="loading">
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
import NavBar from '@/components/NavBar.vue'
import { board, post as postApi, getUser } from '@/api'

const route = useRoute()
const router = useRouter()
const user = getUser()

if (!user) {
  router.push('/login')
}

const isEdit = ref(false)
const loading = ref(false)
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
    alert(e.message)
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
      alert(e.message)
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
    alert(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-page {
  min-height: 100vh;
  background: var(--bg);
}

.main-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.content-area {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
}

.back-link {
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: none;
}

.back-link:hover {
  color: var(--text);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--card-bg);
  color: var(--text);
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.form-group textarea {
  resize: vertical;
  min-height: 200px;
  line-height: 1.6;
}

.form-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
}

.btn-primary {
  padding: 10px 24px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
}
</style>
