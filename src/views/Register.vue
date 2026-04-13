<template>
  <div class="register-page">
    <div class="register-card">
      <div class="register-header">
        <h2 class="register-title">注册</h2>
        <p class="register-subtitle">加入排球社区</p>
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <form class="register-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="form.username" type="text" placeholder="4-20个字符" required minlength="4" maxlength="20" />
        </div>
        <div class="form-group">
          <label>昵称</label>
          <input v-model="form.nickname" type="text" placeholder="2-20个字符" required minlength="2" maxlength="20" />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="6-20个字符" required minlength="6" maxlength="20" />
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
      <div class="register-footer">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/api'

const router = useRouter()
const form = ref({ username: '', nickname: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    await auth.register(form.value)
    router.push('/login')
  } catch (e) {
    error.value = e.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.register-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-xl);
  width: 100%;
  max-width: 400px;
}

.register-header {
  text-align: center;
  margin-bottom: var(--space-lg);
}

.register-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-secondary);
}

.register-subtitle {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}

.register-form .form-group {
  margin-bottom: var(--space-md);
}

.register-form .btn-primary {
  width: 100%;
  padding: var(--space-md);
  font-size: var(--text-base);
  font-weight: 600;
  margin-top: var(--space-sm);
}

.register-footer {
  text-align: center;
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.register-footer a {
  color: var(--color-primary);
  font-weight: 500;
}

.register-footer a:hover {
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
