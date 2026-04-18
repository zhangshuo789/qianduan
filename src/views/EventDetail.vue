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

      <div class="event-main ui-card">
        <div class="event-images" v-if="event.imageUrls && event.imageUrls.length">
          <img :src="event.imageUrls[0]" alt="赛事图片" class="main-image" />
          <div class="image-list" v-if="event.imageUrls.length > 1">
            <img v-for="(url, idx) in event.imageUrls.slice(1)" :key="idx" :src="url" alt="赛事图片" />
          </div>
        </div>

        <div class="event-info-section">
          <div class="event-meta">
            <span class="event-type" :class="event.type.toLowerCase()">{{ event.type === 'MATCH' ? '比赛' : '活动' }}</span>
            <span class="event-status" :class="event.status.toLowerCase()">{{ statusText(event.status) }}</span>
          </div>

          <h1 class="event-title">{{ event.title }}</h1>

          <div class="event-details">
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label">开始时间</span>
                <span class="detail-value">{{ formatTime(event.startTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">结束时间</span>
                <span class="detail-value">{{ formatTime(event.endTime) }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label">地点</span>
                <span class="detail-value">{{ event.location }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">主办方</span>
                <span class="detail-value">{{ event.organizer || '待定' }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label">费用</span>
                <span class="detail-value fee">{{ event.fee > 0 ? `¥${event.fee}` : '免费' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">报名截止</span>
                <span class="detail-value">{{ event.registrationDeadline ? formatTime(event.registrationDeadline) : '未设置' }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="detail-label">参赛人数</span>
                <span class="detail-value">{{ event.registrationCount || 0 }} / {{ event.maxParticipants }} 人</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">订阅数</span>
                <span class="detail-value">{{ event.subscriberCount || 0 }} 人</span>
              </div>
            </div>
          </div>

          <div class="event-description" v-if="event.description">
            <h3>赛事介绍</h3>
            <p>{{ event.description }}</p>
          </div>

          <div class="event-requirements" v-if="event.requirements">
            <h3>参赛要求</h3>
            <p>{{ event.requirements }}</p>
          </div>

          <div class="event-contact" v-if="event.contactInfo">
            <h3>联系方式</h3>
            <p>{{ event.contactInfo }}</p>
          </div>

          <div class="event-actions">
            <button
              class="btn btn-primary"
              v-if="canSubscribe && !event.isSubscribed"
              @click="handleSubscribe"
              :disabled="subscribing"
            >
              {{ subscribing ? '订阅中...' : '订阅赛事' }}
            </button>
            <button
              class="btn btn-secondary"
              v-if="canSubscribe && event.isSubscribed"
              @click="handleUnsubscribe"
              :disabled="subscribing"
            >
              {{ subscribing ? '取消中...' : '取消订阅' }}
            </button>

            <button
              class="btn btn-primary"
              v-if="canRegister && !event.hasRegistered"
              @click="showRegisterModal = true"
            >
              报名参赛
            </button>
            <div class="registered-badge" v-if="event.hasRegistered">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              已报名
            </div>

            <button
              v-if="user"
              class="btn btn-report"
              @click="showReportModal = true"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
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
      <h3>赛事不存在</h3>
      <router-link to="/events" class="btn btn-primary">返回列表</router-link>
    </div>

    <!-- 报名弹窗 -->
    <div class="modal-overlay" v-if="showRegisterModal" @click.self="showRegisterModal = false">
      <div class="modal ui-card">
        <h3 class="modal-title">报名参赛</h3>
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

    <!-- 举报弹窗 -->
    <div class="modal-overlay" v-if="showReportModal" @click.self="showReportModal = false">
      <div class="modal ui-card">
        <h3 class="modal-title">举报内容</h3>
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
import { event as eventApi, report as reportApi, getUser } from '@/api'
import { toastBus } from '@/utils/toast'

const route = useRoute()
const router = useRouter()
const user = getUser()

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
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--color-primary);
}

.event-main {
  overflow: hidden;
}

.event-images {
  width: 100%;
}

.main-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.image-list {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-md);
  overflow-x: auto;
}

.image-list img {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.event-info-section {
  padding: var(--space-xl);
}

.event-meta {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-md);
}

.event-type, .event-status {
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 600;
}

.event-type.match {
  background: #e8f4ff;
  color: #1890ff;
}

.event-type.activity {
  background: #fff7e6;
  color: #fa8c16;
}

.event-status.registering {
  background: #f6ffed;
  color: #52c41a;
}

.event-status.in_progress {
  background: #fff7e6;
  color: #fa8c16;
}

.event-status.ended {
  background: #f5f5f5;
  color: #999;
}

.event-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 var(--space-xl);
}

.event-details {
  background: var(--color-bg-soft);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.detail-row {
  display: flex;
  margin-bottom: var(--space-md);
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.detail-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.detail-value {
  font-size: var(--text-base);
  color: var(--color-text);
  font-weight: 500;
}

.detail-value.fee {
  color: var(--color-error);
  font-weight: 700;
}

.event-description,
.event-requirements,
.event-contact {
  margin-bottom: var(--space-xl);
}

.event-description h3,
.event-requirements h3,
.event-contact h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--space-md);
}

.event-description p,
.event-requirements p,
.event-contact p {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin: 0;
  white-space: pre-wrap;
}

.event-actions {
  display: flex;
  gap: var(--space-md);
  padding-top: var(--space-xl);
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
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
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
  background: var(--color-success);
  color: white;
  border-radius: var(--radius-lg);
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

.error-state h3 {
  color: var(--color-text-secondary);
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
  background: var(--color-card);
  border-radius: var(--radius-xl);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--space-xl);
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
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background: var(--color-bg-page);
  color: var(--color-text);
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group select,
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

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .event-detail-container {
    padding: var(--space-md);
  }

  .event-info-section {
    padding: var(--space-lg);
  }

  .detail-row {
    flex-direction: column;
    gap: var(--space-md);
  }

  .event-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
