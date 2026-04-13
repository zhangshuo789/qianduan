<template>
  <div class="home-page">
    <NavBar />

    <div class="main-container">
      <div class="left">
        <div class="content-section">
          <div class="section-header">
            <span class="section-title">讨论板块</span>
          </div>
          <div v-if="loading" class="loading">加载中...</div>
          <div v-else class="board-list">
            <router-link
              v-for="b in boards"
              :key="b.id"
              :to="`/board/${b.id}`"
              class="board-card"
            >
              <div class="board-icon-box">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <div class="board-content">
                <h3>{{ b.name }}</h3>
                <p>{{ b.description }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="right-card">
          <div class="user-section" v-if="user">
            <div class="user-avatar">
              <img :src="displayAvatar" />
            </div>
            <div class="user-details">
              <div class="user-name">{{ user.nickname }}</div>
              <div class="user-stats">
                <span>文章 0</span>
                <span>关注 0</span>
                <span>粉丝 0</span>
              </div>
            </div>
          </div>
          <div class="user-section" v-else>
            <p class="login-tip">登录后查看更多信息</p>
            <div class="login-btns">
              <router-link to="/login" class="btn-primary">登录</router-link>
              <router-link to="/register" class="btn-secondary">注册</router-link>
            </div>
          </div>
        </div>

        <div class="right-card">
          <div class="card-header">功能入口</div>
          <div class="feature-grid">
            <router-link to="/announcement" class="feature-item">公告</router-link>
            <router-link to="/feedback" class="feature-item">问题反馈</router-link>
            <router-link to="/about" class="feature-item">关于我们</router-link>
            <router-link to="/help" class="feature-item">帮助中心</router-link>
          </div>
        </div>

        <div class="right-card">
          <div class="card-header">热门帖子</div>
          <div class="hot-list">
            <div class="hot-item">暂无热门帖子</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import NavBar from '@/components/NavBar.vue'
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
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.home-header {
  margin-bottom: var(--space-lg);
}

.home-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-secondary);
}

.home-subtitle {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}

.main-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--space-lg);
}

.left h2,
.user-section h2 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-secondary);
  margin-bottom: var(--space-md);
}

.board-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.board-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  cursor: pointer;
}

.board-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.board-card h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-secondary);
  margin-bottom: var(--space-xs);
}

.board-card p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.right-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
}

.user-section {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--text-lg);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.user-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
}

.user-stats {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}

.active-users {
  margin-top: var(--space-lg);
}

.active-users h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-secondary);
  margin-bottom: var(--space-sm);
}

.active-users-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.active-user-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .main-container {
    grid-template-columns: 1fr;
  }

  .user-section {
    order: -1;
  }
}
</style>
