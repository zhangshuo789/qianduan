<template>
  <div class="board-page">
    <div class="board-hero" v-if="boardInfo">
      <div class="board-hero-content">
        <div class="board-icon">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
        </div>
        <div class="board-info">
          <h1>{{ boardInfo.name }}</h1>
          <p>{{ boardInfo.description }}</p>
        </div>
        <router-link v-if="user" :to="`/create-post?boardId=${boardId}`" class="btn-create">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          发布帖子
        </router-link>
      </div>
    </div>

    <div class="main-container">
      <div class="content-area">
        <div v-if="loading" class="loading">
          <div class="spinner spinner-lg"></div>
          <span>加载中...</span>
        </div>
        <div v-else class="post-list">
          <div v-if="posts.length === 0" class="empty">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>暂无帖子</p>
            <router-link v-if="user" :to="`/create-post?boardId=${boardId}`" class="btn-create-small">
              发布第一篇帖子
            </router-link>
          </div>
          <router-link 
            v-for="(p, index) in posts" 
            :key="p.id" 
            :to="`/post/${p.id}`" 
            class="post-item animate-fade-in-up"
            :style="{ animationDelay: `${index * 50}ms` }"
          >
            <div class="post-main">
              <h3>{{ p.title }}</h3>
              <div class="post-meta">
                <router-link :to="`/user/${p.user.id}`" class="author" @click.stop>
                  <img :src="p.user.avatar || '/default-avatar.png'" class="author-avatar" />
                  <span>{{ p.user.nickname }}</span>
                </router-link>
                <span class="meta-dot"></span>
                <span class="meta-time">{{ formatDate(p.createdAt) }}</span>
              </div>
            </div>
            <div class="post-arrow">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </router-link>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="page <= 0" @click="loadPosts(page - 1)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            上一页
          </button>
          <div class="page-info">
            <span class="page-current">{{ page + 1 }}</span>
            <span class="page-divider">/</span>
            <span class="page-total">{{ totalPages }}</span>
          </div>
          <button class="page-btn" :disabled="page >= totalPages - 1" @click="loadPosts(page + 1)">
            下一页
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="sidebar">
        <div class="sidebar-card">
          <div class="card-header">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            板块信息
          </div>
          <div class="card-body">
            <p class="board-desc">{{ boardInfo?.description || '加载中...' }}</p>
            <div class="board-stats">
              <div class="stat-item">
                <span class="stat-value">{{ posts.length }}</span>
                <span class="stat-label">帖子</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ totalPages }}</span>
                <span class="stat-label">页数</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-card" v-if="user">
          <div class="card-header">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            快捷操作
          </div>
          <div class="card-body">
            <router-link :to="`/create-post?boardId=${boardId}`" class="quick-action">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              发布新帖子
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { board, getUser } from '@/api'

const route = useRoute()
const boardId = ref(route.params.id)
const boardInfo = ref(null)
const posts = ref([])
const loading = ref(true)
const page = ref(0)
const totalPages = ref(0)
const user = getUser()

function formatDate(d) {
  return new Date(d).toLocaleDateString('zh-CN')
}

async function loadBoardInfo() {
  try {
    const res = await board.list()
    boardInfo.value = res.data.find(b => b.id == boardId.value)
  } catch (e) {
    console.error(e)
  }
}

async function loadPosts(p = 0) {
  loading.value = true
  try {
    const res = await board.getPosts(boardId.value, p)
    posts.value = res.data.content
    totalPages.value = res.data.totalPages
    page.value = p
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadBoardInfo()
  loadPosts()
})
</script>

<style scoped>
.board-page {
  min-height: calc(100vh - 72px);
}

.board-hero {
  background: var(--color-primary-gradient);
  padding: var(--space-2xl) var(--space-lg);
  margin-bottom: var(--space-lg);
}

.board-hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.board-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.board-info {
  flex: 1;
}

.board-info h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: white;
  margin-bottom: var(--space-1);
}

.board-info p {
  font-size: var(--text-base);
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-lg);
  background: white;
  color: var(--color-primary);
  border-radius: var(--radius-lg);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 600;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  text-decoration: none;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg) var(--space-lg);
  display: flex;
  gap: var(--space-lg);
}

.content-area {
  flex: 2;
  min-width: 0;
}

.sidebar {
  flex: 1;
  min-width: 280px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.post-item {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  padding: var(--space-lg);
  transition: all var(--transition-fast);
  cursor: pointer;
  display: flex;
  align-items: center;
  text-decoration: none;
  border: 1px solid var(--color-border-light);
}

.post-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-light);
  text-decoration: none;
}

.post-main {
  flex: 1;
  min-width: 0;
}

.post-main h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-meta {
  display: flex;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.author {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text);
  font-weight: 500;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.author:hover {
  color: var(--color-primary);
}

.author-avatar {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.meta-dot {
  width: 4px;
  height: 4px;
  background: var(--color-text-muted);
  border-radius: var(--radius-full);
  margin: 0 var(--space-2);
}

.meta-time {
  color: var(--color-text-muted);
}

.post-arrow {
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.post-item:hover .post-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}

.empty {
  text-align: center;
  padding: var(--space-2xl);
  background: var(--color-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
}

.empty svg {
  color: var(--color-text-muted);
  margin-bottom: var(--space-md);
}

.empty p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.btn-create-small {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-md);
  background: var(--color-primary-gradient);
  color: white;
  border-radius: var(--radius-lg);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-create-small:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-primary);
  text-decoration: none;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  background: var(--color-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-xl);
}

.page-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-md);
  background: var(--color-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-md);
  background: var(--color-bg-soft);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
}

.page-current {
  font-weight: 600;
  color: var(--color-primary);
}

.page-divider {
  color: var(--color-text-muted);
}

.page-total {
  color: var(--color-text-secondary);
}

.sidebar-card {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  margin-bottom: var(--space-md);
  border: 1px solid var(--color-border-light);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-md) var(--space-lg);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-bg-soft);
}

.card-header svg {
  color: var(--color-primary);
}

.card-body {
  padding: var(--space-lg);
}

.board-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-lg);
}

.board-stats {
  display: flex;
  gap: var(--space-lg);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}

.quick-action {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-md);
  background: var(--color-primary-gradient);
  color: white;
  border-radius: var(--radius-lg);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.quick-action:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-primary);
  text-decoration: none;
}

.quick-action svg {
  color: white;
}

@media (max-width: 768px) {
  .board-hero-content {
    flex-direction: column;
    text-align: center;
  }

  .board-info h1 {
    font-size: var(--text-xl);
  }

  .main-container {
    flex-direction: column;
  }

  .sidebar {
    min-width: auto;
  }
}
</style>
