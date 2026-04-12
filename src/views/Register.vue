<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="brand">
        <h1>排球社区</h1>
        <p>分享排球知识，交流排球技巧</p>
      </div>
    </div>
    <div class="auth-right">
      <div class="auth-card">
        <h2>注册</h2>
        <form @submit.prevent="handleRegister">
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
        <div class="auth-footer">
          已有账号？<router-link to="/login">立即登录</router-link>
        </div>
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

async function handleRegister() {
  loading.value = true
  try {
    await auth.register(form.value)
    alert('注册成功，请登录')
    router.push('/login')
  } catch (e) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  min-height: 100vh;
}

.auth-left {
  flex: 1.5;
  background: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand {
  text-align: center;
  color: #fff;
}

.brand h1 {
  font-size: 48px;
  font-weight: 600;
  margin-bottom: 16px;
}

.brand p {
  font-size: 18px;
  opacity: 0.8;
}

.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}

.auth-card {
  width: 100%;
  max-width: 360px;
  padding: 40px;
  background: var(--card-bg);
  border-radius: var(--radius);
}

.auth-card h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 32px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--card-bg);
  color: var(--text);
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--text-muted);
}

.auth-footer a {
  color: var(--primary);
}
</style>
