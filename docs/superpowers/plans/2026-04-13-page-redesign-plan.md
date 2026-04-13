# 排球社区页面优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 对排球社区9个页面进行视觉升级，包括全局样式、NavBar、首页、登录注册、板块页、帖子详情、发帖编辑、用户主页等

**Architecture:** 通过CSS变量定义设计系统，新增全局样式文件，修改各页面组件样式，分三批次实施

**Tech Stack:** Vue 3, Vite, CSS变量, Google Fonts

---

## 文件结构

```
src/assets/styles/
├── variables.css    # CSS变量（颜色、字体、间距）
├── base.css        # 基础样式重置
├── components.css  # 通用组件样式（按钮、卡片、表单）
└── animations.css   # 动画定义

修改:
├── src/components/NavBar.vue
├── src/views/Home.vue
├── src/views/Login.vue
├── src/views/Register.vue
├── src/views/Board.vue
├── src/views/PostDetail.vue
├── src/views/CreatePost.vue
├── src/views/UserProfile.vue
├── src/views/EditProfile.vue
├── src/App.vue
└── index.html
```

---

## 第一批次：全局样式 + 核心页面

### Task 1: 创建CSS变量文件

**Files:**
- Create: `src/assets/styles/variables.css`

- [ ] **Step 1: 创建 variables.css**

```css
:root {
  /* 主色 - 活力橙 */
  --color-primary: #FF6B35;
  --color-primary-dark: #E55A2B;
  --color-primary-light: #FF8A5C;

  /* 辅助色 - 深蓝 */
  --color-secondary: #1A365D;
  --color-secondary-light: #2D4A7C;
  --color-secondary-dark: #122442;

  /* 背景色 */
  --color-bg: #F7F8FA;
  --color-card: #FFFFFF;
  --color-border: #E5E7EB;

  /* 文字色 */
  --color-text: #1F2937;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;

  /* 状态色 */
  --color-success: #10B981;
  --color-error: #EF4444;
  --color-warning: #F59E0B;

  /* 字体 */
  --font-sans: 'Noto Sans SC', 'Source Sans Pro', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* 字号 */
  --text-xs: 12px;
  --text-sm: 13px;
  --text-base: 15px;
  --text-lg: 18px;
  --text-xl: 24px;

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 50%;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.1);

  /* 过渡 */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/assets/styles/variables.css
git commit -m "feat(design): add CSS variables for design system"
```

---

### Task 2: 创建基础样式文件

**Files:**
- Create: `src/assets/styles/base.css`

- [ ] **Step 1: 创建 base.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Source+Sans+Pro:wght@400;600;700&family=JetBrains+Mono&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 15px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  color: var(--color-text);
  background-color: var(--color-bg);
  line-height: 1.6;
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-primary-dark);
}

button {
  font-family: inherit;
  cursor: pointer;
}

input,
textarea,
select {
  font-family: inherit;
  font-size: inherit;
}

img {
  max-width: 100%;
  height: auto;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.3;
}

h1 { font-size: var(--text-xl); }
h2 { font-size: var(--text-lg); }
h3 { font-size: var(--text-base); }

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}
```

- [ ] **Step 2: 在 main.js 中引入 base.css**

修改 `src/main.js`:
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/styles/base.css'

createApp(App).use(router).mount('#app')
```

- [ ] **Step 3: Commit**

```bash
git add src/assets/styles/base.css src/main.js
git commit -m "feat(design): add base styles and Google Fonts"
```

---

### Task 3: 创建组件样式文件

**Files:**
- Create: `src/assets/styles/components.css`

- [ ] **Step 1: 创建 components.css（按钮样式）**

