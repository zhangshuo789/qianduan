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
              <img :src="avatarPreview || currentAvatar" class="preview-img" />
              <div class="avatar-actions">
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileChange"
                  class="file-input"
                />
                <button type="button" class="btn-upload" @click="triggerFileInput">
                  {{ uploadingAvatar ? '上传中...' : '选择图片' }}
                </button>
                <p class="upload-tip">支持 JPG、PNG 格式，最大 10MB</p>
              </div>
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
import { user as userApi, file as fileApi, getUser, getAvatarUrl } from '@/api'

const router = useRouter()
const user = getUser()

if (!user) {
  router.push('/login')
}

const loading = ref(false)
const uploadingAvatar = ref(false)
const currentAvatar = ref('')
const avatarPreview = ref('')
const avatarFileId = ref(null)
const fileInput = ref(null)

const form = ref({
  nickname: '',
  bio: ''
})

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  if (file.size > 10 * 1024 * 1024) {
    alert('图片大小不能超过 10MB')
    return
  }

  avatarPreview.value = URL.createObjectURL(file)

  uploadingAvatar.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'avatar')

    const res = await fileApi.upload(formData)
    avatarFileId.value = res.data.id
  } catch (e) {
    alert(e.message)
    avatarPreview.value = ''
  } finally {
    uploadingAvatar.value = false
  }
}

onMounted(async () => {
  try {
    const res = await userApi.getInfo(user.id)
    form.value = {
      nickname: res.data.nickname || '',
      bio: res.data.bio || ''
    }
    if (res.data.avatar) {
      const avatarUrl = await getAvatarUrl(res.data.avatar)
      currentAvatar.value = avatarUrl || defaultAvatar
      avatarPreview.value = currentAvatar.value
    }
  } catch (e) {
    console.error(e)
  }
})

async function handleSubmit() {
  loading.value = true
  try {
    const data = {
      nickname: form.value.nickname,
      bio: form.value.bio
    }

    if (avatarFileId.value) {
      data.avatarFileId = avatarFileId.value
    }

    const res = await userApi.update(user.id, data)
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

.form-group input[type="text"],
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
  align-items: flex-start;
  gap: 16px;
}

.preview-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-light);
  background: var(--bg);
}

.avatar-actions {
  flex: 1;
}

.file-input {
  display: none;
}

.btn-upload {
  padding: 8px 16px;
  background: var(--card-bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 14px;
  cursor: pointer;
}

.btn-upload:hover {
  background: var(--bg);
}

.btn-upload:disabled {
  color: var(--text-muted);
  cursor: not-allowed;
}

.upload-tip {
  font-size: 12px;
  color: var(--text-muted);
  margin: 8px 0 0;
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
