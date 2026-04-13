<template>
  <div class="post-page">
    <NavBar />

    <div class="main-container">
      <div class="content-area">
        <div v-if="loading" class="loading">加载中...</div>
        <article v-else-if="post" class="post-card">
          <div class="post-header">
            <h1>{{ post.title }}</h1>
            <div class="post-meta">
              <router-link :to="`/user/${post.user.id}`" class="author">{{ post.user.nickname }}</router-link>
              <span class="dot"></span>
              <span>发布于 {{ formatDate(post.createdAt) }}</span>
              <template v-if="post.updatedAt !== post.createdAt">
                <span class="dot"></span>
                <span>编辑于 {{ formatDate(post.updatedAt) }}</span>
              </template>
            </div>
            <router-link :to="`/board/${post.board.id}`" class="board-tag">{{ post.board.name }}</router-link>
          </div>
          <div class="post-body">{{ post.content }}</div>

          <div class="post-actions">
            <div class="action-left">
              <button class="action-btn" :class="{ active: post.liked }" @click="handleLike">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>{{ post.likeCount || 0 }}</span>
              </button>
              <button class="action-btn" :class="{ active: post.favorited }" @click="handleFavorite">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <span>{{ post.favoriteCount || 0 }}</span>
              </button>
              <span class="action-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
                </svg>
                <span>{{ post.commentCount || 0 }}</span>
              </span>
            </div>
            <div class="action-right" v-if="canEdit">
              <router-link :to="`/edit-post/${post.id}`" class="btn-edit">编辑</router-link>
              <button @click="handleDelete" class="btn-delete">删除</button>
            </div>
          </div>
        </article>
        <div v-else class="empty">帖子不存在</div>

      </div>

      <!-- 右侧边栏 -->
      <div class="sidebar">
        <!-- 作者信息 -->
        <div class="sidebar-card author-card" v-if="post">
          <div class="card-header">作者信息</div>
          <div class="card-body">
            <router-link :to="`/user/${post.user.id}`" class="author-info">
              <img :src="authorAvatar" class="author-avatar" />
              <div class="author-details">
                <span class="author-name">{{ post.user.nickname }}</span>
                <p class="author-bio">查看他的更多帖子</p>
              </div>
            </router-link>
          </div>
        </div>

        <!-- 评论列表 -->
        <div v-if="post" class="sidebar-card comment-sidebar">
          <div class="card-header">评论 ({{ totalComments }})</div>
          <div class="comment-list">
            <div v-if="commentsLoading" class="loading-sm">加载评论...</div>
            <div v-else-if="processedComments.length === 0" class="comment-empty">暂无评论</div>
            <div v-for="c in processedComments" :key="c.id" class="comment-item">
              <div class="comment-main">
                <img :src="c.processedAvatar" class="comment-avatar" />
                <div class="comment-content">
                  <div class="comment-header-row">
                    <router-link :to="`/user/${c.user.id}`" class="comment-author">{{ c.user.nickname }}</router-link>
                  </div>
                  <p class="comment-text">{{ c.content }}</p>
                  <div class="comment-actions">
                    <button v-if="user" @click="showReplyForm(c.id)" class="comment-reply-btn">回复</button>
                    <button v-if="user && user.id === c.user.id" @click="deleteComment(c.id)" class="comment-delete">删除</button>
                  </div>
                </div>
              </div>
              <!-- 子评论 -->
              <div v-if="c.replies && c.replies.length > 0" class="comment-replies">
                <div v-for="reply in c.replies" :key="reply.id" class="reply-item">
                  <img :src="reply.processedAvatar" class="reply-avatar" />
                  <div class="reply-content">
                    <div class="reply-header-row">
                      <router-link :to="`/user/${reply.user.id}`" class="reply-author">{{ reply.user.nickname }}</router-link>
                    </div>
                    <p class="reply-text">{{ reply.content }}</p>
                    <div class="comment-actions">
                      <button v-if="user" @click="showReplyForm(reply.id)" class="comment-reply-btn">回复</button>
                      <button v-if="user && user.id === reply.user.id" @click="deleteComment(reply.id)" class="comment-delete">删除</button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 回复输入框 -->
              <div v-if="replyingTo === c.id" class="reply-form">
                <textarea v-model="replyContent" :placeholder="`回复 ${c.user.nickname}...`" rows="2"></textarea>
                <div class="reply-form-actions">
                  <button @click="cancelReply" class="btn-cancel">取消</button>
                  <button @click="submitReply(c.id)" class="btn-submit" :disabled="submitting">回复</button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="totalCommentPages > 1" class="pagination">
            <button :disabled="commentPage <= 0" @click="loadComments(commentPage - 1)">上一页</button>
            <span>{{ commentPage + 1 }}/{{ totalCommentPages }}</span>
            <button :disabled="commentPage >= totalCommentPages - 1" @click="loadComments(commentPage + 1)">下一页</button>
          </div>
        </div>

        <!-- 发表评论 -->
        <div v-if="post && user" class="sidebar-card comment-form-sidebar">
          <div class="card-header">发表评论</div>
          <div class="card-body">
            <textarea v-model="commentContent" placeholder="发表看法..." rows="3"></textarea>
            <button @click="submitComment" class="btn-submit" :disabled="submitting">
              {{ submitting ? '提交中...' : '发表评论' }}
            </button>
          </div>
        </div>
        <div v-if="post && !user" class="sidebar-card">
          <div class="card-body text-center">
            <router-link to="/login">登录</router-link>后可发表评论
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { post as postApi, comment as commentApi, getUser, getAvatarUrl } from '@/api'