```css
/* ===== 按钮 ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-base);
  font-weight: 500;
  border-radius: var(--radius-md);
  border: none;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.btn:hover {
  transform: scale(1.02);
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  color: white;
}

.btn-secondary {
  background-color: white;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-bg);
}

.btn-text {
  background: none;
  color: var(--color-primary);
  padding: var(--space-xs) var(--space-sm);
}

.btn-text:hover {
  text-decoration: underline;
}

.btn-lg {
  padding: var(--space-md) var(--space-lg);
  font-size: var(--text-lg);
}

.btn-sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--text-sm);
}

/* ===== 卡片 ===== */
.card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-md);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.card-static {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-md);
}

/* ===== 表单 ===== */
.form-group {
  margin-bottom: var(--space-md);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.form-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-base);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
}

.form-input.error {
  border-color: var(--color-error);
}

.form-error {
  font-size: var(--text-sm);
  color: var(--color-error);
  margin-top: var(--space-xs);
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

/* ===== 头像 ===== */
.avatar {
  border-radius: var(--radius-full);
  object-fit: cover;
  background: var(--color-secondary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.avatar-sm { width: 32px; height: 32px; font-size: var(--text-sm); }
.avatar-md { width: 48px; height: 48px; font-size: var(--text-lg); }
.avatar-lg { width: 64px; height: 64px; font-size: var(--text-xl); }

/* ===== 标签 ===== */
.tag {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--text-xs);
  background: #F3F4F6;
  color: #374151;
  border-radius: var(--radius-sm);
}

/* ===== 页面容器 ===== */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.page-header {
  margin-bottom: var(--space-lg);
}

/* ===== 分割线 ===== */
.divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--space-md) 0;
}

/* ===== 加载骨架屏 ===== */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

/* ===== 空状态 ===== */
.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-secondary);
}

/* ===== 工具类 ===== */
.text-primary { color: var(--color-primary); }
.text-secondary { color: var(--color-text-secondary); }
.text-muted { color: var(--color-text-muted); }
.text-center { text-align: center; }
.mt-sm { margin-top: var(--space-sm); }
.mt-md { margin-top: var(--space-md); }
.mt-lg { margin-top: var(--space-lg); }
.mb-md { margin-bottom: var(--space-md); }
.mb-lg { margin-bottom: var(--space-lg); }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-sm { gap: var(--space-sm); }
.gap-md { gap: var(--space-md); }
```

- [ ] **Step 2: Commit**

```bash
git add src/assets/styles/components.css
git commit -m "feat(design): add component styles"
```

---

### Task 4: 创建动画样式文件

**Files:**
- Create: `src/assets/styles/animations.css`

- [ ] **Step 1: 创建 animations.css**

```css
/* 页面淡入 */
.page-enter-active,
.page-leave-active {
  transition: opacity var(--transition-normal);
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* 卡片悬停动画 */
@keyframes cardHover {
  from {
    transform: translateY(0);
    box-shadow: var(--shadow-md);
  }
  to {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

/* 按钮点击反馈 */
@keyframes buttonPress {
  0% { transform: scale(1); }
  50% { transform: scale(0.97); }
  100% { transform: scale(1); }
}

/* 加载旋转 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 下拉展开 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: max-height var(--transition-normal), opacity var(--transition-normal);
  overflow: hidden;
}

.dropdown-enter-from,
.dropdown-leave-to {
  max-height: 0;
  opacity: 0;
}

.dropdown-enter-to,
.dropdown-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* 淡入上移 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp var(--transition-normal) ease-out;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/assets/styles/animations.css
git commit -m "feat(design): add animation styles"
```

---

### Task 5: 优化 NavBar 组件

**Files:**
- Modify: `src/components/NavBar.vue`

- [ ] **Step 1: 读取当前 NavBar.vue 内容**

```bash
cat src/components/NavBar.vue
```

- [ ] **Step 2: 更新 NavBar 样式**

用以下样式替换现有的 `<style>` 部分:

```css
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/NavBar.vue
git commit -m "refactor(design): style NavBar with new design system"
```

---

### Task 6: 优化 Home 首页

**Files:**
- Modify: `src/views/Home.vue`

- [ ] **Step 1: 读取当前 Home.vue 内容**

```bash
cat src/views/Home.vue
```

- [ ] **Step 2: 更新 Home.vue 样式**

用以下样式替换现有的 `<style>` 部分:

```css
<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.home-header {
  margin-bottom: var(--space-lg);
}

.home-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-secondary);
}

.home-subtitle {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}

.home-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--space-lg);
}

.boards-section h2,
.user-section h2 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-secondary);
  margin-bottom: var(--space-md);
}

.board-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.board-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  cursor: pointer;
}

.board-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.board-card h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-secondary);
  margin-bottom: var(--space-xs);
}

.board-card p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.board-card-meta {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-sm);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.user-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
}

.user-card-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.user-card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--text-lg);
}

.user-card-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
}

.user-card-bio {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}

.active-users {
  margin-top: var(--space-lg);
}

.active-users h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-secondary);
  margin-bottom: var(--space-sm);
}

.active-users-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.active-user-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .home-content {
    grid-template-columns: 1fr;
  }

  .user-section {
    order: -1;
  }
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/views/Home.vue
git commit -m "refactor(design): style Home page with new design system"
```

---

### Task 7: 优化 Login 登录页

**Files:**
- Modify: `src/views/Login.vue`

- [ ] **Step 1: 读取当前 Login.vue 内容**

```bash
cat src/views/Login.vue
```

