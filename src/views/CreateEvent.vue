<template>
  <div class="create-event-page ui-page">
    <div class="create-event-container">
      <header class="page-header ui-card ui-pop-in">
        <router-link to="/events" class="back-link">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </router-link>
        <h1 class="page-title">发布赛事</h1>
      </header>

      <form class="event-form" @submit.prevent="handleSubmit">
        <!-- 基本信息 -->
        <section class="form-section ui-card">
          <h2 class="section-title">基本信息</h2>
          <div class="form-item">
            <label class="form-label">赛事标题 <span class="required">*</span></label>
            <input v-model="form.title" type="text" class="form-input" placeholder="如：2026年社区排球赛" maxlength="100" />
          </div>
          <div class="form-item">
            <label class="form-label">赛事类型 <span class="required">*</span></label>
            <div class="radio-group" v-if="isAdmin">
              <label class="radio-option" :class="{ active: form.type === 'MATCH' }">
                <input v-model="form.type" type="radio" value="MATCH" />
                <span>比赛</span>
              </label>
              <label class="radio-option" :class="{ active: form.type === 'ACTIVITY' }">
                <input v-model="form.type" type="radio" value="ACTIVITY" />
                <span>活动</span>
              </label>
            </div>
            <div v-else class="radio-group">
              <label class="radio-option active">
                <input type="radio" value="ACTIVITY" checked disabled />
                <span>活动</span>
              </label>
            </div>
            <p v-if="!isAdmin" class="form-hint">比赛类型仅管理员可创建</p>
          </div>
          <div class="form-item">
            <label class="form-label">赛制 <span class="required">*</span></label>
            <div class="radio-group">
              <label class="radio-option" :class="{ active: form.format === 'SINGLE_ELIMINATION' }">
                <input v-model="form.format" type="radio" value="SINGLE_ELIMINATION" />
                <span>单败淘汰</span>
              </label>
              <label class="radio-option" :class="{ active: form.format === 'GROUP_ELIMINATION' }">
                <input v-model="form.format" type="radio" value="GROUP_ELIMINATION" />
                <span>小组+淘汰</span>
              </label>
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">参赛队伍数 <span class="required">*</span></label>
            <div class="size-options">
              <button
                v-for="size in [4, 8, 16, 32]"
                :key="size"
                type="button"
                class="size-btn"
                :class="{ active: form.bracketSize === size }"
                @click="form.bracketSize = size"
              >{{ size }}队</button>
            </div>
            <p class="form-hint">选择参赛队伍上限（2的幂次）</p>
          </div>
          <div class="form-item">
            <label class="form-label">赛事描述 <span class="required">*</span></label>
            <textarea v-model="form.description" class="form-textarea" rows="4" placeholder="详细描述赛事信息"></textarea>
          </div>
        </section>

        <!-- 时间地点 -->
        <section class="form-section ui-card">
          <h2 class="section-title">时间与地点</h2>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">开赛时间 <span class="required">*</span></label>
              <input v-model="form.startTime" type="datetime-local" class="form-input" />
            </div>
            <div class="form-item">
              <label class="form-label">结束时间 <span class="required">*</span></label>
              <input v-model="form.endTime" type="datetime-local" class="form-input" />
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">比赛地点 <span class="required">*</span></label>
            <input v-model="form.location" type="text" class="form-input" placeholder="如：社区体育馆" />
          </div>
        </section>

        <!-- 报名信息 -->
        <section class="form-section ui-card">
          <h2 class="section-title">报名信息</h2>
          <div class="form-row">
            <div class="form-item">
              <label class="form-label">主办方</label>
              <input v-model="form.organizer" type="text" class="form-input" placeholder="主办方名称" />
            </div>
            <div class="form-item">
              <label class="form-label">报名费</label>
              <input v-model.number="form.fee" type="number" class="form-input" placeholder="0" min="0" step="0.01" />
            </div>
          </div>
          <div class="form-item">
            <label class="form-label">参赛要求</label>
            <textarea v-model="form.requirements" class="form-textarea" rows="3" placeholder="如：每队6人，需自备球衣"></textarea>
          </div>
          <div class="form-item">
            <label class="form-label">联系方式</label>
            <input v-model="form.contactInfo" type="text" class="form-input" placeholder="手机号或微信号" />
          </div>
        </section>

        <div v-if="error" class="form-error">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ error }}
        </div>

        <div class="form-actions">
          <router-link to="/events" class="ui-button ui-button-ghost">取消</router-link>
          <button type="submit" class="ui-button ui-button-primary" :disabled="submitting">
            {{ submitting ? '提交中...' : '发布赛事' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { event as eventApi, getUser } from '@/api'

const router = useRouter()
const submitting = ref(false)
const error = ref('')
const isAdmin = computed(() => getUser()?.isAdmin === true)

const form = reactive({
  title: '',
  description: '',
  type: isAdmin.value ? 'MATCH' : 'ACTIVITY',
  format: 'SINGLE_ELIMINATION',
  bracketSize: 8,
  startTime: '',
  endTime: '',
  location: '',
  organizer: '',
  requirements: '',
  fee: 0,
  contactInfo: ''
})

async function handleSubmit() {
  error.value = ''

  if (!form.title.trim()) { error.value = '请输入赛事标题'; return }
  if (!form.description.trim()) { error.value = '请输入赛事描述'; return }
  if (!form.startTime) { error.value = '请选择开赛时间'; return }
  if (!form.endTime) { error.value = '请选择结束时间'; return }
  if (!form.location.trim()) { error.value = '请输入比赛地点'; return }
  if (form.bracketSize < 2) { error.value = '参赛队伍数至少为2'; return }

  submitting.value = true
  try {
    const res = await eventApi.create({
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      format: form.format,
      bracketSize: form.bracketSize,
      startTime: form.startTime,
      endTime: form.endTime,
      location: form.location.trim(),
      organizer: form.organizer.trim() || undefined,
      requirements: form.requirements.trim() || undefined,
      fee: form.fee || undefined,
      contactInfo: form.contactInfo.trim() || undefined
    })
    if (res.data?.id) {
      router.push(`/event/${res.data.id}`)
    } else {
      router.push('/events')
    }
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-event-page {
  min-height: calc(100vh - 72px);
  padding: var(--space-6);
}

.create-event-container {
  max-width: 700px;
  margin: 0 auto;
}

.page-header {
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.back-link {
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--color-primary);
}

.page-title {
  font-size: var(--text-lg);
  font-weight: 700;
  margin: 0;
}

.event-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-section {
  padding: var(--space-5);
  border-radius: var(--radius-xl);
}

.section-title {
  font-size: var(--text-base);
  font-weight: 600;
  margin: 0 0 var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border-light);
}

.form-item {
  margin-bottom: var(--space-4);
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.required {
  color: var(--color-error);
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-card);
  transition: all var(--transition-fast);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.form-textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-card);
  transition: all var(--transition-fast);
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.form-hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.radio-group {
  display: flex;
  gap: var(--space-3);
}

.radio-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.radio-option input {
  display: none;
}

.radio-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.size-options {
  display: flex;
  gap: var(--space-2);
}

.size-btn {
  flex: 1;
  padding: var(--space-3);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: transparent;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.size-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.size-btn:hover:not(.active) {
  border-color: var(--color-primary);
  color: var(--color-text);
}

.form-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-error);
  background: var(--color-error-soft);
  border-radius: var(--radius-lg);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) 0;
}

@media (max-width: 640px) {
  .create-event-page {
    padding: var(--space-4);
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
