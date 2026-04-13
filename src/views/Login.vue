<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h2 class="login-title">登录</h2>
        <p class="login-subtitle">欢迎回来！</p>
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="form.username" type="text" placeholder="请输入用户名" required />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="请输入密码" required />
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <div class="login-footer">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, setAuth } from '@/api'

const router = useRouter()
const form = ref({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const res = await auth.login(form.value)
    setAuth(res.data.token, res.data.user)
    router.push('/')
  } catch (e) {
    error.value = e.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.login-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-xl);
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-secondary);
}

.login-subtitle {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}

.login-form .form-group {
  margin-bottom: var(--space-md);
}

.login-form .btn-primary {
  width: 100%;
  padding: var(--space-md);
  font-size: var(--text-base);
  font-weight: 600;
  margin-top: var(--space-sm);
}

.login-footer {
  text-align: center;
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.login-footer a {
  color: var(--color-primary);
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}

.error-message {
  background: #FEF2F2;
  color: var(--color-error);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
}
</style>