- [ ] **Step 2: 更新 Login.vue 样式**

```css
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
```

- [ ] **Step 3: Commit**

```bash
git add src/views/Login.vue
git commit -m "refactor(design): style Login page with new design system"
```

---

### Task 8: 优化 Register 注册页

**Files:**
- Modify: `src/views/Register.vue`

- [ ] **Step 1: 读取当前 Register.vue 内容**

```bash
cat src/views/Register.vue
```

- [ ] **Step 2: 更新 Register.vue 样式**

```css
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
```

- [ ] **Step 3: Commit**

```bash
git add src/views/Register.vue
git commit -m "refactor(design): style Register page with new design system"
```

---

## 第二批次：内容页面

### Task 9: 优化 Board 板块页

**Files:**
- Modify: `src/views/Board.vue`

- [ ] **Step 1: 读取当前 Board.vue 内容**

```bash
cat src/views/Board.vue
```

- [ ] **Step 2: 更新 Board.vue 样式**

```css
<style scoped>
.board-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.board-header {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.board-header h1 {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-secondary);
  margin-bottom: var(--space-xs);
}

.board-header p {
  color: var(--color-text-secondary);
  font-size: var(--text-base);
}

.board-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.board-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-secondary);
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.post-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  cursor: pointer;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.post-card-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.post-card-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--text-sm);
}

.post-card-author {
  font-weight: 600;
  color: var(--color-text);
}

.post-card-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.post-card-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.post-card-excerpt {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card-footer {
  display: flex;
  gap: var(--space-lg);
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.post-card-stat {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}

.pagination-btn {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-card);
  color: var(--color-text);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.empty-state p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/views/Board.vue
git commit -m "refactor(design): style Board page with new design system"
```

---

### Task 10: 优化 PostDetail 帖子详情页

**Files:**
- Modify: `src/views/PostDetail.vue`

- [ ] **Step 1: 读取当前 PostDetail.vue 内容**

```bash
cat src/views/PostDetail.vue
```

- [ ] **Step 2: 更新 PostDetail.vue 样式**

```css
<style scoped>
.post-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-lg);
}

.post-main {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-lg);
}

.post-header {
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.post-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-secondary);
  margin-bottom: var(--space-md);
}

.post-meta {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.post-meta-author {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.post-meta-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--text-xs);
}

.post-content {
  font-size: var(--text-base);
  line-height: 1.8;
  color: var(--color-text);
  margin-bottom: var(--space-lg);
}

.post-content p {
  margin-bottom: var(--space-md);
}

.post-actions {
  display: flex;
  gap: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.post-action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.post-action-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.post-action-btn.active {
  background: rgba(255, 107, 53, 0.1);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.post-action-btn svg {
  width: 18px;
  height: 18px;
}

/* 评论区 */
.post-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.comments-section {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-md);
}

.comments-header {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-secondary);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

.comment-form {
  margin-bottom: var(--space-md);
}

.comment-form textarea {
  width: 100%;
  padding: var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  resize: vertical;
  min-height: 80px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.comment-form textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
}

.comment-form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-sm);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.comment-item {
  padding: var(--space-md);
  background: var(--color-bg);
  border-radius: var(--radius-md);
}

.comment-item-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.comment-item-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-secondary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--text-xs);
}

.comment-item-author {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.comment-item-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-left: auto;
}

.comment-item-content {
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: 1.6;
}

.comment-item-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.comment-reply-btn {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.comment-reply-btn:hover {
  color: var(--color-primary);
}

/* 嵌套回复 */
.comment-replies {
  margin-top: var(--space-md);
  margin-left: var(--space-lg);
  padding-left: var(--space-md);
  border-left: 2px solid var(--color-border);
}

.reply-item {
  padding: var(--space-sm);
  margin-bottom: var(--space-sm);
  background: var(--color-card);
  border-radius: var(--radius-sm);
}

.reply-item:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .post-detail-page {
    grid-template-columns: 1fr;
  }

  .post-sidebar {
    order: 1;
  }
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/views/PostDetail.vue
git commit -m "refactor(design): style PostDetail page with new design system"
```

---

## 第三批次：用户功能页面

### Task 11: 优化 CreatePost 发帖页

**Files:**
- Modify: `src/views/CreatePost.vue`

- [ ] **Step 1: 读取当前 CreatePost.vue 内容**

```bash
cat src/views/CreatePost.vue
```

- [ ] **Step 2: 更新 CreatePost.vue 样式**

