<template>
  <div class="profile-page">
    <NavBar />

    <div class="main-container">
      <div class="content-area">
        <div v-if="loading" class="loading">加载中...</div>
        <template v-else-if="userInfo">
          <div class="profile-card">
            <div class="profile-header">
              <img :src="displayAvatar" class="profile-avatar" />
              <div class="profile-info">
                <h1>{{ userInfo.nickname }}</h1>
                <p class="bio">{{ userInfo.bio || '暂无简介' }}</p>
                <p class="join-date">加入于 {{ formatDate(userInfo.createdAt) }}</p>
              </div>
              <router-link v-if="isSelf" to="/edit-profile" class="btn-edit-profile">编辑资料</router-link>
              <button v-else-if="user" class="btn-follow">关注</button>
            </div>
          </div>

          <!-- 标签页 -->
          <div class="profile-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- 我的帖子 -->
          <div v-if="activeTab === 'posts'" class="tab-content">
            <div v-if="postsLoading" class="loading">加载中...</div>
            <div v-else-if="posts.length === 0" class="empty">暂无帖子</div>
            <div v-else class="post-list">
              <router-link v-for="p in posts" :key="p.id" :to="`/post/${p.id}`" class="post-item">
                <div class="post-main">
                  <h3>{{ p.title }}</h3>
                  <div class="post-meta">
                    <span>{{ p.board?.name }}</span>
                    <span class="dot"></span>
                    <span>{{ formatDate(p.createdAt) }}</span>
                  </div>
                </div>
              </router-link>
            </div>
          </div>

          <!-- 我的收藏 -->
          <div v-if="activeTab === 'favorites'" class="tab-content">
            <div v-if="favoritesLoading" class="loading">加载中...</div>
            <div v-else-if="favorites.length === 0" class="empty">暂无收藏</div>
            <div v-else class="post-list">
              <router-link v-for="p in favorites" :key="p.id" :to="`/post/${p.id}`" class="post-item">
                <div class="post-main">
                  <h3>{{ p.title }}</h3>
                  <div class="post-meta">
                    <span>{{ p.board?.name }}</span>
                    <span class="dot"></span>
                    <span>{{ formatDate(p.createdAt) }}</span>
                  </div>
                </div>
              </router-link>
            </div>
            <div v-if="totalFavoritePages > 1" class="pagination">
              <button :disabled="favoritePage <= 0" @click="loadFavorites(favoritePage - 1)">上一页</button>
              <span>{{ favoritePage + 1 }} / {{ totalFavoritePages }}</span>
              <button :disabled="favoritePage >= totalFavoritePages - 1" @click="loadFavorites(favoritePage + 1)">下一页</button>
            </div>
          </div>
        </template>
        <div v-else class="empty">用户不存在</div>
      </div>

      <div class="sidebar">
        <div class="sidebar-card">
          <div class="card-header">功能</div>
          <div class="card-body">
            <router-link :to="`/user/${route.params.id}`" class="menu-item" :class="{ active: activeTab === 'posts' }">
              我的帖子
            </router-link>
            <router-link :to="`/user/${route.params.id}?tab=favorites`" class="menu-item" :class="{ active: activeTab === 'favorites' }">
              我的收藏
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { user as userApi, getUser, getAvatarUrl } from '@/api'

const route = useRoute()
const userInfo = ref(null)
const loading = ref(true)
const user = getUser()
const defaultAvatar = 'https://via.placeholder.com/80'
const activeTab = ref('posts')
const posts = ref([])
const postsLoading = ref(false)
const favorites = ref([])
const favoritesLoading = ref(false)
const favoritePage = ref(0)
const totalFavoritePages = ref(0)
const displayAvatar = ref('')

const isSelf = computed(() => user && user.id == route.params.id)

const tabs = [
  { key: 'posts', label: '我的帖子' },
  { key: 'favorites', label: '我的收藏' }
]

function formatDate(d) {
  return new Date(d).toLocaleDateString('zh-CN')
}

async function loadUserInfo() {
  try {
    const res = await userApi.getInfo(route.params.id)
    userInfo.value = res.data
    if (res.data.avatar) {
      displayAvatar.value = await getAvatarUrl(res.data.avatar) || defaultAvatar
    } else {
      displayAvatar.value = defaultAvatar
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadFavorites(p = 0) {
  favoritesLoading.value = true
  try {
    const res = await userApi.getFavorites(route.params.id, p)
    favorites.value = res.data.content
    totalFavoritePages.value = res.data.totalPages
    favoritePage.value = p
  } catch (e) {
    console.error(e)
  } finally {
    favoritesLoading.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'favorites' && favorites.value.length === 0) {
    loadFavorites()
  }
})

watch(() => route.query.tab, (tab) => {
  if (tab === 'favorites') {
    activeTab.value = 'favorites'
    loadFavorites()
  }
})

onMounted(() => {
  loadUserInfo()
  if (route.query.tab === 'favorites') {
    activeTab.value = 'favorites'
    loadFavorites()
  }
})
</script>

<style scoped>
.profile-page {
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

.profile-card {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 16px;
}

.profile-header {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  font-size: 22px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.bio {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 4px;
}

.join-date {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

.btn-edit-profile, .btn-follow {
  padding: 8px 16px;
  border-radius: var(--radius);
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
}

.btn-edit-profile {
  background: var(--card-bg);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-edit-profile:hover {
  background: var(--bg);
}

.btn-follow {
  background: var(--primary);
  color: #fff;
  border: none;
}

.profile-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.profile-tabs button {
  padding: 8px 20px;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
}

.profile-tabs button.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.tab-content {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
}

.post-list {
  overflow: hidden;
}

.post-item {
  display: flex;
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

.dot {
  width: 3px;
  height: 3px;
  background: var(--text-muted);
  border-radius: 50%;
  margin: 0 8px;
}

.loading, .empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-muted);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid var(--border-light);
}

.pagination button {
  padding: 6px 14px;
  background: var(--card-bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 13px;
  cursor: pointer;
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
  margin-bottom: 16px;
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
  padding: 8px 0;
}

.menu-item {
  display: block;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: background 0.15s;
}

.menu-item:hover, .menu-item.active {
  background: var(--bg);
  color: var(--text);
}
</style>