const route = useRoute()
const router = useRouter()
const post = ref(null)
const loading = ref(true)
const user = getUser()
const defaultAvatar = 'https://via.placeholder.com/40'

const comments = ref([])
const commentsLoading = ref(true)
const commentContent = ref('')
const replyingTo = ref(null)
const replyContent = ref('')
const submitting = ref(false)
const commentPage = ref(0)
const totalCommentPages = ref(0)
const totalComments = ref(0)

const authorAvatar = ref('')
const processedComments = ref([])

const canEdit = computed(() => user && user.id === post.value?.user?.id)

function formatDate(d) {
  return new Date(d).toLocaleString('zh-CN')
}

async function processPost() {
  if (post.value?.user?.avatar) {
    authorAvatar.value = await getAvatarUrl(post.value.user.avatar) || defaultAvatar
  } else {
    authorAvatar.value = defaultAvatar
  }
}

async function processComments(commentList) {
  // 构建评论树（后端返回扁平数据，通过 parentId/parent_id 构建树形结构）
  const topLevelComments = []
  const replyMap = new Map()

  for (const c of commentList) {
    const proc = { ...c }
    if (c.user?.avatar) {
      proc.processedAvatar = await getAvatarUrl(c.user.avatar) || defaultAvatar
    } else {
      proc.processedAvatar = defaultAvatar
    }
    proc.replies = []
    replyMap.set(c.id, proc)
  }

  for (const c of commentList) {
    const proc = replyMap.get(c.id)
    // 支持 parentId 或 parent_id
    const parentId = c.parentId ?? c.parent_id
    if (parentId) {
      const parent = replyMap.get(parentId)
      if (parent) {
        parent.replies.push(proc)
      } else {
        topLevelComments.push(proc)
      }
    } else {
      topLevelComments.push(proc)
    }
  }

  processedComments.value = topLevelComments
}

async function handleLike() {
  if (!user) {
    router.push('/login')
    return
  }
  try {
    if (post.value.liked) {
      await postApi.unlike(route.params.id)
      post.value.liked = false
      post.value.likeCount = (post.value.likeCount || 1) - 1
    } else {
      await postApi.like(route.params.id)
      post.value.liked = true
      post.value.likeCount = (post.value.likeCount || 0) + 1
    }
  } catch (e) {
    alert(e.message)
  }
}

async function handleFavorite() {
  if (!user) {
    router.push('/login')
    return
  }
  try {
    if (post.value.favorited) {
      await postApi.unfavorite(route.params.id)
      post.value.favorited = false
      post.value.favoriteCount = (post.value.favoriteCount || 1) - 1
    } else {
      await postApi.favorite(route.params.id)
      post.value.favorited = true
      post.value.favoriteCount = (post.value.favoriteCount || 0) + 1
    }
  } catch (e) {
    alert(e.message)
  }
}

