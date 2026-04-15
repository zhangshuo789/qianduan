<template>
  <div class="user-profile-page ui-page">
    <div class="user-profile-layout">
      <main class="user-profile-main">
        <div v-if="loading" class="ui-loading ui-card">用户信息加载中...</div>

        <template v-else-if="userInfo">
          <section class="user-profile-header ui-card ui-pop-in">
            <img :src="displayAvatar" class="user-profile-avatar" alt="用户头像" />
            <div class="user-profile-meta">
              <h1 class="user-profile-name">{{ userInfo.nickname }}</h1>
              <p class="user-profile-bio">{{ userInfo.bio || '这个用户还没有填写个人简介。' }}</p>
              <p class="user-profile-join">加入时间：{{ formatDate(userInfo.createdAt) }}</p>
            </div>
            <router-link v-if="isSelf" to="/edit-profile" class="ui-button ui-button-secondary">编辑资料</router-link>
            <button v-else-if="user" class="ui-button" :class="isFollowing ? 'ui-button-secondary' : ''" @click="toggleFollow">
              {{ isFollowing ? '取消关注' : '关注' }}
            </button>
            <div class="user-profile-stats">
              <router-link :to="`/user/${route.params.id}?tab=following`" class="user-profile-stat">
                <span class="user-profile-stat-value">{{ stats?.followCount || 0 }}</span>
                <span class="user-profile-stat-label">关注</span>
              </router-link>
              <router-link :to="`/user/${route.params.id}?tab=followers`" class="user-profile-stat">
                <span class="user-profile-stat-value">{{ stats?.followerCount || 0 }}</span>
                <span class="user-profile-stat-label">粉丝</span>
              </router-link>
              <router-link :to="`/user/${route.params.id}?tab=posts`" class="user-profile-stat">
                <span class="user-profile-stat-value">{{ stats?.postCount || posts.length }}</span>
                <span class="user-profile-stat-label">帖子</span>
              </router-link>
              <router-link v-if="!isSelf" :to="`/user/${route.params.id}?tab=friends`" class="user-profile-stat">
                <span class="user-profile-stat-value">{{ stats?.friendCount || 0 }}</span>
                <span class="user-profile-stat-label">互关</span>
              </router-link>
            </div>
          </section>

          <section class="user-profile-tabs ui-card ui-float-enter">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="user-profile-tab"
              :class="{ 'user-profile-tab-active': activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </section>

          <section class="user-profile-content ui-card ui-float-enter">
            <template v-if="activeTab === 'posts'">
              <div v-if="postsLoading" class="ui-loading">帖子加载中...</div>
              <div v-else-if="posts.length === 0" class="ui-empty">暂无帖子</div>
              <div v-else class="user-profile-post-list">
                <router-link v-for="p in posts" :key="p.id" :to="`/post/${p.id}`" class="user-profile-post-item">
                  <h3 class="user-profile-post-title">{{ p.title }}</h3>
                  <div class="user-profile-post-meta">
                    <span>{{ p.board?.name || '未分类' }}</span>
                    <span class="user-profile-post-dot"></span>
                    <span>{{ formatDate(p.createdAt) }}</span>
                  </div>
                </router-link>
              </div>
            </template>

            <template v-else-if="activeTab === 'following'">
              <div v-if="followingLoading" class="ui-loading">加载中...</div>
              <div v-else-if="followingList.length === 0" class="ui-empty">暂无关注</div>
              <div v-else class="user-profile-user-list">
                <router-link v-for="u in followingList" :key="u.id" :to="`/user/${u.id}`" class="user-profile-user-item">
                  <img :src="u.processedAvatar || defaultAvatar" class="user-profile-user-avatar" alt="头像" />
                  <div class="user-profile-user-info">
                    <span class="user-profile-user-name">{{ u.nickname }}</span>
                    <span class="user-profile-user-bio">{{ u.bio || '暂无简介' }}</span>
                  </div>
                </router-link>
              </div>
              <div v-if="totalFollowingPages > 1" class="user-profile-pagination">
                <button class="ui-button ui-button-secondary" :disabled="followingPage <= 0" @click="loadFollowing(followingPage - 1)">上一页</button>
                <span class="user-profile-page-text">第 {{ followingPage + 1 }} / {{ totalFollowingPages }} 页</span>
                <button class="ui-button ui-button-secondary" :disabled="followingPage >= totalFollowingPages - 1" @click="loadFollowing(followingPage + 1)">下一页</button>
              </div>
            </template>

            <template v-else-if="activeTab === 'followers'">
              <div v-if="followersLoading" class="ui-loading">加载中...</div>
              <div v-else-if="followersList.length === 0" class="ui-empty">暂无粉丝</div>
              <div v-else class="user-profile-user-list">
                <router-link v-for="u in followersList" :key="u.id" :to="`/user/${u.id}`" class="user-profile-user-item">
                  <img :src="u.processedAvatar || defaultAvatar" class="user-profile-user-avatar" alt="头像" />
                  <div class="user-profile-user-info">
                    <span class="user-profile-user-name">{{ u.nickname }}</span>
                    <span class="user-profile-user-bio">{{ u.bio || '暂无简介' }}</span>
                  </div>
                </router-link>
              </div>
              <div v-if="totalFollowersPages > 1" class="user-profile-pagination">
                <button class="ui-button ui-button-secondary" :disabled="followersPage <= 0" @click="loadFollowers(followersPage - 1)">上一页</button>
                <span class="user-profile-page-text">第 {{ followersPage + 1 }} / {{ totalFollowersPages }} 页</span>
                <button class="ui-button ui-button-secondary" :disabled="followersPage >= totalFollowersPages - 1" @click="loadFollowers(followersPage + 1)">下一页</button>
              </div>
            </template>

            <template v-else-if="activeTab === 'friends'">
              <div v-if="friendsLoading" class="ui-loading">加载中...</div>
              <div v-else-if="friendsList.length === 0" class="ui-empty">暂无互关好友</div>
              <div v-else class="user-profile-user-list">
                <router-link v-for="u in friendsList" :key="u.id" :to="`/user/${u.id}`" class="user-profile-user-item">
                  <img :src="u.processedAvatar || defaultAvatar" class="user-profile-user-avatar" alt="头像" />
                  <div class="user-profile-user-info">
                    <span class="user-profile-user-name">{{ u.nickname }}</span>
                    <span class="user-profile-user-bio">{{ u.bio || '暂无简介' }}</span>
                  </div>
                </router-link>
              </div>
              <div v-if="totalFriendsPages > 1" class="user-profile-pagination">
                <button class="ui-button ui-button-secondary" :disabled="friendsPage <= 0" @click="loadFriends(friendsPage - 1)">上一页</button>
                <span class="user-profile-page-text">第 {{ friendsPage + 1 }} / {{ totalFriendsPages }} 页</span>
                <button class="ui-button ui-button-secondary" :disabled="friendsPage >= totalFriendsPages - 1" @click="loadFriends(friendsPage + 1)">下一页</button>
              </div>
            </template>

            <template v-else-if="activeTab === 'feed'">
              <div v-if="feedLoading" class="ui-loading">动态加载中...</div>
              <div v-else-if="feedList.length === 0" class="ui-empty">暂无动态</div>
              <div v-else class="user-profile-post-list">
                <router-link v-for="f in feedList" :key="f.postId" :to="`/post/${f.postId}`" class="user-profile-post-item">
                  <h3 class="user-profile-post-title">{{ f.title }}</h3>
                  <div class="user-profile-post-meta">
                    <span>{{ f.user?.nickname || '' }}</span>
                    <span class="user-profile-post-dot"></span>
                    <span>{{ formatDate(f.createdAt) }}</span>
                  </div>
                </router-link>
              </div>
            </template>

            <template v-else-if="activeTab === 'favorites'">
              <div v-if="favoritesLoading" class="ui-loading">收藏加载中...</div>
              <div v-else-if="favorites.length === 0" class="ui-empty">暂无收藏</div>
              <div v-else class="user-profile-post-list">
                <router-link v-for="p in favorites" :key="p.id" :to="`/post/${p.id}`" class="user-profile-post-item">
                  <h3 class="user-profile-post-title">{{ p.title }}</h3>
                  <div class="user-profile-post-meta">
                    <span>{{ p.board?.name || '未分类' }}</span>
                    <span class="user-profile-post-dot"></span>
                    <span>{{ formatDate(p.createdAt) }}</span>
                  </div>
                </router-link>
              </div>

              <div v-if="totalFavoritePages > 1" class="user-profile-pagination">
                <button class="ui-button ui-button-secondary" :disabled="favoritePage <= 0" @click="loadFavorites(favoritePage - 1)">上一页</button>
                <span class="user-profile-page-text">第 {{ favoritePage + 1 }} / {{ totalFavoritePages }} 页</span>
                <button class="ui-button ui-button-secondary" :disabled="favoritePage >= totalFavoritePages - 1" @click="loadFavorites(favoritePage + 1)">下一页</button>
              </div>
            </template>
          </section>
        </template>

        <div v-else class="ui-empty ui-card">用户不存在</div>
      </main>

      <aside class="user-profile-side">
        <section class="user-profile-side-card ui-card ui-float-enter">
          <h2 class="user-profile-side-title">功能导航</h2>
          <router-link
            :to="`/user/${route.params.id}`"
            class="user-profile-side-link"
            :class="{ 'user-profile-side-link-active': activeTab === 'posts' }"
          >
            我的帖子
          </router-link>
          <router-link
            :to="`/user/${route.params.id}?tab=favorites`"
            class="user-profile-side-link"
            :class="{ 'user-profile-side-link-active': activeTab === 'favorites' }"
          >
            我的收藏
          </router-link>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { user as userApi, follow as followApi, getUser, getAvatarUrl } from '@/api'

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

