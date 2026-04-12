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
              <img :src="user.avatar || defaultAvatar" />
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
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'
import { board, getUser } from '@/api'

const boards = ref([])
const loading = ref(true)
const user = ref(getUser())
const defaultAvatar = 'https://via.placeholder.com/40'

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
  min-height: 100vh;
  background: var(--bg);
}

.main-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  gap: 24px;
}

.left {
  flex: 2;
}

.right {
  flex: 1;
  min-width: 280px;
}

.content-section {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
}

.section-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.board-list {
  padding: 8px;
}

.board-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: var(--radius);
  text-decoration: none;
  transition: background 0.15s;
}

.board-card:hover {
  background: var(--bg);
  text-decoration: none;
}

.board-icon-box {
  width: 48px;
  height: 48px;
  background: var(--bg);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: var(--text-secondary);
}

.board-content h3 {
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 4px;
}

.board-content p {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.loading {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}

.right-card {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  margin-bottom: 16px;
  overflow: hidden;
}

.card-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg);
}

.user-section {
  padding: 20px 16px;
}

.user-avatar {
  width: 64px;
  height: 64px;
  margin: 0 auto 12px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  text-align: center;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 13px;
  color: var(--text-muted);
}

.login-tip {
  text-align: center;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.login-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary {
  padding: 8px 20px;
  background: var(--primary);
  color: #fff;
  border-radius: var(--radius);
  text-decoration: none;
  font-size: 14px;
}

.btn-primary:hover {
  background: var(--primary-hover);
  text-decoration: none;
}

.btn-secondary {
  padding: 8px 20px;
  background: var(--card-bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-decoration: none;
  font-size: 14px;
}

.btn-secondary:hover {
  background: var(--bg);
  text-decoration: none;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: var(--border-light);
}

.feature-item {
  padding: 16px;
  text-align: center;
  background: var(--card-bg);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
}

.feature-item:hover {
  background: var(--bg);
  color: var(--text);
  text-decoration: none;
}

.hot-list {
  padding: 8px 0;
}

.hot-item {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-muted);
}
</style>
