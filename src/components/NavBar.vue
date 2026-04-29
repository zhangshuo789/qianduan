<template>
  <header class="nav-header ui-pop-in">
    <div class="nav-container">
      <router-link to="/" class="nav-logo">
        <span class="nav-logo-icon">🏐</span>
        <span class="nav-logo-text">排球社区</span>
      </router-link>

      <nav class="nav-links">
        <router-link to="/" class="nav-link">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>首页</span>
        </router-link>
        <router-link to="/events" class="nav-link">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>赛事</span>
        </router-link>
        <router-link v-if="user" :to="`/user/${user.id}`" class="nav-link">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>个人中心</span>
        </router-link>
        <router-link to="/ai-chat" class="nav-link">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
          <span>AI助手</span>
        </router-link>
        <router-link v-if="isAdmin" to="/admin/overview" class="nav-link nav-link-admin">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>管理后台</span>
        </router-link>
      </nav>

      <div class="nav-actions">
        <div class="nav-search">
          <svg class="nav-search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input v-model="keyword" type="text" class="nav-search-input" placeholder="搜索帖子..." @keydown.enter="handleSearch" />
          <button class="nav-search-button" @click="handleSearch">搜索</button>
        </div>

        <router-link v-if="user" to="/create-post" class="ui-button ui-button-primary nav-create-btn">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>发布帖子</span>
        </router-link>

        <div v-if="user" class="nav-user">
          <button class="nav-user-trigger" @click="toggleMenu">
            <img :src="displayAvatar" class="nav-avatar" alt="用户头像" />
            <span class="nav-user-name">{{ user.nickname }}</span>
            <svg class="nav-user-arrow" :class="{ rotated: menuVisible }" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <Transition name="dropdown">
            <div v-if="menuVisible" class="nav-menu">
              <div class="nav-menu-header">
                <img :src="displayAvatar" class="nav-menu-avatar" />
                <div class="nav-menu-user-info">
                  <p class="nav-menu-name">{{ user.nickname }}</p>
                  <p class="nav-menu-id">UID: {{ user.id }}</p>
                </div>
              </div>
              <div class="nav-menu-divider"></div>
              <router-link :to="`/user/${user.id}`" class="nav-menu-item" @click="menuVisible = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <span>我的帖子</span>
              </router-link>
              <router-link :to="`/user/${user.id}?tab=favorites`" class="nav-menu-item" @click="menuVisible = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span>我的收藏</span>
              </router-link>
              <router-link to="/messages" class="nav-menu-item" @click="menuVisible = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>我的私信</span>
                <span v-if="unreadCount > 0" class="nav-menu-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
              </router-link>
              <router-link to="/groups" class="nav-menu-item" @click="menuVisible = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>我的群聊</span>
              </router-link>
              <router-link to="/events" class="nav-menu-item" @click="menuVisible = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>赛事活动</span>
              </router-link>
              <router-link to="/my-subscriptions" class="nav-menu-item" @click="menuVisible = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>我的订阅</span>
              </router-link>
              <div class="nav-menu-divider"></div>
              <button class="nav-menu-logout" @click="logout">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>退出登录</span>
              </button>
            </div>
          </Transition>
        </div>

        <div v-else class="nav-auth">
          <router-link to="/login" class="ui-button ui-button-ghost">登录</router-link>
          <router-link to="/register" class="ui-button ui-button-primary">注册</router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUser, clearAuth, getAvatarUrl, message as messageApi, DEFAULT_AVATAR } from '@/api'

const router = useRouter()
const userRef = useUser()
const user = computed(() => userRef.value)
const isAdmin = computed(() => user.value?.isAdmin === true)
const keyword = ref('')
const menuVisible = ref(false)
const defaultAvatar = DEFAULT_AVATAR
const displayAvatar = ref(DEFAULT_AVATAR)
const unreadCount = ref(0)

async function loadUnreadCount() {
  try {
    const res = await messageApi.getUnreadCount()
    unreadCount.value = res.data?.totalUnread || 0
  } catch (e) {
    console.error(e)
  }
}