// 关注相关
const stats = ref(null)
const isFollowing = ref(false)
const followLoading = ref(false)
const followingList = ref([])
const followingLoading = ref(false)
const followingPage = ref(0)
const totalFollowingPages = ref(0)
const followersList = ref([])
const followersLoading = ref(false)
const followersPage = ref(0)
const totalFollowersPages = ref(0)
const friendsList = ref([])
const friendsLoading = ref(false)
const friendsPage = ref(0)
const totalFriendsPages = ref(0)
const feedList = ref([])
const feedLoading = ref(false)

const isSelf = computed(() => user && user.id == route.params.id)

const tabs = [
  { key: 'posts', label: '我的帖子' },
  { key: 'favorites', label: '我的收藏' },
  { key: 'following', label: '关注' },
  { key: 'followers', label: '粉丝' },
  { key: 'friends', label: '互关' },
  { key: 'feed', label: '动态' }
]

function formatDate(d) {
  return new Date(d).toLocaleDateString('zh-CN')
}

async function loadUserInfo() {
  loading.value = true
  try {
    const res = await userApi.getInfo(route.params.id)
    userInfo.value = res.data
    posts.value = res.data.posts || []
    if (res.data.avatar) {
      displayAvatar.value = (await getAvatarUrl(res.data.avatar)) || defaultAvatar
    } else {
      displayAvatar.value = defaultAvatar
    }
    // 加载用户统计
    loadStats()
    // 如果不是本人，加载关注状态
    if (!isSelf.value && user) {
      loadFollowStatus()
    }
  } catch (e) {
    console.error(e)
    userInfo.value = null
  } finally {
    loading.value = false
    postsLoading.value = false
  }
}