async function handleDelete() {
  if (!confirm('确定删除此帖子？')) return
  try {
    await postApi.delete(route.params.id)
    router.push('/')
  } catch (e) {
    alert(e.message)
  }
}

async function loadComments(p = 0) {
  commentsLoading.value = true
  try {
    const res = await postApi.getComments(route.params.id, p)
    comments.value = res.data.content
    totalCommentPages.value = res.data.totalPages
    totalComments.value = res.data.totalElements
    commentPage.value = p
    await processComments(res.data.content)
  } catch (e) {
    console.error(e)
  } finally {
    commentsLoading.value = false
  }
}

async function submitComment() {
  if (!commentContent.value.trim()) return
  submitting.value = true
  try {
    await postApi.addComment(route.params.id, commentContent.value)
    commentContent.value = ''
    loadComments(0)
    post.value.commentCount = (post.value.commentCount || 0) + 1
  } catch (e) {
    alert(e.message)
  } finally {
    submitting.value = false
  }
}

function showReplyForm(commentId) {
  if (!user) {
    router.push('/login')
    return
  }
  replyingTo.value = commentId
  replyContent.value = ''
}

function cancelReply() {
  replyingTo.value = null
  replyContent.value = ''
}

async function submitReply(parentId) {
  if (!replyContent.value.trim()) return
  submitting.value = true
  try {
    await postApi.addComment(route.params.id, replyContent.value, parentId)
    replyContent.value = ''
    replyingTo.value = null
    loadComments(commentPage.value)
    post.value.commentCount = (post.value.commentCount || 0) + 1
  } catch (e) {
    alert(e.message)
  } finally {
    submitting.value = false
  }
}

async function deleteComment(id) {
  if (!confirm('确定删除此评论？')) return
  try {
    await commentApi.delete(id)
    loadComments(commentPage.value)
    post.value.commentCount = Math.max((post.value.commentCount || 1) - 1, 0)
  } catch (e) {
    alert(e.message)
  }
}

onMounted(async () => {
  try {
    const res = await postApi.getDetail(route.params.id)
    post.value = res.data
    await processPost()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
  loadComments()
})
</script>

<style scoped>
.post-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-lg);
}

.content-area {
  min-width: 0;
}

.post-card {
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

.post-header h1 {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-secondary);
  margin-bottom: var(--space-md);
  line-height: 1.4;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.author {
  color: var(--color-text-secondary);
  text-decoration: none;
}

.author:hover {
  color: var(--color-primary);
}

.dot {
  width: 3px;
  height: 3px;
  background: var(--color-text-muted);
  border-radius: 50%;
}

.board-tag {
  display: inline-block;
  padding: var(--space-xs) var(--space-md);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border-radius: 20px;
  font-size: var(--text-xs);
  text-decoration: none;
}

.board-tag:hover {
  background: var(--color-border);
  text-decoration: none;
}

.post-body {
  font-size: var(--text-base);
  line-height: 1.8;
  color: var(--color-text);
  margin-bottom: var(--space-lg);
  white-space: pre-wrap;
}

.post-body p {
  margin-bottom: var(--space-md);
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.action-left {
  display: flex;
  gap: var(--space-md);
}

.action-btn {
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

.action-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.action-btn.active {
  background: rgba(255, 107, 53, 0.1);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-right {
  display: flex;
  gap: var(--space-sm);
}

.btn-edit {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  text-decoration: none;
}

.btn-edit:hover {
  background: var(--color-bg);
}

.btn-delete {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-card);
  color: #cf222e;
  border: 1px solid #cf222e;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  cursor: pointer;
}

.btn-delete:hover {
  background: #ffebe9;
}

.loading, .empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--color-text-muted);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.sidebar-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.card-header {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-secondary);
  border-bottom: 1px solid var(--color-border);
}

.card-body {
  padding: var(--space-md);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  text-decoration: none;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.author-details {
  flex: 1;
}

.author-name {
  display: block;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
}

.author-bio {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: 0;
}

/* 评论侧边栏 */
.comment-sidebar {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-md);
}

.comment-sidebar .card-header {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-secondary);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

.comment-sidebar .comment-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.comment-sidebar .comment-item {
  padding: var(--space-md);
  background: var(--color-bg);
  border-radius: var(--radius-md);
}

.comment-sidebar .comment-main {
  display: flex;
  gap: var(--space-sm);
}

.comment-sidebar .comment-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-sidebar .comment-content {
  flex: 1;
  min-width: 0;
}

.comment-sidebar .comment-header-row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-xs);
}

