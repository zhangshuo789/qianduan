<template>
  <div class="create-event-page">
    <div class="page-hero">
      <div class="hero-content">
        <div class="hero-icon">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="hero-text">
          <h1>发布赛事</h1>
          <p>创建新的赛事活动，邀请大家参与</p>
        </div>
      </div>
    </div>

    <div class="create-event-container">
      <router-link to="/events" class="back-link">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        返回赛事列表
      </router-link>

      <form class="event-form" @submit.prevent="handleSubmit">
        <div class="form-section">
          <div class="section-header">
            <div class="section-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
            </div>
            <div class="section-title">
              <h3>基本信息</h3>
              <p>设置赛事的基本属性</p>
            </div>
          </div>
          
          <div class="form-group">
            <label>赛事类型 <span class="required">*</span></label>
            <div class="type-selector">
              <label class="type-option" :class="{ selected: form.type === 'ACTIVITY' }">
                <input type="radio" v-model="form.type" value="ACTIVITY" />
                <div class="type-content">
                  <div class="type-icon activity">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                      <line x1="9" y1="9" x2="9.01" y2="9"/>
                      <line x1="15" y1="9" x2="15.01" y2="9"/>
                    </svg>
                  </div>
                  <span class="type-label">活动</span>
                  <span class="type-desc">普通用户可发布</span>
                </div>
              </label>
              <label class="type-option" :class="{ selected: form.type === 'MATCH', disabled: !isAdmin }">
                <input type="radio" v-model="form.type" value="MATCH" :disabled="!isAdmin" />
                <div class="type-content">
                  <div class="type-icon match">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                    </svg>
                  </div>
                  <span class="type-label">比赛</span>
                  <span class="type-desc">{{ isAdmin ? '管理员专属' : '需管理员权限' }}</span>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>赛事标题 <span class="required">*</span></label>
            <input v-model="form.title" type="text" required placeholder="请输入赛事标题（5-100字符）" maxlength="100" />
            <span class="form-hint">{{ form.title.length }}/100 字符</span>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <div class="section-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="section-title">
              <h3>时间地点</h3>
              <p>设置赛事的时间和地点信息</p>
            </div>
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
            <label>比赛地点 <span class="required">*</span></label>
            <div class="input-with-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <input v-model="form.location" type="text" required placeholder="请输入赛事地点" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <div class="section-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="section-title">
              <h3>报名设置</h3>
              <p>设置报名相关参数</p>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>主办方</label>
              <input v-model="form.organizer" type="text" placeholder="请输入主办方（可选）" />
            </div>
            <div class="form-group">
              <label>报名费用</label>
              <div class="input-with-icon">
                <span class="input-prefix">¥</span>
                <input v-model.number="form.fee" type="number" min="0" step="0.01" placeholder="0 表示免费" />
              </div>
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
            <div class="input-with-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <input v-model="form.contactInfo" type="text" placeholder="请输入联系方式（可选）" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <div class="section-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div class="section-title">
              <h3>详细描述</h3>
              <p>填写赛事的详细信息和要求</p>
            </div>
          </div>

          <div class="form-group">
            <label>赛事描述 <span class="required">*</span></label>
            <textarea v-model="form.description" required placeholder="请详细描述赛事内容，包括活动流程、注意事项等" rows="5"></textarea>
            <span class="form-hint">详细描述有助于吸引更多参与者</span>
          </div>

          <div class="form-group">
            <label>参赛要求</label>
            <textarea v-model="form.requirements" placeholder="请输入参赛要求，如年龄限制、技能水平等（可选）" rows="3"></textarea>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <div class="section-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <div class="section-title">
              <h3>赛事图片</h3>
              <p>上传赛事相关图片（可选）</p>
            </div>
          </div>

          <div class="image-upload-area">
            <div class="image-preview-list" v-if="previewImages.length > 0">
              <div class="image-preview-item" v-for="(img, index) in previewImages" :key="index">
                <img :src="img.url" :alt="`图片 ${index + 1}`" />
                <button type="button" class="remove-image-btn" @click="removeImage(index)">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
                <div class="image-index">{{ index + 1 }}</div>
              </div>
            </div>
            
            <label class="upload-btn" v-if="previewImages.length < 9">
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                @change="handleImageSelect"
                ref="fileInput"
              />
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>点击上传图片</span>
              <span class="upload-hint">支持 jpg、png 格式，最多9张</span>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <router-link to="/events" class="btn btn-secondary">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            取消
          </router-link>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <svg v-if="!submitting" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <div v-else class="btn-spinner"></div>
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
import { event as eventApi, useUser } from '@/api'
import { toastBus } from '@/utils/toast'

