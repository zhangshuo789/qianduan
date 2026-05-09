<template>
  <div class="help-page">
    <section class="help-hero">
      <div class="hero-content">
        <h1>帮助中心</h1>
        <p class="hero-subtitle">常见问题与使用指南</p>
      </div>
    </section>

    <div class="help-container">
      <div class="help-search">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索问题关键词..."
        />
      </div>

      <div v-for="(group, gi) in filteredGroups" :key="gi" class="faq-group">
        <h2 class="group-title">
          <span class="group-icon" :class="'gi-' + gi">{{ group.icon }}</span>
          {{ group.title }}
        </h2>
        <div class="faq-list">
          <div
            v-for="(item, ii) in group.items"
            :key="ii"
            class="faq-item"
            :class="{ open: item.open }"
          >
            <div class="faq-question" @click="item.open = !item.open">
              <span>{{ item.q }}</span>
              <svg
                class="faq-arrow"
                viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <div v-if="item.open" class="faq-answer">
              <p v-for="(line, li) in item.a" :key="li">{{ line }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredGroups.length === 0" class="no-result">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="8" y1="8" x2="14" y2="14"/><line x1="14" y1="8" x2="8" y2="14"/>
        </svg>
        <p>没有找到相关问题</p>
        <router-link to="/feedback" class="ci-link">提交反馈，我们会尽快解答</router-link>
      </div>

      <section class="help-more">
        <h3>没有找到答案？</h3>
        <p>你可以通过以下方式获取帮助：</p>
        <div class="more-actions">
          <router-link to="/feedback" class="ui-button ui-button-primary">提交反馈</router-link>
          <router-link to="/about" class="ui-button ui-button-secondary">联系我们</router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const keyword = ref('')

const faqGroups = ref([
  {
    title: '账号相关',
    icon: '👤',
    items: [
      {
        q: '如何注册账号？',
        a: ['点击右上角"注册"按钮，填写用户名、昵称和密码即可完成注册。注册后即可使用所有功能。'],
        open: false
      },
      {
        q: '忘记密码怎么办？',
        a: ['请联系管理员重置密码，或通过问题反馈提交密码重置请求，我们会尽快处理。'],
        open: false
      },
      {
        q: '如何修改个人资料？',
        a: ['登录后进入"个人中心"，点击"编辑资料"即可修改昵称、头像、个人简介等信息。'],
        open: false
      }
    ]
  },
  {
    title: '帖子与互动',
    icon: '💬',
    items: [
      {
        q: '如何发布帖子？',
        a: ['登录后点击右上角"发布新帖子"按钮，选择板块、填写标题和内容后提交即可。'],
        open: false
      },
      {
        q: '帖子支持哪些功能？',
        a: ['帖子支持点赞、收藏、评论功能。你也可以在评论中回复其他用户。'],
        open: false
      },
      {
        q: '如何删除自己的帖子？',
        a: ['进入帖子详情页，点击右上角的删除按钮即可删除自己的帖子。'],
        open: false
      }
    ]
  },
  {
    title: '赛事系统',
    icon: '🏆',
    items: [
      {
        q: '如何参加赛事？',
        a: ['进入"赛事中心"，找到报名中的赛事，点击进入详情页后点击"立即报名"，输入队伍名称即可。'],
        open: false
      },
      {
        q: '赛事对阵图是如何生成的？',
        a: ['组织者在报名结束后点击"手动开赛"，系统会根据报名队伍自动生成淘汰赛对阵图。'],
        open: false
      },
      {
        q: '如何查看比赛结果？',
        a: ['在赛事详情页的对阵图中，已完成的比赛会显示比分，获胜方以绿色高亮显示。'],
        open: false
      }
    ]
  },
  {
    title: '群聊与私信',
    icon: '👥',
    items: [
      {
        q: '如何创建群聊？',
        a: ['进入"群组"页面，点击"创建群聊"，填写群名称和简介即可。创建后可以邀请其他用户加入。'],
        open: false
      },
      {
        q: '如何发送私信？',
        a: ['进入对方的个人主页，点击"发消息"按钮即可开始私聊。也可以通过消息中心查看所有对话。'],
        open: false
      }
    ]
  },
  {
    title: '反馈与建议',
    icon: '📝',
    items: [
      {
        q: '如何提交问题反馈？',
        a: ['进入"问题反馈"页面，填写标题、选择分类（问题/建议/其他），详细描述后提交。管理员会尽快回复。'],
        open: false
      },
      {
        q: '反馈后多久能得到回复？',
        a: ['我们通常会在 1-3 个工作日内回复。你可以在"我的反馈"中查看回复状态。'],
        open: false
      }
    ]
  }
])

const filteredGroups = computed(() => {
  if (!keyword.value.trim()) return faqGroups.value
  const kw = keyword.value.trim().toLowerCase()
  return faqGroups.value
    .map(g => ({
      ...g,
      items: g.items.filter(
        item => item.q.toLowerCase().includes(kw) || item.a.some(l => l.toLowerCase().includes(kw))
      )
    }))
    .filter(g => g.items.length > 0)
})
</script>

<style scoped>
.help-page {
  min-height: calc(100vh - 72px);
}

.help-hero {
  background: var(--color-primary);
  padding: var(--space-10) var(--space-lg);
}

.hero-content {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
}

.help-hero h1 {
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

.help-container {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-lg) var(--space-2xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

/* 搜索 */
.help-search {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--color-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  padding: var(--space-md) var(--space-lg);
  box-shadow: var(--shadow-card);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.help-search:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.help-search svg {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.help-search input {
  flex: 1;
  border: none;
  outline: none;
  font-size: var(--text-base);
  color: var(--color-text);
  background: transparent;
}

.help-search input::placeholder {
  color: var(--color-text-muted);
}

/* 分组 */
.faq-group {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.group-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  padding: var(--space-lg) var(--space-xl);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border-light);
}

.group-icon {
  font-size: var(--text-lg);
}

/* FAQ 条目 */
.faq-list {
  display: flex;
  flex-direction: column;
}

.faq-item {
  border-bottom: 1px solid var(--color-border-light);
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-xl);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  transition: background var(--transition-fast);
}

.faq-question:hover {
  background: var(--color-bg-soft);
}

.faq-arrow {
  flex-shrink: 0;
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
}

.faq-item.open .faq-arrow {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 var(--space-xl) var(--space-lg);
}

.faq-answer p {
  margin: 0 0 var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.faq-answer p:last-child {
  margin-bottom: 0;
}

/* 无结果 */
.no-result {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.no-result p {
  margin: 0;
  font-size: var(--text-sm);
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
.help-more {
  text-align: center;
  background: var(--color-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  padding: var(--space-2xl);
}

.help-more h3 {
  margin: 0 0 var(--space-2);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text);
}

.help-more p {
  margin: 0 0 var(--space-lg);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.more-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
}

@media (max-width: 640px) {
  .help-hero {
    padding: var(--space-8) var(--space-md);
  }

  .help-hero h1 {
    font-size: var(--text-2xl);
  }

  .help-container {
    padding: var(--space-lg) var(--space-md);
  }

  .faq-question {
    padding: var(--space-md);
  }

  .faq-answer {
    padding: 0 var(--space-md) var(--space-md);
  }

  .more-actions {
    flex-direction: column;
  }
}
</style>
