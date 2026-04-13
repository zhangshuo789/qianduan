<template>
  <nav class="nav-bar">
    <div class="logo">
      <router-link to="/" class="logo-link">排球社区</router-link>
    </div>

    <div class="nav-tabs">
      <router-link to="/" class="nav-tab">首页</router-link>
      <router-link to="/article" class="nav-tab">文章</router-link>
      <router-link to="/chat" class="nav-tab">聊天室</router-link>
    </div>

    <div class="nav-actions">
      <div class="search-box">
        <input type="text" placeholder="搜索" v-model="keyword" @keydown.enter="handleSearch" />
        <button class="search-btn" @click="handleSearch">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </button>
      </div>

      <router-link v-if="user" to="/create-post" class="publish-btn">发布</router-link>

      <div class="user-info" v-if="user">
        <img :src="displayAvatar" class="avatar" @click="toggleMenu" />
        <div v-if="menuVisible" class="dropdown-menu">
          <div class="user-card">
            <div class="user-name">{{ user.nickname }}</div>
            <div class="user-id">UID: {{ user.id }}</div>
          </div>
          <ul class="menu-list">
            <li><router-link :to="`/user/${user.id}`">我的文章</router-link></li>
            <li><router-link :to="`/user/${user.id}`">我的喜欢</router-link></li>
            <li><router-link :to="`/user/${user.id}`">我的收藏</router-link></li>
          </ul>
          <div class="menu-footer">
            <a @click="logout">退出登录</a>
          </div>
        </div>
      </div>
      <div v-else class="auth-btns">
        <router-link to="/login">登录</router-link>
        <router-link to="/register">注册</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getUser, clearAuth, getAvatarUrl } from '@/api'

const router = useRouter()
const user = ref(getUser())
const keyword = ref('')
const menuVisible = ref(false)
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

function toggleMenu() {
  menuVisible.value = !menuVisible.value
}

function handleSearch() {
  if (keyword.value.trim()) {
    // TODO: implement search
  }
}

function logout() {
  clearAuth()
  user.value = null
  menuVisible.value = false
  router.push('/')
}

function handleClickOutside(e) {
  if (!e.target.closest('.user-info')) {
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
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--color-secondary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-lg);
}

.navbar-logo {
  font-size: var(--text-lg);
  font-weight: 700;
  color: white;
  text-decoration: none;
}

.navbar-logo:hover {
  color: rgba(255, 255, 255, 0.9);
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.navbar-link {
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--text-base);
  font-weight: 500;
  transition: color var(--transition-fast);
}

.navbar-link:hover,
.navbar-link.router-link-active {
  color: white;
}

.navbar-search {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: var(--space-xs) var(--space-md);
}

.navbar-search input {
  background: transparent;
  border: none;
  color: white;
  outline: none;
  width: 200px;
  font-size: var(--text-sm);
}

.navbar-search input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.navbar-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--text-sm);
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.navbar-avatar:hover {
  transform: scale(1.05);
}

.navbar-dropdown {
  position: relative;
}

.navbar-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 160px;
  overflow: hidden;
}

.navbar-dropdown-item {
  display: block;
  padding: var(--space-sm) var(--space-md);
  color: var(--color-text);
  font-size: var(--text-sm);
  transition: background var(--transition-fast);
}

.navbar-dropdown-item:hover {
  background: var(--color-bg);
  color: var(--color-text);
}

.main-content {
  padding-top: 64px;
  min-height: 100vh;
}
</style>
