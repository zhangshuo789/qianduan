<template>
  <div class="edit-profile-page">
    <div class="edit-profile-card">
      <div class="edit-profile-header">
        <h1 class="edit-profile-title">编辑资料</h1>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="success" class="success-message">{{ success }}</div>

      <form @submit.prevent="handleSubmit" class="edit-profile-form">
        <div class="form-group">
          <label class="form-label">头像</label>
          <div class="avatar-upload">
            <div class="avatar-preview">
              {{ form.nickname ? form.nickname.charAt(0).toUpperCase() : '?' }}
            </div>
            <div class="avatar-actions">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileChange"
                class="file-input"
              />
              <button type="button" class="avatar-upload-btn" @click="triggerFileInput">
                {{ uploadingAvatar ? '上传中...' : '选择图片' }}
              </button>
              <p class="upload-tip">支持 JPG、PNG 格式，最大 10MB</p>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">昵称</label>
          <input v-model="form.nickname" type="text" placeholder="输入昵称" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">个人简介</label>
          <textarea v-model="form.bio" placeholder="介绍一下自己" rows="4"></textarea>
        </div>

        <div class="form-actions">
          <router-link :to="`/user/${user?.id}`" class="btn-cancel">取消</router-link>
          <button type="submit" class="btn-save" :disabled="loading">
            {{ loading ? '保存中...' : '保存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { user as userApi, file as fileApi, getUser, getAvatarUrl } from '@/api'

const router = useRouter()
const user = getUser()

if (!user) {
  router.push('/login')
}

const defaultAvatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Ccircle cx="32" cy="32" r="32" fill="%23FF6B35"/%3E%3Ctext x="32" y="40" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3E%3F%3C/text%3E%3C/svg%3E'

const loading = ref(false)
const uploadingAvatar = ref(false)
const currentAvatar = ref('')
const avatarPreview = ref('')
const avatarFileId = ref(null)
const fileInput = ref(null)
const error = ref('')
const success = ref('')

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
    error.value = '图片大小不能超过 10MB'
    return
  }

  avatarPreview.value = URL.createObjectURL(file)

  uploadingAvatar.value = true
  error.value = ''
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'avatar')

    const res = await fileApi.upload(formData)
    avatarFileId.value = res.data.id
  } catch (e) {
    error.value = e.message
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
    error.value = '加载用户信息失败'
  }
})

async function handleSubmit() {
  loading.value = true
  error.value = ''
  success.value = ''
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
    success.value = '保存成功'
    setTimeout(() => {
      router.push(`/user/${user.id}`)
    }, 1000)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.edit-profile-page {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.edit-profile-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-xl);
}

.edit-profile-header {
  margin-bottom: var(--space-lg);
}

.edit-profile-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-secondary);
}

.edit-profile-form .form-group {
  margin-bottom: var(--space-md);
}

.edit-profile-form .form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.edit-profile-form .form-input,
.edit-profile-form textarea {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.edit-profile-form .form-input:focus,
.edit-profile-form textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
}

.edit-profile-form textarea {
  min-height: 100px;
  resize: vertical;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.avatar-preview {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--text-xl);
}

.avatar-upload-btn {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  color: var(--color-text);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.avatar-upload-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
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
  text-decoration: none;
}

.btn-cancel:hover {
  background: var(--color-bg);
}

.btn-save {
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

.btn-save:hover {
  background: var(--color-primary-dark);
  transform: scale(1.02);
}

.btn-save:disabled {
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

.success-message {
  background: #F0FDF4;
  color: var(--color-success);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
}

.file-input {
  display: none;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-xs);
}

.upload-tip {
  font-size: var(--text-xs);
  color: var(--color-text-light);
  margin: 0;
}
</style>
