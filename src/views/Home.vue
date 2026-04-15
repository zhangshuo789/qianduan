<template>
  <div class="home-page">
    <div class="home-hero">
      <div class="home-hero-content">
        <h1 class="home-title">欢迎来到排球社区</h1>
        <p class="home-subtitle">分享你的排球故事，与志同道合的朋友一起交流</p>
      </div>
    </div>

    <div class="main-container">
      <div class="left">
        <div class="content-section">
          <div class="section-header">
            <span class="section-title">讨论板块</span>
            <span class="section-count">{{ boards.length }} 个板块</span>
          </div>
          <div v-if="loading" class="loading">
            <div class="spinner spinner-lg"></div>
            <span>加载中...</span>
          </div>
          <div v-else class="board-list">
            <router-link
              v-for="(b, index) in boards"
              :key="b.id"
              :to="`/board/${b.id}`"
              class="board-card animate-fade-in-up"
              :style="{ animationDelay: `${index * 50}ms` }"
            >
              <div class="board-icon-box" :class="`board-icon-${(index % 5) + 1}`">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <div class="board-content">
                <h3>{{ b.name }}</h3>
                <p>{{ b.description }}</p>
              </div>
              <div class="board-arrow">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="right-card user-card" v-if="user">
          <div class="user-section">
            <div class="user-avatar-wrapper">
              <img :src="displayAvatar" class="user-avatar" />
              <div class="user-status"></div>
            </div>
            <div class="user-details">
              <div class="user-name">{{ user.nickname }}</div>
              <div class="user-stats">
                <div class="stat-item">
                  <span class="stat-value">0</span>
                  <span class="stat-label">文章</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">0</span>
                  <span class="stat-label">关注</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">0</span>
                  <span class="stat-label">粉丝</span>
                </div>
              </div>
            </div>
          </div>
          <router-link to="/create-post" class="create-post-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            发布新帖子
          </router-link>
        </div>

        <div class="right-card guest-card" v-else>
          <div class="guest-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <p class="login-tip">登录后查看更多信息</p>
          <div class="login-btns">
            <router-link to="/login" class="ui-button ui-button-primary">登录</router-link>
            <router-link to="/register" class="ui-button ui-button-secondary">注册</router-link>
          </div>
        </div>

        <div class="right-card">
          <div class="card-header">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            功能入口
          </div>
          <div class="feature-grid">
            <router-link to="/announcement" class="feature-item">
              <div class="feature-icon feature-icon-1">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <span>公告</span>
            </router-link>
            <router-link to="/feedback" class="feature-item">
              <div class="feature-icon feature-icon-2">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </div>
              <span>问题反馈</span>
            </router-link>
            <router-link to="/about" class="feature-item">
              <div class="feature-icon feature-icon-3">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </div>
              <span>关于我们</span>
            </router-link>
            <router-link to="/help" class="feature-item">
              <div class="feature-icon feature-icon-4">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <span>帮助中心</span>
            </router-link>
          </div>
        </div>

        <div class="right-card">
          <div class="card-header">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
            热门帖子
          </div>
          <div class="hot-list">
            <div class="hot-empty">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span>暂无热门帖子</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { board, getUser, getAvatarUrl } from '@/api'

const boards = ref([])
const loading = ref(true)
const user = ref(getUser())
const defaultAvatar = 'https://via.placeholder.com/40'
const displayAvatar = ref(defaultAvatar)

async function updateDisplayAvatar() {
  if (user.value?.avatar) {
    const url = await getAvatarUrl(user.value.avatar)
    displayAvatar.value = url || defaultAvatar
  } else {
    displayAvatar.value = defaultAvatar
  }
}

watch(user, updateDisplayAvatar, { immediate: true })

onMounted(async () => {
  try {
    const res = await board.list()
    boards.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.home-page {
  min-height: 100%;
}

.home-hero {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  padding: var(--space-12) var(--space-lg);
  margin-bottom: var(--space-lg);
}

.home-hero-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.home-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: white;
  margin-bottom: var(--space-3);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.home-subtitle {
  font-size: var(--text-lg);
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg) var(--space-lg);
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-lg);
}

.left {
  min-width: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.section-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

.section-count {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.board-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.board-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  background: var(--color-card);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);
  text-decoration: none;
  transition: all var(--transition-normal);
  cursor: pointer;
}

.board-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
  border-color: var(--color-primary-light);
}

.board-icon-box {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.board-icon-1 { background: linear-gradient(135deg, #FF6B35 0%, #FF8A5C 100%); }
.board-icon-2 { background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%); }
.board-icon-3 { background: linear-gradient(135deg, #10B981 0%, #34D399 100%); }
.board-icon-4 { background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); }
.board-icon-5 { background: linear-gradient(135deg, #EC4899 0%, #F472B6 100%); }

.board-content {
  flex: 1;
  min-width: 0;
}

.board-card h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.board-card p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.board-arrow {
  color: var(--color-text-muted);
  transition: transform var(--transition-fast), color var(--transition-fast);
}

.board-card:hover .board-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}

.right {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.right-card {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-md);
}

.user-card {
  background: linear-gradient(135deg, var(--color-card) 0%, var(--color-bg-soft) 100%);
}

.user-section {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.user-avatar-wrapper {
  position: relative;
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 3px solid white;
  box-shadow: var(--shadow-md);
}

.user-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: var(--color-success);
  border: 3px solid white;
  border-radius: var(--radius-full);
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.user-stats {
  display: flex;
  gap: var(--space-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.create-post-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3);
  background: var(--color-primary-gradient);
  color: white;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  text-decoration: none;
  transition: all var(--transition-fast);
}

.create-post-btn:hover {
  box-shadow: var(--shadow-primary);
  transform: translateY(-2px);
}

.guest-card {
  text-align: center;
}

.guest-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-soft);
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
}

.login-tip {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.login-btns {
  display: flex;
  gap: var(--space-2);
}

.login-btns .ui-button {
  flex: 1;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-md);
  background: var(--color-bg-soft);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.feature-item:hover {
  background: var(--color-primary-soft);
  transform: translateY(-2px);
}

.feature-item span {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.feature-item:hover span {
  color: var(--color-primary);
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.feature-icon-1 { background: linear-gradient(135deg, #FF6B35 0%, #FF8A5C 100%); }
.feature-icon-2 { background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%); }
.feature-icon-3 { background: linear-gradient(135deg, #10B981 0%, #34D399 100%); }
.feature-icon-4 { background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); }

.hot-list {
  min-height: 100px;
}

.hot-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-lg);
  color: var(--color-text-muted);
}

.hot-empty span {
  font-size: var(--text-sm);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  background: var(--color-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);
  color: var(--color-text-secondary);
}

@media (max-width: 960px) {
  .main-container {
    grid-template-columns: 1fr;
  }

  .home-hero {
    padding: var(--space-8) var(--space-lg);
  }

  .home-title {
    font-size: var(--text-2xl);
  }
}

@media (max-width: 640px) {
  .main-container {
    padding: 0 var(--space-md) var(--space-md);
  }

  .home-hero {
    padding: var(--space-6) var(--space-md);
  }

  .board-card {
    padding: var(--space-md);
  }

  .board-icon-box {
    width: 48px;
    height: 48px;
  }

  .feature-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
