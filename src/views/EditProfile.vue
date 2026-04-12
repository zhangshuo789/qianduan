<template>
  <div class="edit-profile-page">
    <NavBar />

    <div class="main-container">
      <div class="content-area">
        <div class="page-header">
          <h1>编辑资料</h1>
          <router-link :to="`/user/${user?.id}`" class="back-link">返回个人主页</router-link>
        </div>

        <form @submit.prevent="handleSubmit" class="edit-form">
          <div class="form-group">
            <label>头像</label>
            <div class="avatar-preview">
              <img :src="form.avatar || defaultAvatar" class="preview-img" />
              <input v-model="form.avatar" type="text" placeholder="输入头像图片URL" />
            </div>
          </div>

          <div class="form-group">
            <label>昵称</label>
            <input v-model="form.nickname" type="text" placeholder="输入昵称" required />
          </div>

          <div class="form-group">
            <label>个人简介</label>
            <textarea v-model="form.bio" placeholder="介绍一下自己" rows="4"></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { user as userApi, getUser, setAuth } from '@/api'

const router = useRouter()
const user = getUser()

if (!user) {
  router.push('/login')
}

const loading = ref(false)
const defaultAvatar = 'https://via.placeholder.com/80'
const form = ref({
  nickname: '',
  avatar: '',
  bio: ''
})

onMounted(async () => {
  try {
    const res = await userApi.getInfo(user.id)
    form.value = {
      nickname: res.data.nickname || '',
      avatar: res.data.avatar || '',
      bio: res.data.bio || ''
    }
  } catch (e) {
    console.error(e)
  }
})

async function handleSubmit() {
  loading.value = true
  try {
    const res = await userApi.update(user.id, form.value)
    const updatedUser = { ...user, ...res.data }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    alert('保存成功')
    router.push(`/user/${user.id}`)
  } catch (e) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.edit-profile-page {
  min-height: 100vh;
  background: var(--bg);
}

.main-container {
  max-width: 600px;
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
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--card-bg);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.form-group textarea {
  resize: vertical;
  line-height: 1.6;
}

.avatar-preview {
  display: flex;
  align-items: center;
  gap: 16px;
}

.preview-img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-light);
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