async function loadStats() {
  try {
    const res = await userApi.getStats(route.params.id)
    stats.value = res.data
  } catch (e) {
    console.error(e)
    stats.value = null
  }
}

async function loadFollowStatus() {
  try {
    const res = await followApi.getFollowStatus(route.params.id)
    isFollowing.value = res.data?.following || false
  } catch (e) {
    console.error(e)
    isFollowing.value = false
  }
}

async function toggleFollow() {
  if (!user) {
    alert('请先登录')
    return
  }
  followLoading.value = true
  try {
    if (isFollowing.value) {
      await followApi.unfollow(route.params.id)
      isFollowing.value = false
    } else {
      await followApi.follow(route.params.id)
      isFollowing.value = true
    }
    // 更新统计数据
    loadStats()
  } catch (e) {
    alert(e.message)
  } finally {
    followLoading.value = false
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

async function loadFollowing(p = 0) {
  followingLoading.value = true
  try {
    const res = await followApi.getFollowing(route.params.id, p)
    followingList.value = res.data.content || []
    totalFollowingPages.value = res.data.totalPages || 0
    followingPage.value = p
    // 处理头像
    for (const u of followingList.value) {
      if (u.avatar) {
        u.processedAvatar = await getAvatarUrl(u.avatar) || defaultAvatar
      } else {
        u.processedAvatar = defaultAvatar
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    followingLoading.value = false
  }
}

async function loadFollowers(p = 0) {
  followersLoading.value = true
  try {
    const res = await followApi.getFollowers(route.params.id, p)
    followersList.value = res.data.content || []
    totalFollowersPages.value = res.data.totalPages || 0
    followersPage.value = p
    // 处理头像
    for (const u of followersList.value) {
      if (u.avatar) {
        u.processedAvatar = await getAvatarUrl(u.avatar) || defaultAvatar
      } else {
        u.processedAvatar = defaultAvatar
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    followersLoading.value = false
  }
}

async function loadFriends(p = 0) {
  friendsLoading.value = true
  try {
    const res = await followApi.getFriends(route.params.id, p)
    friendsList.value = res.data.content || []
    totalFriendsPages.value = res.data.totalPages || 0
    friendsPage.value = p
    // 处理头像
    for (const u of friendsList.value) {
      if (u.avatar) {
        u.processedAvatar = await getAvatarUrl(u.avatar) || defaultAvatar
      } else {
        u.processedAvatar = defaultAvatar
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    friendsLoading.value = false
  }
}

async function loadFeed() {
  feedLoading.value = true
  try {
    const res = await userApi.getFeed(route.params.id)
    feedList.value = res.data.content || []
  } catch (e) {
    console.error(e)
  } finally {
    feedLoading.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'favorites' && favorites.value.length === 0) {
    loadFavorites()
  } else if (tab === 'following' && followingList.value.length === 0) {
    loadFollowing()
  } else if (tab === 'followers' && followersList.value.length === 0) {
    loadFollowers()
  } else if (tab === 'friends' && friendsList.value.length === 0) {
    loadFriends()
  } else if (tab === 'feed' && feedList.value.length === 0) {
    loadFeed()
  }
})

watch(
  () => route.query.tab,
  (tab) => {
    if (tab === 'favorites') {
      activeTab.value = 'favorites'
      loadFavorites()
    } else if (tab === 'following') {
      activeTab.value = 'following'
      loadFollowing()
    } else if (tab === 'followers') {
      activeTab.value = 'followers'
      loadFollowers()
    } else if (tab === 'friends') {
      activeTab.value = 'friends'
      loadFriends()
    } else if (tab === 'feed') {
      activeTab.value = 'feed'
      loadFeed()
    } else {
      activeTab.value = 'posts'
    }
  },
  { immediate: true }
)

watch(
  () => route.params.id,
  () => {
    favorites.value = []
    followingList.value = []
    followersList.value = []
    friendsList.value = []
    feedList.value = []
    stats.value = null
    isFollowing.value = false
    loadUserInfo()
  }
)

onMounted(() => {
  postsLoading.value = true
  loadUserInfo()
})
</script>

<style scoped>
.user-profile-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: var(--space-6);
}

.user-profile-main {
  min-width: 0;
}

.user-profile-header {
  padding: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  border-radius: var(--radius-xl);
}

.user-profile-avatar {
  width: 92px;
  height: 92px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.user-profile-meta {
  flex: 1;
}

.user-profile-name {
  font-size: var(--text-lg);
  font-weight: 700;
}

.user-profile-bio,
.user-profile-join {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.user-profile-tabs {
  margin-top: var(--space-4);
  padding: var(--space-3);
  display: flex;
  gap: var(--space-2);
  border-radius: var(--radius-xl);
}

.user-profile-tab {
  border: none;
  background-color: transparent;
  border-radius: var(--radius-md);
  padding: 8px 14px;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.user-profile-tab-active {
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 600;
}

.user-profile-content {
  margin-top: var(--space-4);
  padding: var(--space-5);
  border-radius: var(--radius-xl);
}

.user-profile-post-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.user-profile-post-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  transition: all var(--transition-fast);
}

.user-profile-post-item:hover {
  border-color: #b6c3d2;
  background-color: var(--color-bg-soft);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.user-profile-post-title {
  font-size: var(--text-base);
  font-weight: 700;
}

.user-profile-post-meta {
  margin-top: var(--space-2);
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.user-profile-post-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background-color: #9aa7b8;
  margin: 0 var(--space-2);
}

.user-profile-pagination {
  margin-top: var(--space-4);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-3);
}

.user-profile-page-text {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.user-profile-side-card {
  padding: var(--space-5);
  border-radius: var(--radius-xl);
}

.user-profile-side-title {
  font-size: var(--text-base);
  margin-bottom: var(--space-2);
}

.user-profile-side-link {
  display: block;
  margin-top: var(--space-2);
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.user-profile-side-link-active,
.user-profile-side-link:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-primary-soft);
  transform: translateX(2px);
}

@media (max-width: 980px) {
  .user-profile-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .user-profile-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

.user-profile-stats {
  display: flex;
  gap: var(--space-4);
  margin-left: auto;
}

.user-profile-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--color-text);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.user-profile-stat:hover {
  background-color: var(--color-bg-soft);
}

.user-profile-stat-value {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-primary);
}

.user-profile-stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.user-profile-user-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.user-profile-user-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  transition: all var(--transition-fast);
}

.user-profile-user-item:hover {
  border-color: var(--color-primary);
  background-color: var(--color-bg-soft);
  transform: translateY(-2px);
}

.user-profile-user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.user-profile-user-info {
  flex: 1;
  min-width: 0;
}

.user-profile-user-name {
  display: block;
  font-size: var(--text-base);
  font-weight: 600;
}

.user-profile-user-bio {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