async function updateDisplayAvatar() {
  if (user.value?.avatar) {
    const url = await getAvatarUrl(user.value.avatar)
    displayAvatar.value = url || defaultAvatar
  } else {
    displayAvatar.value = defaultAvatar
  }
}

watch(user, updateDisplayAvatar, { immediate: true })
watch(user, (newUser) => {
  if (newUser) {
    loadUnreadCount()
  } else {
    unreadCount.value = 0
  }
}, { immediate: true })

function toggleMenu() {
  menuVisible.value = !menuVisible.value
}

function handleSearch() {
  if (keyword.value.trim()) {
    alert('搜索功能正在开发中')
  }
}

function logout() {
  clearAuth()
  unreadCount.value = 0
  menuVisible.value = false
  router.push('/')
}

function handleClickOutside(e) {
  if (!e.target.closest('.nav-user')) {
    menuVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  z-index: var(--z-fixed);
}

.nav-container {
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.nav-logo:hover {
  background: var(--color-bg-soft);
}

.nav-logo-icon {
  font-size: 24px;
}

.nav-logo-text {
  background: var(--color-primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: var(--space-2);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.nav-link:hover {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.nav-link.router-link-active {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.nav-link-admin {
  color: var(--color-error);
}

.nav-link-admin:hover {
  color: var(--color-error);
  background: var(--color-error-soft);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.nav-search {
  display: flex;
  align-items: center;
  position: relative;
  background: var(--color-bg-soft);
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  height: 44px;
  transition: all var(--transition-fast);
}

.nav-search:focus-within {
  background: white;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.nav-search-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--color-text-muted);
  pointer-events: none;
}

.nav-search-input {
  width: 200px;
  height: 100%;
  border: none;
  background: transparent;
  padding: 0 var(--space-10) 0 var(--space-10);
  font-size: var(--text-sm);
  color: var(--color-text);
}

.nav-search-input:focus {
  outline: none;
}

.nav-search-input::placeholder {
  color: var(--color-text-muted);
}

.nav-search-button {
  position: absolute;
  right: var(--space-1);
  height: 32px;
  padding: 0 var(--space-3);
  background: var(--color-primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-search-button:hover {
  box-shadow: var(--shadow-primary);
}

.nav-create-btn {
  gap: var(--space-2);
}

.nav-user {
  position: relative;
}

.nav-user-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2) var(--space-1) var(--space-1);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-user-trigger:hover {
  background: var(--color-bg-soft);
  border-color: var(--color-border);
}

.nav-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--color-border-light);
}

.nav-user-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-user-arrow {
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
}

.nav-user-arrow.rotated {
  transform: rotate(180deg);
}

.nav-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 240px;
  background: white;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.nav-menu-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: linear-gradient(135deg, var(--color-primary-soft) 0%, var(--color-bg-soft) 100%);
}

.nav-menu-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 3px solid white;
  box-shadow: var(--shadow-sm);
}

.nav-menu-user-info {
  flex: 1;
  min-width: 0;
}

.nav-menu-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.nav-menu-id {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: var(--space-1) 0 0;
}

.nav-menu-divider {
  height: 1px;
  background: var(--color-border-light);
  margin: 0 var(--space-4);
}

.nav-menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.nav-menu-item:hover {
  background: var(--color-bg-soft);
  color: var(--color-text);
}

.nav-menu-item svg {
  color: var(--color-text-muted);
}

.nav-menu-item:hover svg {
  color: var(--color-primary);
}

.nav-menu-badge {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 var(--space-2);
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: var(--color-error);
  border-radius: var(--radius-full);
}

.nav-menu-logout {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-error);
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-menu-logout:hover {
  background: var(--color-error-soft);
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition-fast);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 960px) {
  .nav-search {
    display: none;
  }

  .nav-links {
    display: none;
  }
}

@media (max-width: 640px) {
  .nav-container {
    padding: 0 var(--space-4);
  }

  .nav-create-btn span {
    display: none;
  }

  .nav-user-name {
    display: none;
  }
}
</style>
