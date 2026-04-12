<template>
  <div class="board-page">
    <NavBar />

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
          <div v-if="posts.length === 0" class="empty">暂无帖子</div>
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
import NavBar from '@/components/NavBar.vue'
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
    alert(e.message)
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

.content-area {
  flex: 2;
}

.sidebar {
  flex: 1;
  min-width: 280px;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
}

.board-info h1 {
  font-size: 22px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.board-info p {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

.btn-primary {
  padding: 8px 16px;
  background: var(--primary);
  color: #fff;
  border-radius: var(--radius);
  text-decoration: none;
  font-size: 14px;
  white-space: nowrap;
}

.btn-primary:hover {
  background: var(--primary-hover);
  text-decoration: none;
}

.post-list {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  overflow: hidden;
}

.post-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  text-decoration: none;
  transition: background 0.15s;
}

.post-item:last-child {
  border-bottom: none;
}

.post-item:hover {
  background: var(--bg);
  text-decoration: none;
}

.post-main {
  flex: 1;
}

.post-main h3 {
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 6px;
}

.post-meta {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--text-muted);
}

.author {
  color: var(--text-secondary);
}

.dot {
  width: 3px;
  height: 3px;
  background: var(--text-muted);
  border-radius: 50%;
  margin: 0 8px;
}

.post-arrow {
  color: var(--text-muted);
}

.empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-muted);
}

.loading {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-muted);
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  background: var(--card-bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 14px;
}

.pagination button:disabled {
  color: var(--text-muted);
  cursor: not-allowed;
}

.sidebar-card {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
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

.card-body {
  padding: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}
</style>
