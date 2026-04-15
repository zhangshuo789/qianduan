<template>
  <div class="auth-page">
    <div class="auth-bg">
      <div class="auth-bg-shape auth-bg-shape-1"></div>
      <div class="auth-bg-shape auth-bg-shape-2"></div>
      <div class="auth-bg-shape auth-bg-shape-3"></div>
    </div>
    <div class="auth-card animate-fade-in-up">
      <div class="auth-header">
        <div class="auth-logo">
          <span class="auth-logo-icon">🏐</span>
        </div>
        <h2 class="auth-title">欢迎回来</h2>
        <p class="auth-subtitle">登录你的排球社区账号</p>
      </div>
      <div v-if="error" class="error-message">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ error }}
      </div>
      <form class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            用户名
          </label>
          <input v-model="form.username" type="text" placeholder="请输入用户名" required />
        </div>
        <div class="form-group">
          <label class="form-label">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            密码
          </label>
          <input v-model="form.password" type="password" placeholder="请输入密码" required />
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          <svg v-if="!loading" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          <span v-else class="spinner"></span>
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <div class="auth-footer">
        <span>还没有账号？</span>
        <router-link to="/register">立即注册</router-link>
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
.auth-page {
  min-height: calc(100vh - 72px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  position: relative;
  overflow: hidden;
}

.auth-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.auth-bg-shape {
  position: absolute;
  border-radius: var(--radius-full);
  filter: blur(80px);
  opacity: 0.5;
}

.auth-bg-shape-1 {
  width: 400px;
  height: 400px;
  background: var(--color-primary);
  top: -100px;
  right: -100px;
  opacity: 0.15;
}

.auth-bg-shape-2 {
  width: 300px;
  height: 300px;
  background: var(--color-accent);
  bottom: -50px;
  left: -50px;
  opacity: 0.1;
}

.auth-bg-shape-3 {
  width: 200px;
  height: 200px;
  background: var(--color-success);
  top: 50%;
  left: 30%;
  opacity: 0.08;
}

.auth-card {
  background: var(--color-card);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  padding: var(--space-2xl);
  width: 100%;
  max-width: 420px;
  position: relative;
  border: 1px solid var(--color-border-light);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.auth-logo {
  width: 72px;
  height: 72px;
  margin: 0 auto var(--space-md);
  background: var(--color-primary-gradient);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-primary);
}

.auth-logo-icon {
  font-size: 36px;
}

.auth-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.auth-subtitle {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--color-error-soft);
  color: var(--color-error);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  margin-bottom: var(--space-lg);
}

.auth-form .form-group {
  margin-bottom: var(--space-lg);
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.form-label svg {
  color: var(--color-text-muted);
}

.auth-form input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-soft);
  transition: all var(--transition-fast);
  box-sizing: border-box;
}

.auth-form input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
  background: var(--color-card);
}

.auth-form input::placeholder {
  color: var(--color-text-muted);
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-4);
  background: var(--color-primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: var(--space-md);
}

.btn-submit:hover:not(:disabled) {
  box-shadow: var(--shadow-primary);
  transform: translateY(-2px);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.auth-footer {
  text-align: center;
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.auth-footer a {
  color: var(--color-primary);
  font-weight: 600;
  margin-left: var(--space-1);
  transition: color var(--transition-fast);
}

.auth-footer a:hover {
  color: var(--color-primary-dark);
}

@media (max-width: 480px) {
  .auth-card {
    padding: var(--space-lg);
  }

  .auth-logo {
    width: 60px;
    height: 60px;
  }

  .auth-logo-icon {
    font-size: 28px;
  }

  .auth-title {
    font-size: var(--text-xl);
  }
}
</style>
