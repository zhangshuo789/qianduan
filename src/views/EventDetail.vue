<template>
  <div class="event-detail-page">
    <div class="event-detail-container" v-if="event">
      <div class="event-header">
        <router-link to="/events" class="back-link">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          返回赛事列表
        </router-link>
      </div>

      <div class="event-main">
        <div class="event-banner" v-if="event.imageUrls && event.imageUrls.length">
          <img :src="event.imageUrls[0]" alt="赛事图片" class="main-image" />
          <div class="banner-overlay">
            <div class="banner-badges">
              <span class="event-type-badge" :class="event.type.toLowerCase()">{{ event.type === 'MATCH' ? '比赛' : '活动' }}</span>
              <span class="event-status-badge" :class="event.status.toLowerCase()">{{ statusText(event.status) }}</span>
            </div>
          </div>
        </div>

        <div class="event-content">
          <div class="event-title-section">
            <h1 class="event-title">{{ event.title }}</h1>
            <div class="event-organizer" v-if="event.organizer">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>主办方：{{ event.organizer }}</span>
            </div>
          </div>

          <div class="info-cards">
            <div class="info-card">
              <div class="info-card-icon time-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="info-card-content">
                <span class="info-card-label">开始时间</span>
                <span class="info-card-value">{{ formatTime(event.startTime) }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-card-icon time-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="info-card-content">
                <span class="info-card-label">结束时间</span>
                <span class="info-card-value">{{ formatTime(event.endTime) }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-card-icon location-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div class="info-card-content">
                <span class="info-card-label">比赛地点</span>
                <span class="info-card-value">{{ event.location }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-card-icon fee-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div class="info-card-content">
                <span class="info-card-label">报名费用</span>
                <span class="info-card-value fee">{{ event.fee > 0 ? `¥${event.fee}` : '免费' }}</span>
              </div>
            </div>
          </div>

          <div class="participant-section">
            <div class="participant-header">
              <h3>报名情况</h3>
              <span class="deadline" v-if="event.registrationDeadline">
                报名截止：{{ formatTime(event.registrationDeadline) }}
              </span>
            </div>
            <div class="participant-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${Math.min((event.registrationCount || 0) / event.maxParticipants * 100, 100)}%` }"></div>
              </div>
              <div class="progress-stats">
                <span class="current">{{ event.registrationCount || 0 }} 人已报名</span>
                <span class="max">共 {{ event.maxParticipants }} 个名额</span>
              </div>
            </div>
            <div class="subscriber-info">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{{ event.subscriberCount || 0 }} 人订阅了此赛事</span>
            </div>
          </div>

          <div class="detail-section" v-if="event.description">
            <h3 class="section-title">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              赛事介绍
            </h3>
            <p class="section-content">{{ event.description }}</p>
          </div>

          <div class="detail-section" v-if="event.requirements">
            <h3 class="section-title">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              参赛要求
            </h3>
            <p class="section-content">{{ event.requirements }}</p>
          </div>

          <div class="detail-section" v-if="event.contactInfo">
            <h3 class="section-title">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              联系方式
            </h3>
            <p class="section-content">{{ event.contactInfo }}</p>
          </div>

          <div class="image-gallery" v-if="event.imageUrls && event.imageUrls.length > 1">
            <h3 class="section-title">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              更多图片
            </h3>
            <div class="gallery-grid">
              <img v-for="(url, idx) in event.imageUrls.slice(1)" :key="idx" :src="url" alt="赛事图片" class="gallery-image" />
            </div>
          </div>

          <div class="event-actions">
            <button
              class="btn btn-subscribe"
              v-if="canSubscribe && !event.isSubscribed"
              @click="handleSubscribe"
              :disabled="subscribing"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {{ subscribing ? '订阅中...' : '订阅赛事' }}
            </button>
            <button
              class="btn btn-subscribed"
              v-if="canSubscribe && event.isSubscribed"
              @click="handleUnsubscribe"
              :disabled="subscribing"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {{ subscribing ? '取消中...' : '已订阅' }}
            </button>

            <button
              class="btn btn-register"
              v-if="canRegister && !event.hasRegistered"
              @click="showRegisterModal = true"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              报名参赛
            </button>
            <div class="registered-badge" v-if="event.hasRegistered">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              已报名
            </div>

            <button
              v-if="user"
              class="btn btn-report"
              @click="showReportModal = true"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
              举报
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="loading-state">
      <div class="spinner spinner-lg"></div>
      <span>加载中...</span>
    </div>

    <div v-else class="error-state">
      <div class="error-icon">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h3>赛事不存在</h3>
      <router-link to="/events" class="btn btn-primary">返回列表</router-link>
    </div>

    <div class="modal-overlay" v-if="showRegisterModal" @click.self="showRegisterModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>报名参赛</h3>
          <button class="modal-close" @click="showRegisterModal = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label>球队名称</label>
            <input v-model="registerForm.teamName" type="text" required placeholder="请输入球队名称" />
          </div>
          <div class="form-group">
            <label>联系人</label>
            <input v-model="registerForm.contactPerson" type="text" required placeholder="请输入联系人姓名" />
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input v-model="registerForm.contactPhone" type="tel" required placeholder="请输入联系电话" />
          </div>
          <div class="form-group">
            <label>参赛人数</label>
            <input v-model.number="registerForm.teamSize" type="number" required min="1" placeholder="请输入参赛人数" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showRegisterModal = false">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="registering">
              {{ registering ? '提交中...' : '提交报名' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="modal-overlay" v-if="showReportModal" @click.self="showReportModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>举报内容</h3>
          <button class="modal-close" @click="showReportModal = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="submitReport">
          <div class="form-group">
            <label>举报原因</label>
            <select v-model="reportReason" required>
              <option value="">请选择举报原因</option>
              <option value="垃圾广告">垃圾广告</option>
              <option value="违规内容">违规内容</option>
              <option value="虚假信息">虚假信息</option>
              <option value="人身攻击">人身攻击</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>详细说明</label>
            <textarea v-model="reportDetail" placeholder="请详细描述问题（可选）" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showReportModal = false">取消</button>
            <button type="submit" class="btn btn-primary">提交举报</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { event as eventApi, report as reportApi, useUser } from '@/api'
import { toastBus } from '@/utils/toast'

const route = useRoute()
const router = useRouter()
const user = useUser()

const loading = ref(true)
const event = ref(null)
const subscribing = ref(false)
const registering = ref(false)
const showRegisterModal = ref(false)
const registerForm = ref({
  teamName: '',
  contactPerson: '',
  contactPhone: '',
  teamSize: ''
})
const showReportModal = ref(false)
const reportReason = ref('')
const reportDetail = ref('')

const canSubscribe = computed(() => user.value && event.value)
const canRegister = computed(() => {
  if (!user.value || !event.value) return false
  return event.value.status === 'REGISTERING' && !event.value.hasRegistered
})

function statusText(status) {
  const map = {
    'PREPARING': '筹备中',
    'REGISTERING': '报名中',
    'IN_PROGRESS': '进行中',
    'ENDED': '已结束',
    'CANCELLED': '已取消'
  }
  return map[status] || status
}

function formatTime(time) {
  if (!time) return '待定'
  const date = new Date(time)
  return date.toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function loadEvent() {
  loading.value = true
  try {
    const res = await eventApi.getDetail(route.params.id)
    event.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleSubscribe() {
  if (!user.value) {
    router.push('/login')
    return
  }
  subscribing.value = true
  try {
    await eventApi.subscribe(event.value.id)
    event.value.isSubscribed = true
    event.value.subscriberCount = (event.value.subscriberCount || 0) + 1
  } catch (e) {
    console.error(e)
    toastBus.error(e.message || '订阅失败')
  } finally {
    subscribing.value = false
  }
}

async function handleUnsubscribe() {
  subscribing.value = true
  try {
    await eventApi.unsubscribe(event.value.id)
    event.value.isSubscribed = false
    event.value.subscriberCount = Math.max(0, (event.value.subscriberCount || 1) - 1)
  } catch (e) {
    console.error(e)
    toastBus.error(e.message || '取消订阅失败')
  } finally {
    subscribing.value = false
  }
}

async function handleRegister() {
  registering.value = true
  try {
    await eventApi.register(event.value.id, registerForm.value)
    toastBus.success('报名成功，等待审核！')
    showRegisterModal.value = false
    loadEvent()
  } catch (e) {
    console.error(e)
    toastBus.error(e.message || '报名失败')
  } finally {
    registering.value = false
  }
}

async function submitReport() {
  if (!reportReason.value) {
    toastBus.warning('请选择举报原因')
    return
  }
  try {
    await reportApi.create({
      targetType: 'EVENT',
      targetId: event.value.id,
      reason: reportReason.value,
      detail: reportDetail.value
    })
    toastBus.success('举报成功，我们会尽快处理')
    showReportModal.value = false
    reportReason.value = ''
    reportDetail.value = ''
  } catch (e) {
    console.error(e)
    toastBus.error(e.message || '举报失败')
  }
}

onMounted(() => {
  loadEvent()
})
</script>

<style scoped>
.event-detail-page {
  min-height: calc(100vh - 72px);
  background: var(--color-bg-soft);
}

.event-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.event-header {
  margin-bottom: var(--space-lg);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.back-link:hover {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.event-main {
  background: var(--color-card);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);
}

.event-banner {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.2);
}

.banner-badges {
  position: absolute;
  top: var(--space-lg);
  left: var(--space-lg);
  display: flex;
  gap: var(--space-2);
}

.event-type-badge,
.event-status-badge {
  padding: 6px 14px;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 600;
  backdrop-filter: blur(8px);
}

.event-type-badge.match {
  background: rgba(24, 144, 255, 0.9);
  color: white;
}

.event-type-badge.activity {
  background: rgba(250, 140, 22, 0.9);
  color: white;
}

.event-status-badge.registering {
  background: rgba(82, 196, 26, 0.9);
  color: white;
}

.event-status-badge.in_progress {
  background: rgba(250, 140, 22, 0.9);
  color: white;
}

.event-status-badge.ended {
  background: rgba(153, 153, 153, 0.9);
  color: white;
}

.event-status-badge.cancelled {
  background: rgba(255, 77, 79, 0.9);
  color: white;
}

.event-status-badge.preparing {
  background: rgba(114, 46, 209, 0.9);
  color: white;
}

.event-content {
  padding: var(--space-xl);
}

.event-title-section {
  margin-bottom: var(--space-xl);
}

.event-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 var(--space-md);
  line-height: 1.3;
}

.event-organizer {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.info-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-bg-soft);
  border-radius: var(--radius-xl);
  transition: all var(--transition-fast);
}

.info-card:hover {
  background: var(--color-primary-soft);
}

.info-card-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.time-icon {
  background: #667eea;
  color: white;
}

.location-icon {
  background: #f5576c;
  color: white;
}

.fee-icon {
  background: #4facfe;
  color: white;
}

.info-card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.info-card-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.info-card-value {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
}

.info-card-value.fee {
  color: var(--color-error);
}

.participant-section {
  background: var(--color-bg-soft);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.participant-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.participant-header h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.deadline {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.participant-progress {
  margin-bottom: var(--space-md);
}

.progress-bar {
  height: 10px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-sm);
}

.progress-fill {
  height: 100%;
  background: #667eea;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-sm);
}

.progress-stats .current {
  color: var(--color-primary);
  font-weight: 600;
}

.progress-stats .max {
  color: var(--color-text-muted);
}

.subscriber-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.subscriber-info svg {
  color: var(--color-error);
}

.detail-section {
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-xl);
  border-bottom: 1px solid var(--color-border-light);
}

.detail-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--space-md);
}

.section-title svg {
  color: var(--color-primary);
}

.section-content {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin: 0;
  white-space: pre-wrap;
}

.image-gallery {
  margin-bottom: var(--space-xl);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--space-md);
}

.gallery-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.gallery-image:hover {
  transform: scale(1.05);
}

.event-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border-light);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-xl);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  text-decoration: none;
}

