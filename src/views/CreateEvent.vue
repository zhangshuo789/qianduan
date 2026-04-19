<template>
  <div class="create-event-page">
    <div class="create-event-container">
      <div class="page-header">
        <router-link to="/events" class="back-link">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          返回赛事列表
        </router-link>
        <h1>发布赛事</h1>
      </div>

      <form class="event-form ui-card" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>赛事类型 <span class="required">*</span></label>
          <div class="type-selector">
            <label class="type-option">
              <input type="radio" v-model="form.type" value="ACTIVITY" />
              <span class="type-label activity">活动</span>
              <span class="type-desc">普通用户可发布</span>
            </label>
            <label class="type-option" :class="{ disabled: !isAdmin }">
              <input type="radio" v-model="form.type" value="MATCH" :disabled="!isAdmin" />
              <span class="type-label match">比赛</span>
              <span class="type-desc">{{ isAdmin ? '管理员专属' : '需管理员权限' }}</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>赛事标题 <span class="required">*</span></label>
          <input v-model="form.title" type="text" required placeholder="请输入赛事标题（5-100字符）" maxlength="100" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>开始时间 <span class="required">*</span></label>
            <input v-model="form.startTime" type="datetime-local" required />
          </div>
          <div class="form-group">
            <label>结束时间 <span class="required">*</span></label>
            <input v-model="form.endTime" type="datetime-local" required />
          </div>
        </div>

        <div class="form-group">
          <label>地点 <span class="required">*</span></label>
          <input v-model="form.location" type="text" required placeholder="请输入赛事地点" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>主办方</label>
            <input v-model="form.organizer" type="text" placeholder="请输入主办方（可选）" />
          </div>
          <div class="form-group">
            <label>费用</label>
            <input v-model.number="form.fee" type="number" min="0" step="0.01" placeholder="0 表示免费" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>最大参赛队伍数</label>
            <input v-model.number="form.maxParticipants" type="number" min="1" placeholder="不限制则留空" />
          </div>
          <div class="form-group">
            <label>报名截止时间</label>
            <input v-model="form.registrationDeadline" type="datetime-local" />
          </div>
        </div>

        <div class="form-group">
          <label>联系方式</label>
          <input v-model="form.contactInfo" type="text" placeholder="请输入联系方式（可选）" />
        </div>

        <div class="form-group">
          <label>赛事描述 <span class="required">*</span></label>
          <textarea v-model="form.description" required placeholder="请详细描述赛事内容" rows="5"></textarea>
        </div>

        <div class="form-group">
          <label>参赛要求</label>
          <textarea v-model="form.requirements" placeholder="请输入参赛要求（可选）" rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>赛事图片</label>
          <div class="image-upload">
            <div class="image-list" v-if="imageUrls.length">
              <div class="image-item" v-for="(url, idx) in imageUrls" :key="idx">
                <img :src="url" alt="赛事图片" />
                <button type="button" class="remove-btn" @click="removeImage(idx)">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
            <input v-model="newImageUrl" type="text" placeholder="输入图片URL添加" @keydown.enter.prevent="addImage" />
            <button type="button" class="add-image-btn" @click="addImage">添加图片</button>
          </div>
        </div>

        <div class="form-actions">
          <router-link to="/events" class="btn btn-secondary">取消</router-link>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '发布中...' : '发布赛事' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { event as eventApi, getUser } from '@/api'
import { toastBus } from '@/utils/toast'

const router = useRouter()
const user = getUser()
const isAdmin = computed(() => user.value?.isAdmin === true)

const submitting = ref(false)
const newImageUrl = ref('')
const imageUrls = ref([])

const form = ref({
  type: 'ACTIVITY',
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  location: '',
  organizer: '',
  requirements: '',
  maxParticipants: null,
  fee: 0,
  contactInfo: '',
  registrationDeadline: ''
})

function addImage() {
  const url = newImageUrl.value.trim()
  if (url && !imageUrls.value.includes(url)) {
    imageUrls.value.push(url)
    newImageUrl.value = ''
  }
}

function removeImage(idx) {
  imageUrls.value.splice(idx, 1)
}

async function handleSubmit() {
  if (!form.value.title || form.value.title.length < 5) {
    toastBus.warning('赛事标题至少5个字符')
    return
  }

  if (form.value.type === 'MATCH' && !isAdmin.value) {
    toastBus.error('只有管理员可以发布比赛')
    return
  }

  submitting.value = true
  try {
    const data = {
      ...form.value,
      maxParticipants: form.value.maxParticipants || null,
      imageUrls: imageUrls.value.length ? imageUrls.value : null
    }

    await eventApi.create(data)
    toastBus.success('发布成功！')
    router.push('/events')
  } catch (e) {
    console.error(e)
    toastBus.error(e.message || '发布失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-event-page {
  min-height: calc(100vh - 72px);
  background: var(--color-bg-soft);
}

.create-event-container {
  max-width: 700px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.page-header {
  margin-bottom: var(--space-lg);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--color-primary);
}

.page-header h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.event-form {
  padding: var(--space-xl);
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
  background: var(--color-bg-page);
  color: var(--color-text);
  box-sizing: border-box;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group textarea {
  resize: vertical;
}

.form-row {
  display: flex;
  gap: var(--space-lg);
}

.form-row .form-group {
  flex: 1;
}

.type-selector {
  display: flex;
  gap: var(--space-md);
}

.type-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.type-option:hover:not(.disabled) {
  border-color: var(--color-primary-light);
}

.type-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.type-option input {
  display: none;
}

.type-option:has(input:checked) {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.type-label {
  font-weight: 600;
  font-size: var(--text-base);
  padding: 4px 16px;
  border-radius: var(--radius-md);
}

.type-label.activity {
  background: #fff7e6;
  color: #fa8c16;
}

.type-label.match {
  background: #e8f4ff;
  color: #1890ff;
}

.type-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.image-upload {
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.image-item {
  position: relative;
  width: 100px;
  height: 70px;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-image-btn {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-soft);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.add-image-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.form-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.btn {
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
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

.btn-secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

@media (max-width: 640px) {
  .create-event-container {
    padding: var(--space-md);
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .type-selector {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
