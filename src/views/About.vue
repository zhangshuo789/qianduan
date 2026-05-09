<template>
  <div class="about-page">
    <section class="about-hero">
      <div class="hero-content">
        <h1>关于我们</h1>
        <p class="hero-subtitle">热爱排球，连接每一个你</p>
      </div>
    </section>

    <div class="about-container">
      <section class="about-section intro-card">
        <div class="section-icon">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            <path d="M2 12h20"/>
          </svg>
        </div>
        <h2>排球社区</h2>
        <p>
          排球社区是一个专为排球爱好者打造的交流平台。无论你是业余爱好者还是资深球员，
          这里都是你分享排球故事、交流技术心得、组织赛事活动的理想之地。
        </p>
        <p>
          我们希望通过这个平台，让更多人了解排球、爱上排球，一起享受这项充满团队精神的运动。
        </p>
      </section>

      <div class="features-grid">
        <div class="feature-card">
          <div class="fc-icon fc-icon-1">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3>讨论交流</h3>
          <p>多个板块自由讨论，分享排球技术和精彩瞬间</p>
        </div>
        <div class="feature-card">
          <div class="fc-icon fc-icon-2">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
              <path d="M12 3v12"/>
              <circle cx="12" cy="21" r="1"/>
            </svg>
          </div>
          <h3>赛事组织</h3>
          <p>在线创建和管理排球赛事，自动对阵编排</p>
        </div>
        <div class="feature-card">
          <div class="fc-icon fc-icon-3">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h3>群聊互动</h3>
          <p>创建或加入群组，实时聊天，结识更多球友</p>
        </div>
        <div class="feature-card">
          <div class="fc-icon fc-icon-4">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h3>知识图谱</h3>
          <p>探索排球球员和球队的关系网络</p>
        </div>
      </div>

      <section class="about-section contact-card">
        <h2>联系我们</h2>
        <div class="contact-items">
          <div class="contact-item">
            <div class="ci-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <span class="ci-label">邮箱</span>
              <span class="ci-value">admin@volleyball-community.com</span>
            </div>
          </div>
          <div class="contact-item">
            <div class="ci-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <span class="ci-label">反馈</span>
              <router-link to="/feedback" class="ci-link">提交问题反馈</router-link>
            </div>
          </div>
          <div class="contact-item">
            <div class="ci-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </div>
            <div>
              <span class="ci-label">公告</span>
              <span class="ci-value">关注社区公告获取最新动态</span>
            </div>
          </div>
        </div>
      </section>

      <footer class="about-footer">
        <p>感谢每一位排球爱好者的支持与参与</p>
        <p class="footer-copy">排球社区 &copy; {{ year }}</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.about-page {
  min-height: calc(100vh - 72px);
}

.about-hero {
  background: var(--color-primary);
  padding: var(--space-12) var(--space-lg);
}

.hero-content {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
}

.about-hero h1 {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: white;
  margin: 0 0 var(--space-3);
}

.hero-subtitle {
  font-size: var(--text-lg);
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.about-container {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-lg) var(--space-2xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.about-section {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
}

.intro-card {
  text-align: center;
}

.section-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto var(--space-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-soft);
  border-radius: var(--radius-lg);
  color: var(--color-primary);
}

.intro-card h2 {
  margin: 0 0 var(--space-md);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
}

.intro-card p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin: 0 0 var(--space-md);
}

.intro-card p:last-child {
  margin-bottom: 0;
}

/* 功能卡片 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.feature-card {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  text-align: center;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
}

.fc-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto var(--space-md);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  color: white;
}

.fc-icon-1 { background: #6366F1; }
.fc-icon-2 { background: #FF6B35; }
.fc-icon-3 { background: #10B981; }
.fc-icon-4 { background: #F59E0B; }

.feature-card h3 {
  margin: 0 0 var(--space-2);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
}

.feature-card p {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* 联系我们 */
.contact-card h2 {
  margin: 0 0 var(--space-lg);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text);
}

.contact-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-bg-soft);
  border-radius: var(--radius-lg);
}

.ci-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.ci-label {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 2px;
}

.ci-value {
  font-size: var(--text-sm);
  color: var(--color-text);
}

.ci-link {
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-decoration: none;
}

.ci-link:hover {
  text-decoration: underline;
}

/* 底部 */
.about-footer {
  text-align: center;
  padding: var(--space-lg) 0 0;
}

.about-footer p {
  margin: 0 0 var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.footer-copy {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  opacity: 0.7;
}

@media (max-width: 640px) {
  .about-hero {
    padding: var(--space-8) var(--space-md);
  }

  .about-hero h1 {
    font-size: var(--text-2xl);
  }

  .about-container {
    padding: var(--space-lg) var(--space-md);
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