```css
<style scoped>
.create-post-page {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.create-post-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-xl);
}

.create-post-header {
  margin-bottom: var(--space-lg);
}

.create-post-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-secondary);
}

.create-post-form .form-group {
  margin-bottom: var(--space-md);
}

.create-post-form .form-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.create-post-form .form-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.create-post-form .form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
}

.create-post-form textarea {
  min-height: 200px;
  resize: vertical;
}

.board-select {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background: var(--color-card);
  cursor: pointer;
}

.board-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
}

.file-upload-area {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  text-align: center;
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.file-upload-area:hover {
  border-color: var(--color-primary);
  background: rgba(255, 107, 53, 0.05);
}

.file-upload-area p {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.btn-cancel {
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  color: var(--color-text);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-cancel:hover {
  background: var(--color-bg);
}

.btn-submit {
  padding: var(--space-sm) var(--space-lg);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-submit:hover {
  background: var(--color-primary-dark);
  transform: scale(1.02);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
```

- [ ] **Step 3: Commit**

```bash
git add src/views/CreatePost.vue
git commit -m "refactor(design): style CreatePost page with new design system"
```

---

### Task 12: 优化 UserProfile 用户主页

**Files:**
- Modify: `src/views/UserProfile.vue`

- [ ] **Step 1: 读取当前 UserProfile.vue 内容**

```bash
cat src/views/UserProfile.vue
```

- [ ] **Step 2: 更新 UserProfile.vue 样式**

```css
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

.post-card {
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.post-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.post-card-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.post-card-meta {
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
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/views/UserProfile.vue
git commit -m "refactor(design): style UserProfile page with new design system"
```

---

### Task 13: 优化 EditProfile 编辑资料页

**Files:**
- Modify: `src/views/EditProfile.vue`

- [ ] **Step 1: 读取当前 EditProfile.vue 内容**

```bash
cat src/views/EditProfile.vue
```

- [ ] **Step 2: 更新 EditProfile.vue 样式**

```css
<style scoped>
.edit-profile-page {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.edit-profile-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-xl);
}

.edit-profile-header {
  margin-bottom: var(--space-lg);
}

.edit-profile-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-secondary);
}

.edit-profile-form .form-group {
  margin-bottom: var(--space-md);
}

.edit-profile-form .form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.edit-profile-form .form-input,
.edit-profile-form textarea {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.edit-profile-form .form-input:focus,
.edit-profile-form textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
}

.edit-profile-form textarea {
  min-height: 100px;
  resize: vertical;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.avatar-preview {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: var(--text-xl);
}

.avatar-upload-btn {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  color: var(--color-text);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.avatar-upload-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.btn-cancel {
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: white;
  color: var(--color-text);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-cancel:hover {
  background: var(--color-bg);
}

.btn-save {
  padding: var(--space-sm) var(--space-lg);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-save:hover {
  background: var(--color-primary-dark);
  transform: scale(1.02);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: #FEF2F2;
  color: var(--color-error);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
}

.success-message {
  background: #F0FDF4;
  color: var(--color-success);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/views/EditProfile.vue
git commit -m "refactor(design): style EditProfile page with new design system"
```

---

### Task 14: 更新 index.html 引入字体

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 读取当前 index.html 内容**

```bash
cat index.html
```

- [ ] **Step 2: 在 `<head>` 中添加字体链接**

在 `<head>` 中添加:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Source+Sans+Pro:wght@400;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(design): add Google Fonts links to index.html"
```

---

## 实施完成汇总

| 批次 | Task | 描述 | 文件 |
|------|------|------|------|
| 1 | 1 | CSS变量 | variables.css |
| 1 | 2 | 基础样式 | base.css, main.js |
| 1 | 3 | 组件样式 | components.css |
| 1 | 4 | 动画样式 | animations.css |
| 1 | 5 | NavBar | NavBar.vue |
| 1 | 6 | Home | Home.vue |
| 1 | 7 | Login | Login.vue |
| 1 | 8 | Register | Register.vue |
| 2 | 9 | Board | Board.vue |
| 2 | 10 | PostDetail | PostDetail.vue |
| 3 | 11 | CreatePost | CreatePost.vue |
| 3 | 12 | UserProfile | UserProfile.vue |
| 3 | 13 | EditProfile | EditProfile.vue |
| - | 14 | 字体引入 | index.html |

---

## 验证步骤

完成所有任务后，运行以下命令验证：

```bash
npm run dev
```

访问 http://localhost:5173 检查：
1. 导航栏是否为深蓝色，固定顶部
2. 首页板块卡片是否有橙色hover效果
3. 登录注册页是否为居中卡片布局
4. 各页面是否使用新字体
5. 动画是否流畅（页面切换、卡片悬停）