const router = useRouter()
const user = useUser()
const isAdmin = computed(() => user.value?.isAdmin === true)

const submitting = ref(false)
const fileInput = ref(null)
const selectedFiles = ref([])
const previewImages = ref([])

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

function handleImageSelect(e) {
  const files = Array.from(e.target.files)
  if (!files.length) return

  const remainingSlots = 9 - previewImages.value.length
  const filesToAdd = files.slice(0, remainingSlots)

  filesToAdd.forEach(file => {
    if (!file.type.startsWith('image/')) {
      toastBus.warning(`${file.name} 不是有效的图片文件`)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toastBus.warning(`${file.name} 文件大小超过5MB`)
      return
    }

    selectedFiles.value.push(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImages.value.push({
        url: e.target.result,
        file: file
      })
    }
    reader.readAsDataURL(file)
  })

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function removeImage(index) {
  previewImages.value.splice(index, 1)
  selectedFiles.value.splice(index, 1)
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
    const formData = new FormData()
    
    formData.append('title', form.value.title)
    formData.append('description', form.value.description)
    formData.append('type', form.value.type)
    formData.append('startTime', form.value.startTime)
    formData.append('endTime', form.value.endTime)
    formData.append('location', form.value.location)
    
    if (form.value.organizer) {
      formData.append('organizer', form.value.organizer)
    }
    if (form.value.requirements) {
      formData.append('requirements', form.value.requirements)
    }
    if (form.value.maxParticipants) {
      formData.append('maxParticipants', form.value.maxParticipants)
    }
    if (form.value.fee !== null && form.value.fee !== undefined) {
      formData.append('fee', form.value.fee)
    }
    if (form.value.contactInfo) {
      formData.append('contactInfo', form.value.contactInfo)
    }
    if (form.value.registrationDeadline) {
      formData.append('registrationDeadline', form.value.registrationDeadline)
    }

    selectedFiles.value.forEach((file) => {
      formData.append('images', file)
    })

    await eventApi.createWithImages(formData)
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

.page-hero {
  background: #667eea;
  padding: var(--space-xl) var(--space-lg);
}

.hero-content {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.hero-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.hero-text h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: white;
  margin: 0 0 var(--space-1);
}

.hero-text p {
  font-size: var(--text-base);
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.create-event-container {
  max-width: 700px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  margin-bottom: var(--space-lg);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.back-link:hover {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.event-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-section {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.section-icon {
  width: 44px;
  height: 44px;
  background: var(--color-primary-soft);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.section-title h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--space-1);
}

.section-title p {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.form-group {
  margin-bottom: var(--space-lg);
}

.form-group:last-child {
  margin-bottom: 0;
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
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  background: var(--color-bg);
  color: var(--color-text);
  box-sizing: border-box;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--color-text-muted);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon svg {
  position: absolute;
  left: var(--space-md);
  color: var(--color-text-muted);
  pointer-events: none;
}

.input-with-icon input {
  padding-left: calc(var(--space-md) + 26px);
}

.input-prefix {
  position: absolute;
  left: var(--space-md);
  color: var(--color-text-muted);
  font-weight: 500;
}

.input-with-icon .input-prefix + input {
  padding-left: calc(var(--space-md) + 20px);
}

.type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.type-option {
  position: relative;
  display: block;
  padding: var(--space-lg);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--color-bg);
}

.type-option:hover:not(.disabled) {
  border-color: var(--color-primary-light);
}

.type-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.type-option.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.type-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.type-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.type-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-icon.activity {
  background: #fff7e6;
  color: #fa8c16;
}

.type-icon.match {
  background: #e8f4ff;
  color: #1890ff;
}

.type-label {
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--color-text);
}

.type-desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.image-upload-area {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.image-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.image-preview-item {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  background: var(--color-bg-soft);
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 6px;
  right: 6px;
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
  transition: all var(--transition-fast);
}

.remove-image-btn:hover {
  background: var(--color-error);
  transform: scale(1.1);
}

.image-index {
  position: absolute;
  bottom: 6px;
  left: 6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-xl);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--color-bg);
  color: var(--color-text-muted);
}

.upload-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.upload-btn input {
  display: none;
}

.upload-btn svg {
  opacity: 0.5;
}

.upload-btn:hover svg {
  opacity: 1;
}

.upload-btn span:first-of-type {
  font-weight: 500;
  color: var(--color-text);
}

.upload-hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.form-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  padding: var(--space-lg);
  background: var(--color-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
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
  transform: translateY(-2px);
  box-shadow: var(--shadow-primary);
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

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .create-event-container {
    padding: var(--space-md);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .type-selector {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .image-preview-item {
    width: 100px;
    height: 100px;
  }
}
</style>