.comment-sidebar .comment-author {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.comment-sidebar .comment-author:hover {
  color: var(--color-primary);
}

.comment-sidebar .comment-text {
  font-size: var(--text-sm);
  color: var(--color-text);
  margin: 0;
  line-height: 1.6;
  word-break: break-all;
}

.comment-sidebar .comment-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-xs);
}

.comment-sidebar .comment-reply-btn {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.comment-sidebar .comment-reply-btn:hover {
  color: var(--color-primary);
}

.comment-sidebar .comment-delete {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.comment-sidebar .comment-delete:hover {
  color: #cf222e;
}

/* 嵌套回复 */
.comment-sidebar .comment-replies {
  margin-top: var(--space-sm);
  margin-left: var(--space-lg);
  padding-left: var(--space-sm);
  border-left: 2px solid var(--color-border);
}

.comment-sidebar .reply-item {
  padding: var(--space-sm);
  margin-bottom: var(--space-sm);
  background: var(--color-card);
  border-radius: var(--radius-sm);
}

.comment-sidebar .reply-item:last-child {
  margin-bottom: 0;
}

.comment-sidebar .reply-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-sidebar .reply-content {
  flex: 1;
  min-width: 0;
}

.comment-sidebar .reply-header-row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: 2px;
}

.comment-sidebar .reply-author {
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  font-size: var(--text-xs);
}

.comment-sidebar .reply-author:hover {
  color: var(--color-primary);
}

.comment-sidebar .reply-text {
  font-size: var(--text-xs);
  color: var(--color-text);
  margin: 0;
  line-height: 1.4;
  word-break: break-all;
}

/* 回复表单 */
.comment-sidebar .reply-form {
  margin-top: var(--space-sm);
  margin-left: var(--space-lg);
  padding: var(--space-sm);
  background: var(--color-bg);
  border-radius: var(--radius-md);
}

.comment-sidebar .reply-form textarea {
  width: 100%;
  padding: var(--space-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  resize: vertical;
  font-family: inherit;
  font-size: var(--text-xs);
  box-sizing: border-box;
}

.comment-sidebar .reply-form textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.comment-sidebar .reply-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-xs);
  margin-top: var(--space-xs);
}

.comment-sidebar .btn-cancel {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  cursor: pointer;
}

.comment-sidebar .btn-submit {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  cursor: pointer;
}

.comment-sidebar .btn-submit:disabled {
  background: var(--color-text-muted);
  cursor: not-allowed;
}

.comment-sidebar .pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-top: 1px solid var(--color-border);
}

.comment-sidebar .pagination button {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  cursor: pointer;
}

.comment-sidebar .pagination button:disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
}

/* 评论表单侧边栏 */
.comment-form-sidebar .card-body {
  padding: var(--space-sm) var(--space-md);
}

.comment-form-sidebar textarea {
  width: 100%;
  padding: var(--space-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  resize: vertical;
  font-family: inherit;
  font-size: var(--text-sm);
  box-sizing: border-box;
}

.comment-form-sidebar textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
}

.comment-form-sidebar .btn-submit {
  margin-top: var(--space-sm);
  width: 100%;
  padding: var(--space-sm);
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  cursor: pointer;
}

.comment-form-sidebar .btn-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.comment-form-sidebar .btn-submit:disabled {
  background: var(--color-text-muted);
  cursor: not-allowed;
}

.loading-sm {
  padding: 20px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.comment-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-muted);
}

.text-center {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.text-center a {
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .main-container {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: 1;
  }
}
</style>
