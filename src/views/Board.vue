<template>
  <div class="board-page">
    <div class="main-container">
      <div class="content-area">
        <div class="board-header">
          <div class="board-info">
            <h1>{{ boardInfo?.name || '加载中...' }}</h1>
            <p>{{ boardInfo?.description }}</p>
          </div>
          <router-link v-if="user" :to="`/create-post?boardId=${boardId}`" class="btn-primary">
            发布帖子
          </router-link>
        </div>

        <div v-if="loading" class="loading">加载中...</div>
        <div v-else class="post-list">
          <div v-if="posts.length === 0" class="empty"><p>暂无帖子</p></div>
          <router-link v-for="p in posts" :key="p.id" :to="`/post/${p.id}`" class="post-item">
            <div class="post-main">
              <h3>{{ p.title }}</h3>
              <div class="post-meta">
                <span class="author">{{ p.user.nickname }}</span>
                <span class="dot"></span>
                <span>{{ formatDate(p.createdAt) }}</span>
              </div>
            </div>
            <div class="post-arrow">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </router-link>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button :disabled="page <= 0" @click="loadPosts(page - 1)">上一页</button>
          <span>{{ page + 1 }} / {{ totalPages }}</span>
          <button :disabled="page >= totalPages - 1" @click="loadPosts(page + 1)">下一页</button>
        </div>
      </div>

      <div class="sidebar">
        <div class="sidebar-card">
          <div class="card-header">板块信息</div>
          <div class="card-body">
            <p v-if="boardInfo">{{ boardInfo.description }}</p>
            <p v-else>加载中...</p>
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
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.main-container {
  display: flex;
  gap: var(--space-lg);
}

.content-area {
  flex: 2;
}

.sidebar {
  flex: 1;
  min-width: 280px;
}

.board-header {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.board-header h1 {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-secondary);
  margin-bottom: var(--space-xs);
}

.board-header p {
  color: var(--color-text-secondary);
  font-size: var(--text-base);
}

.btn-primary {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-md);
  text-decoration: none;
  font-size: var(--text-sm);
  white-space: nowrap;
  transition: background var(--transition-fast);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  text-decoration: none;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.post-item {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  cursor: pointer;
  display: flex;
  align-items: center;
  text-decoration: none;
}

.post-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  text-decoration: none;
}

.post-main {
  flex: 1;
}

.post-main h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.post-meta {
  display: flex;
  align-items: center;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.author {
  font-weight: 600;
  color: var(--color-text);
}

.dot {
  width: 3px;
  height: 3px;
  background: var(--color-text-muted);
  border-radius: 50%;
  margin: 0 var(--space-sm);
}

.post-arrow {
  color: var(--color-text-muted);
}

.empty {
  text-align: center;
  padding: var(--space-2xl);
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.empty p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.loading {
  padding: var(--space-2xl);
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}

.sidebar-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.card-header {
  padding: var(--space-md) var(--space-lg);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
}

.card-body {
  padding: var(--space-lg);
  font-size: var(--text-base);
  color: var(--color-text-secondary);
}
</style>
