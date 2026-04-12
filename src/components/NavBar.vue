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
.nav-bar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 60px;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-light);
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  flex: 1;
}

.logo-link {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
}

.nav-tabs {
  display: flex;
  gap: 8px;
}

.nav-tab {
  padding: 8px 16px;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius);
  transition: all 0.15s;
}

.nav-tab:hover {
  color: var(--text);
  background: var(--bg);
  text-decoration: none;
}

.nav-tab.router-link-active {
  color: var(--primary);
  background: var(--bg);
}

.nav-actions {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

.search-box {
  display: flex;
  align-items: center;
}

.search-box input {
  width: 200px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-right: none;
  border-radius: var(--radius) 0 0 var(--radius);
  background: var(--bg);
  color: var(--text);
}

.search-box input:focus {
  outline: none;
  background: var(--card-bg);
}

.search-btn {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 0 var(--radius) var(--radius) 0;
  background: var(--bg);
  color: var(--text-secondary);
}

.search-btn:hover {
  background: var(--border-light);
}

.publish-btn {
  padding: 8px 16px;
  background: var(--primary);
  color: #fff;
  border-radius: var(--radius);
  text-decoration: none;
  font-weight: 500;
}

.publish-btn:hover {
  background: var(--primary-hover);
  text-decoration: none;
}

.user-info {
  position: relative;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  object-fit: cover;
  background: var(--bg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 200px;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

.user-card {
  padding: 12px 16px;
  background: var(--bg);
  border-bottom: 1px solid var(--border-light);
}

.user-name {
  font-weight: 600;
  color: var(--text);
}

.user-id {
  font-size: 12px;
  color: var(--text-muted);
}

.menu-list {
  list-style: none;
  padding: 8px 0;
  margin: 0;
}

.menu-list li a {
  display: block;
  padding: 8px 16px;
  color: var(--text-secondary);
  text-decoration: none;
}

.menu-list li a:hover {
  background: var(--bg);
  color: var(--text);
}

.menu-footer {
  padding: 8px 16px;
  border-top: 1px solid var(--border-light);
}

.menu-footer a {
  color: #cf222e;
  cursor: pointer;
}

.auth-btns {
  display: flex;
  gap: 12px;
}

.auth-btns a {
  color: var(--text-secondary);
  text-decoration: none;
}

.auth-btns a:hover {
  color: var(--text);
}
</style>