.btn-subscribe {
  background: #667eea;
  color: white;
}

.btn-subscribe:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-subscribed {
  background: var(--color-bg-soft);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn-subscribed:hover:not(:disabled) {
  background: var(--color-primary-soft);
}

.btn-register {
  background: #52c41a;
  color: white;
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(82, 196, 26, 0.4);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-secondary {
  background: var(--color-bg-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-report {
  background: var(--color-bg-soft);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.btn-report:hover:not(:disabled) {
  border-color: var(--color-error);
  color: var(--color-error);
  background: var(--color-error-soft);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.registered-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-md) var(--space-xl);
  background: #52c41a;
  color: white;
  border-radius: var(--radius-xl);
  font-weight: 600;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: var(--space-md);
  color: var(--color-text-muted);
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: var(--space-lg);
}

.error-icon {
  color: var(--color-text-muted);
}

.error-state h3 {
  color: var(--color-text-secondary);
}

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
  backdrop-filter: blur(4px);
}

.modal {
  width: 90%;
  max-width: 440px;
  background: var(--color-card);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-xl);
  border-bottom: 1px solid var(--color-border-light);
}

.modal-header h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-lg);
  border: none;
  background: var(--color-bg-soft);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.modal form {
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

.form-group input {
  width: 100%;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  background: var(--color-bg-page);
  color: var(--color-text);
  box-sizing: border-box;
  transition: all var(--transition-fast);
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  background: var(--color-bg-page);
  color: var(--color-text);
  box-sizing: border-box;
  font-family: inherit;
  transition: all var(--transition-fast);
}

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  padding-top: var(--space-md);
}

@media (max-width: 768px) {
  .info-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .event-detail-container {
    padding: var(--space-md);
  }

  .event-content {
    padding: var(--space-lg);
  }

  .event-banner {
    height: 200px;
  }

  .event-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
