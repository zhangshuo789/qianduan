<template>
  <div class="event-detail-page ui-page">
    <div class="event-detail-container" ref="pageRef">
      <!-- 返回 -->
      <header class="page-header ui-card ui-pop-in">
        <router-link to="/events" class="back-link">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </router-link>
        <h1 class="page-title">赛事详情</h1>
      </header>

      <div v-if="loading" class="ui-card ui-loading">加载中...</div>

      <template v-else-if="event">
        <!-- 赛事信息卡片 -->
        <section class="event-info ui-card">
          <div class="info-header">
            <div class="info-badges">
              <span class="badge badge-format">{{ formatLabel(event.format) }}</span>
              <span class="badge" :class="'badge-' + event.status?.toLowerCase()">{{ statusLabel(event.status) }}</span>
            </div>
            <h2 class="event-title">{{ event.title }}</h2>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">开赛时间</span>
              <span class="info-value">{{ formatTime(event.startTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">结束时间</span>
              <span class="info-value">{{ formatTime(event.endTime) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">比赛地点</span>
              <span class="info-value">{{ event.location }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">队伍数</span>
              <span class="info-value">{{ event.registrationCount || 0 }}/{{ event.bracketSize }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">关注人数</span>
              <span class="info-value">{{ event.subscriberCount || 0 }}</span>
            </div>
            <div v-if="event.organizer" class="info-item">
              <span class="info-label">主办方</span>
              <span class="info-value">{{ event.organizer }}</span>
            </div>
            <div v-if="event.fee" class="info-item">
              <span class="info-label">报名费</span>
              <span class="info-value">&yen;{{ event.fee }}</span>
            </div>
            <div v-if="event.contactInfo" class="info-item">
              <span class="info-label">联系方式</span>
              <span class="info-value">{{ event.contactInfo }}</span>
            </div>
            <div v-if="event.requirements" class="info-item info-full">
              <span class="info-label">参赛要求</span>
              <span class="info-value">{{ event.requirements }}</span>
            </div>
          </div>

          <p v-if="event.description" class="event-desc">{{ event.description }}</p>

          <!-- 报名按钮 -->
          <div v-if="event.status === 'REGISTERING'" class="action-bar">
            <div class="action-left">
              <template v-if="event.hasRegistered">
                <span class="registered-tag">&#10003; 已报名</span>
              </template>
              <template v-else>
                <button
                  class="ui-button ui-button-primary"
                  :disabled="registering"
                  @click="showRegisterModal = true"
                >{{ registering ? '报名中...' : '立即报名' }}</button>
              </template>
              <span v-if="event.bracketSize" class="action-hint">
                还剩 {{ event.bracketSize - (event.registrationCount || 0) }} 个名额
              </span>
            </div>
            <button
              class="subscribe-btn"
              :class="{ subscribed: event.isSubscribed }"
              @click="toggleSubscribe"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path v-if="event.isSubscribed" d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" fill="currentColor"/>
                <path v-else d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/>
              </svg>
              {{ event.isSubscribed ? '已订阅' : '订阅' }}
            </button>
          </div>
          <div v-else-if="event.status === 'IN_PROGRESS'" class="action-bar">
            <span class="status-hint">比赛进行中，查看对阵图 &darr;</span>
            <button
              class="subscribe-btn"
              :class="{ subscribed: event.isSubscribed }"
              @click="toggleSubscribe"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path v-if="event.isSubscribed" d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" fill="currentColor"/>
                <path v-else d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/>
              </svg>
              {{ event.isSubscribed ? '已订阅' : '订阅' }}
            </button>
          </div>
          <div v-else-if="event.status === 'ENDED' && champion" class="action-bar champion-bar">
            <div class="action-left">
              <span class="champion-icon">&#127942;</span>
              <span class="champion-text">冠军：{{ champion.teamName }}</span>
            </div>
          </div>
        </section>

        <!-- 组织者操作面板 -->
        <section v-if="isOrganizer && event.status !== 'IN_PROGRESS'" class="control-panel ui-card">
          <h3 class="panel-title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.26.46.4 1 .4 1.51V11a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.09-1.51z"/>
            </svg>
            组织者操作
          </h3>
          <div class="control-actions">
            <button
              v-if="event.status === 'REGISTERING'"
              class="ui-button ui-button-primary"
              :disabled="actionLoading"
              @click="handleStartBracket"
            >{{ actionLoading ? '开赛中...' : '手动开赛' }}</button>
            <button
              v-if="event.status === 'REGISTERING'"
              class="ui-button ui-button-ghost"
              @click="showAddTeamModal = true"
            >添加队伍</button>
            <button
              v-if="event.status === 'REGISTERING'"
              class="ui-button ui-button-ghost"
              :disabled="actionLoading"
              @click="handleRebuildBracket"
            >{{ actionLoading ? '重建中...' : '重新排列' }}</button>
          </div>
        </section>

        <!-- 对阵图 -->
        <section v-if="bracket" class="bracket-section ui-card">
          <div class="bracket-header">
            <h3 class="bracket-title">对阵图</h3>
            <button class="ui-button ui-button-ghost" @click="loadBracket">刷新</button>
          </div>
          <BracketView
            :rounds="bracket.rounds"
            :event-status="event.status"
            :is-organizer="isOrganizer"
            @match-click="handleMatchClick"
          />
        </section>
        <section v-else-if="bracketLoading" class="ui-card ui-loading">加载对阵图...</section>
      </template>

      <!-- 报名弹窗 -->
      <div v-if="showRegisterModal" class="modal-overlay" @click.self="showRegisterModal = false">
        <div class="modal-panel ui-card ui-pop-in">
          <div class="modal-header">
            <h2 class="modal-title">报名参赛</h2>
            <button class="modal-close" @click="showRegisterModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-item">
              <label class="form-label">队伍名称 <span class="required">*</span></label>
              <input v-model="teamName" type="text" class="form-input" placeholder="输入你的队伍名称" maxlength="50" />
            </div>
            <p class="form-hint">报名后将自动分配对阵位置</p>
          </div>
          <div v-if="registerError" class="form-error">{{ registerError }}</div>
          <div class="modal-footer">
            <button class="ui-button ui-button-ghost" @click="showRegisterModal = false">取消</button>
            <button class="ui-button ui-button-primary" :disabled="registering" @click="handleRegister">
              {{ registering ? '报名中...' : '确认报名' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 选胜者弹窗 -->
      <div v-if="showResultModal" class="modal-overlay" @click.self="showResultModal = false">
        <div class="modal-panel ui-card ui-pop-in">
          <div class="modal-header">
            <h2 class="modal-title">记录比赛结果</h2>
            <button class="modal-close" @click="showResultModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <p class="match-info" v-if="selectedMatch">
              <strong>{{ selectedMatch.team1?.teamName }}</strong> vs <strong>{{ selectedMatch.team2?.teamName }}</strong>
            </p>
            <div class="form-item">
              <label class="form-label">选择胜者 <span class="required">*</span></label>
              <div class="radio-group" v-if="selectedMatch">
                <label class="radio-option" :class="{ active: resultForm.winnerId === selectedMatch.team1?.registrationId }">
                  <input v-model="resultForm.winnerId" type="radio" :value="selectedMatch.team1?.registrationId" />
                  <span>{{ selectedMatch.team1?.teamName }}</span>
                </label>
                <label class="radio-option" :class="{ active: resultForm.winnerId === selectedMatch.team2?.registrationId }">
                  <input v-model="resultForm.winnerId" type="radio" :value="selectedMatch.team2?.registrationId" />
                  <span>{{ selectedMatch.team2?.teamName }}</span>
                </label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-item">
                <label class="form-label">队伍1比分</label>
                <input v-model.number="resultForm.score1" type="number" class="form-input" min="0" placeholder="0" />
              </div>
              <div class="form-item">
                <label class="form-label">队伍2比分</label>
                <input v-model.number="resultForm.score2" type="number" class="form-input" min="0" placeholder="0" />
              </div>
            </div>
          </div>
          <div v-if="resultError" class="form-error">{{ resultError }}</div>
          <div class="modal-footer">
            <button class="ui-button ui-button-ghost" @click="showResultModal = false">取消</button>
            <button class="ui-button ui-button-primary" :disabled="actionLoading" @click="handleSetResult">
              {{ actionLoading ? '提交中...' : '确认结果' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 添加队伍弹窗 -->
      <div v-if="showAddTeamModal" class="modal-overlay" @click.self="showAddTeamModal = false">
        <div class="modal-panel ui-card ui-pop-in">
          <div class="modal-header">
            <h2 class="modal-title">手动添加队伍</h2>
            <button class="modal-close" @click="showAddTeamModal = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-item">
              <label class="form-label">队伍名称 <span class="required">*</span></label>
              <input v-model="addTeamForm.teamName" type="text" class="form-input" placeholder="输入队伍名称" />
              <p class="form-hint">系统将自动分配对阵位置</p>
            </div>
          </div>
          <div v-if="addTeamError" class="form-error">{{ addTeamError }}</div>
          <div class="modal-footer">
            <button class="ui-button ui-button-ghost" @click="showAddTeamModal = false">取消</button>
            <button class="ui-button ui-button-primary" :disabled="actionLoading" @click="handleAddTeam">
              {{ actionLoading ? '添加中...' : '添加队伍' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { event as eventApi, getUser } from '@/api'
import BracketView from '@/components/BracketView.vue'

const route = useRoute()
const pageRef = ref(null)
const loading = ref(true)
const event = ref(null)
const bracket = ref(null)
const bracketLoading = ref(false)
const actionLoading = ref(false)

// 报名
const showRegisterModal = ref(false)
const teamName = ref('')
const registering = ref(false)
const registerError = ref('')

// 选胜者
const showResultModal = ref(false)
const selectedMatch = ref(null)
const resultForm = ref({ winnerId: null, score1: null, score2: null })
const resultError = ref('')

// 添加队伍
const showAddTeamModal = ref(false)
const addTeamForm = ref({ teamName: '' })
const addTeamError = ref('')

const isOrganizer = computed(() => {
  const user = getUser()
  return user && event.value && (
    event.value.createdBy?.id === user.id || user.isAdmin
  )
})

const champion = computed(() => {
  if (!bracket.value) return null
  for (const round of bracket.value.rounds) {
    for (const match of round.matches) {
      if (match.team1?.isChampion) return match.team1
      if (match.team2?.isChampion) return match.team2
    }
  }
  return null
})

const formatMap = {
  SINGLE_ELIMINATION: '单败淘汰',
  GROUP_ELIMINATION: '小组+淘汰'
}
const statusMap = {
  REGISTERING: '报名中',
  IN_PROGRESS: '进行中',
  ENDED: '已结束',
  CANCELLED: '已取消'
}

function formatLabel(format) { return formatMap[format] || format }
function statusLabel(status) { return statusMap[status] || status }

function formatTime(time) {
  if (!time) return ''
  const d = new Date(time)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}年${m}月${day}日 ${h}:${min}`
}

// 首次加载：显示骨架屏
async function loadEvent() {
  loading.value = true
  try {
    const res = await eventApi.getDetail(route.params.id)
    event.value = res.data
  } catch (e) {
    console.error('加载赛事详情失败:', e)
  } finally {
    loading.value = false
  }
}

// 静默刷新：不触发 loading，不滚动页面
async function refreshEvent() {
  try {
    const res = await eventApi.getDetail(route.params.id)
    event.value = res.data
  } catch (e) {
    console.error('刷新赛事详情失败:', e)
  }
}

async function loadBracket() {
  bracketLoading.value = true
  try {
    const res = await eventApi.getBracket(route.params.id)
    bracket.value = res.data
  } catch (e) {
    console.error('加载对阵图失败:', e)
  } finally {
    bracketLoading.value = false
  }
}

async function refreshAll() {
  await Promise.all([refreshEvent(), loadBracket()])
}

async function handleRegister() {
  if (!teamName.value.trim()) {
    registerError.value = '请输入队伍名称'
    return
  }
  registering.value = true
  registerError.value = ''
  try {
    await eventApi.register(route.params.id, teamName.value.trim())
    showRegisterModal.value = false
    teamName.value = ''
    await refreshAll()
  } catch (e) {
    registerError.value = e.message
  } finally {
    registering.value = false
  }
}

async function toggleSubscribe() {
  if (!getUser()) { alert('请先登录'); return }
  try {
    if (event.value.isSubscribed) {
      await eventApi.unsubscribe(route.params.id)
      event.value.isSubscribed = false
      event.value.subscriberCount = Math.max(0, (event.value.subscriberCount || 1) - 1)
    } else {
      await eventApi.subscribe(route.params.id)
      event.value.isSubscribed = true
      event.value.subscriberCount = (event.value.subscriberCount || 0) + 1
    }
  } catch (e) {
    alert(e.message)
  }
}

async function handleStartBracket() {
  actionLoading.value = true
  try {
    await eventApi.startBracket(route.params.id)
    await refreshAll()
  } catch (e) {
    alert(e.message)
  } finally {
    actionLoading.value = false
  }
}

async function handleRebuildBracket() {
  if (!confirm('重新排列将重置所有对阵，确认继续？')) return
  actionLoading.value = true
  try {
    await eventApi.rebuildBracket(route.params.id)
    await refreshAll()
  } catch (e) {
    alert(e.message)
  } finally {
    actionLoading.value = false
  }
}

function handleMatchClick(match) {
  if (!isOrganizer.value) return
  if (match.status !== 'PENDING' || !match.team1 || !match.team2) return
  selectedMatch.value = match
  resultForm.value = { winnerId: null, score1: null, score2: null }
  resultError.value = ''
  showResultModal.value = true
}

async function handleSetResult() {
  if (!resultForm.value.winnerId) {
    resultError.value = '请选择胜者'
    return
  }
  actionLoading.value = true
  resultError.value = ''
  try {
    await eventApi.setMatchResult(route.params.id, selectedMatch.value.matchId, {
      winnerId: resultForm.value.winnerId,
      score1: resultForm.value.score1,
      score2: resultForm.value.score2
    })
    showResultModal.value = false
    await refreshAll()
  } catch (e) {
    resultError.value = e.message
  } finally {
    actionLoading.value = false
  }
}

async function handleAddTeam() {
  if (!addTeamForm.value.teamName.trim()) {
    addTeamError.value = '请输入队伍名称'
    return
  }
  actionLoading.value = true
  addTeamError.value = ''
  try {
    await eventApi.addTeam(route.params.id, addTeamForm.value.teamName.trim())
    showAddTeamModal.value = false
    addTeamForm.value = { teamName: '' }
    await refreshAll()
  } catch (e) {
    addTeamError.value = e.message
  } finally {
    actionLoading.value = false
  }
}

onMounted(async () => {
  await loadEvent()
  loadBracket()
})

// 监听 SSE 事件，自动刷新对阵图
function onSseEvent() {
  refreshAll()
}
window.addEventListener('sse:eventUpdate', onSseEvent)
window.addEventListener('sse:eventStatusChanged', onSseEvent)
window.addEventListener('sse:matchResult', onSseEvent)
window.addEventListener('sse:championCrowned', onSseEvent)
</script>

<style scoped>
.event-detail-page {
  min-height: calc(100vh - 72px);
  padding: var(--space-6);
}

.event-detail-container {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.page-header {
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-xl);
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

/* 赛事信息卡片 */
.event-info {
  padding: var(--space-6);
  border-radius: var(--radius-xl);
}

.info-header {
  margin-bottom: var(--space-5);
}

.info-badges {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.badge {
  padding: 4px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.badge-format {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.badge-registering {
  background: #e6f7ff;
  color: #1890ff;
}

.badge-in_progress {
  background: #f6ffed;
  color: #52c41a;
}

.badge-ended {
  background: var(--color-bg-soft);
  color: var(--color-text-muted);
}

.badge-cancelled {
  background: #fff1f0;
  color: #ff4d4f;
}

.event-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-4) var(--space-5);
  margin-bottom: var(--space-5);
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-soft);
  border-radius: var(--radius-lg);
}

.info-full {
  grid-column: 1 / -1;
}

.info-label {
  display: block;
  font-size: 11px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.info-value {
  font-size: var(--text-sm);
  color: var(--color-text);
  font-weight: 600;
}

.event-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0 0 var(--space-5);
  white-space: pre-line;
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border-light);
}

.action-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.subscribe-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-md);
  border: 1.5px solid var(--color-border);
  background: white;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.subscribe-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.subscribe-btn.subscribed {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.action-hint {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.registered-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: #f6ffed;
  color: #52c41a;
  border: 1.5px solid #b7eb8f;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 600;
}

.status-hint {
  font-size: var(--text-sm);
  color: var(--color-primary);
  font-weight: 500;
}

.champion-bar {
  gap: var(--space-2);
}

.champion-icon {
  font-size: 24px;
}

.champion-text {
  font-size: var(--text-base);
  font-weight: 700;
  color: #d48806;
}

/* 组织者操作面板 */
.control-panel {
  padding: var(--space-5) var(--space-6);
  border-radius: var(--radius-xl);
  border-left: 4px solid var(--color-primary);
  background: linear-gradient(135deg, var(--color-primary-soft) 0%, var(--color-card) 100%);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: 600;
  margin: 0 0 var(--space-4);
  color: var(--color-primary);
}

.control-actions {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

/* 对阵图区域 */
.bracket-section {
  padding: var(--space-5) var(--space-6);
  border-radius: var(--radius-xl);
}

.bracket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border-light);
}

.bracket-title {
  font-size: var(--text-base);
  font-weight: 600;
  margin: 0;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--space-4);
}

.modal-panel {
  width: 100%;
  max-width: 440px;
  padding: 0;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-2xl);
  background: var(--color-card);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-bg-soft);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: 700;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  font-size: 20px;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--color-error-soft);
  color: var(--color-error);
}

.modal-body {
  padding: var(--space-5);
}

.match-info {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-4);
  text-align: center;
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

.form-hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.form-error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0 var(--space-5);
  padding: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-error);
  background: var(--color-error-soft);
  border-radius: var(--radius-md);
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
  text-align: center;
}

.radio-option input {
  display: none;
}

.radio-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border-light);
  background: var(--color-bg-soft);
}

@media (max-width: 640px) {
  .event-detail-page {
    padding: var(--space-4);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
