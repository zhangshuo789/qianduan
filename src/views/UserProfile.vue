<template>
  <div class="user-profile-page">
    <NavBar />

    <div class="main-container">
      <div class="content-area">
        <div v-if="loading" class="loading-state">加载中...</div>
        <template v-else-if="userInfo">
          <div class="profile-card">
            <div class="profile-header">
              <img :src="displayAvatar" class="profile-avatar" />
              <div class="profile-info">
                <h1 class="profile-name">{{ userInfo.nickname }}</h1>
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
              class="profile-tab"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- 我的帖子 -->
          <div v-if="activeTab === 'posts'" class="profile-content">
            <div v-if="postsLoading" class="loading-state">加载中...</div>
            <div v-else-if="posts.length === 0" class="empty-state">暂无帖子</div>
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
          <div v-if="activeTab === 'favorites'" class="profile-content">
            <div v-if="favoritesLoading" class="loading-state">加载中...</div>
            <div v-else-if="favorites.length === 0" class="empty-state">暂无收藏</div>
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
        <div v-else class="empty-state">用户不存在</div>
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
.user-profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.profile-header {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 32px;
}

.profile-details {
  flex: 1;
}

.profile-info h1 {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-secondary);
  margin-bottom: var(--space-xs);
}

.profile-name {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-secondary);
  margin-bottom: var(--space-xs);
}

.profile-bio {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.profile-stats {
  display: flex;
  gap: var(--space-lg);
  margin-top: var(--space-md);
}

.profile-stat {
  text-align: center;
}

.profile-stat-value {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-primary);
}

.profile-stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.profile-tabs {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.profile-tab {
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--text-base);
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.profile-tab:hover {
  color: var(--color-primary);
}

.profile-tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.profile-content {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.post-item {
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.post-item:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.post-main h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.post-meta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-secondary);
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: var(--space-2xl);
}

.bio {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.join-date {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.btn-edit-profile, .btn-follow {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius);
  font-size: var(--text-sm);
  cursor: pointer;
  text-decoration: none;
}

.btn-edit-profile {
  background: var(--color-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-edit-profile:hover {
  background: var(--color-bg);
}

.btn-follow {
  background: var(--color-primary);
  color: #fff;
  border: none;
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
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 16px;
}

.dot {
  width: 3px;
  height: 3px;
  background: var(--color-text-muted);
  border-radius: 50%;
  margin: 0 8px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid var(--color-border);
}

.pagination button {
  padding: 6px 14px;
  background: var(--color-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 13px;
  cursor: pointer;
}

.pagination button:disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.sidebar-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 16px;
}

.card-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
}

.card-body {
  padding: 8px 0;
}

.menu-item {
  display: block;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: background 0.15s;
}

.menu-item:hover, .menu-item.active {
  background: var(--color-bg);
  color: var(--color-text);
}
</style>
