<template>
  <header class="nav-header ui-pop-in">
    <div class="nav-container">
      <router-link to="/" class="nav-logo">排球社区</router-link>

      <nav class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link v-if="user" :to="`/user/${user.id}`" class="nav-link">个人中心</router-link>
      </nav>

      <div class="nav-actions">
        <div class="nav-search">
          <input v-model="keyword" type="text" class="nav-search-input" placeholder="搜索帖子（即将上线）" @keydown.enter="handleSearch" />
          <button class="nav-search-button" @click="handleSearch">搜索</button>
        </div>

        <router-link v-if="user" to="/create-post" class="ui-button ui-button-primary nav-create-btn">发布帖子</router-link>

        <div v-if="user" class="nav-user">
          <img :src="displayAvatar" class="nav-avatar" alt="用户头像" @click="toggleMenu" />
          <div v-if="menuVisible" class="nav-menu ui-pop-in">
            <div class="nav-menu-user">
              <p class="nav-menu-name">{{ user.nickname }}</p>
              <p class="nav-menu-id">UID: {{ user.id }}</p>
            </div>
            <router-link :to="`/user/${user.id}`" class="nav-menu-item">我的帖子</router-link>
            <router-link :to="`/user/${user.id}?tab=favorites`" class="nav-menu-item">我的收藏</router-link>
            <router-link to="/messages" class="nav-menu-item">
              我的私信
              <span v-if="unreadCount > 0" class="nav-menu-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
            </router-link>
            <router-link to="/groups" class="nav-menu-item">我的群聊</router-link>
            <button class="nav-menu-logout" @click="logout">退出登录</button>
          </div>
        </div>

        <div v-else class="nav-auth">
          <router-link to="/login" class="ui-button ui-button-secondary">登录</router-link>
          <router-link to="/register" class="ui-button ui-button-primary">注册</router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getUser, clearAuth, getAvatarUrl, message as messageApi } from '@/api'

const router = useRouter()
const user = ref(getUser())
const keyword = ref('')
const menuVisible = ref(false)
const defaultAvatar = 'https://via.placeholder.com/40'
const displayAvatar = ref(defaultAvatar)
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
  user.value = null
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
  border-bottom: 1px solid #d2dae5;
  background-color: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  z-index: 1000;
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
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-main);
  letter-spacing: 1px;
  padding: 6px 10px;
  border-radius: var(--radius-md);
}

.nav-links {
  display: flex;
  gap: var(--space-4);
}

.nav-link {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-primary);
  background-color: var(--color-primary-soft);
}

.nav-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.nav-search {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  height: 42px;
  background-color: #ffffff;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.nav-search:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.14);
}

.nav-search-input {
  width: 220px;
  border: none;
  padding: 0 var(--space-3);
  color: var(--color-text-main);
}

.nav-search-input:focus {
  outline: none;
}

.nav-search-button {
  height: 100%;
  border: none;
  border-left: 1px solid var(--color-border);
  background-color: var(--color-bg-soft);
  padding: 0 var(--space-3);
  color: var(--color-text-secondary);
}

.nav-search-button:hover {
  background-color: #eef2f7;
}

.nav-create-btn {
  white-space: nowrap;
}

.nav-user {
  position: relative;
}

.nav-avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.nav-avatar:hover {
  transform: translateY(-1px) scale(1.03);
  box-shadow: var(--shadow-sm);
}

.nav-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 200px;
  background-color: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.nav-menu-user {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.nav-menu-name {
  font-size: var(--text-sm);
  font-weight: 600;
}

.nav-menu-id {
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.nav-menu-item,
.nav-menu-logout {
  width: 100%;
  display: block;
  text-align: left;
  border: none;
  background: none;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.nav-menu-item:hover,
.nav-menu-logout:hover {
  background-color: var(--color-bg-soft);
  color: var(--color-text-main);
}

.nav-menu-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background-color: #ef4444;
  border-radius: 999px;
  margin-left: 6px;
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: var(--space-2);
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

  .nav-create-btn {
    display: none;
  }
}
</style>
