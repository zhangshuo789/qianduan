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

        <!-- 评论区域 -->
        <div v-if="post" class="comment-section">
          <div class="comment-header">
            <h3>评论 ({{ totalComments }})</h3>
          </div>

          <!-- 发表评论 -->
          <div v-if="user" class="comment-form">
            <textarea
              v-model="commentContent"
              placeholder="发表看法..."
              rows="3"
            ></textarea>
            <div class="comment-form-actions">
              <button @click="submitComment" class="btn-submit" :disabled="submitting">
                {{ submitting ? '提交中...' : '发表评论' }}
              </button>
            </div>
          </div>
          <div v-else class="comment-login-tip">
            <router-link to="/login">登录</router-link>后可发表评论
          </div>

          <!-- 评论列表 -->
          <div v-if="commentsLoading" class="loading">加载评论...</div>
          <div v-else class="comment-list">
            <div v-if="comments.length === 0" class="comment-empty">暂无评论</div>
            <div v-for="(c, index) in processedComments" :key="c.id" class="comment-item">
              <div class="comment-main">
                <img :src="c.processedAvatar" class="comment-avatar" />
                <div class="comment-content">
                  <div class="comment-header-row">
                    <router-link :to="`/user/${c.user.id}`" class="comment-author">{{ c.user.nickname }}</router-link>
                    <span class="comment-time">{{ formatDate(c.createdAt) }}</span>
                  </div>
                  <p class="comment-text">{{ c.content }}</p>
                  <div class="comment-actions">
                    <button v-if="user" @click="showReplyForm(c.id)" class="comment-reply-btn">回复</button>
                    <button v-if="user && user.id === c.user.id" @click="deleteComment(c.id)" class="comment-delete">删除</button>
                  </div>
                </div>
              </div>

              <!-- 回复输入框 -->
              <div v-if="replyingTo === c.id" class="reply-form">
                <textarea
                  v-model="replyContent"
                  :placeholder="`回复 ${c.user.nickname}...`"
                  rows="2"
                ></textarea>
                <div class="reply-form-actions">
                  <button @click="cancelReply" class="btn-cancel">取消</button>
                  <button @click="submitReply(c.id)" class="btn-submit" :disabled="submitting">回复</button>
                </div>
              </div>

              <!-- 子评论 -->
              <div v-if="c.replies && c.replies.length > 0" class="comment-replies">
                <div v-for="reply in c.replies" :key="reply.id" class="reply-item">
                  <img :src="reply.processedAvatar" class="reply-avatar" />
                  <div class="reply-content">
                    <div class="reply-header-row">
                      <router-link :to="`/user/${reply.user.id}`" class="reply-author">{{ reply.user.nickname }}</router-link>
                      <span class="reply-time">{{ formatDate(reply.createdAt) }}</span>
                    </div>
                    <p class="reply-text">{{ reply.content }}</p>
                    <div class="comment-actions">
                      <button v-if="user" @click="showReplyForm(reply.id)" class="comment-reply-btn">回复</button>
                      <button v-if="user && user.id === reply.user.id" @click="deleteComment(reply.id)" class="comment-delete">删除</button>
                    </div>
                  </div>
                </div>

                <!-- 回复的回复输入框 -->
                <div v-if="replyingTo === reply.id" class="reply-form nested">
                  <textarea
                    v-model="replyContent"
                    :placeholder="`回复 ${reply.user.nickname}...`"
                    rows="2"
                  ></textarea>
                  <div class="reply-form-actions">
                    <button @click="cancelReply" class="btn-cancel">取消</button>
                    <button @click="submitReply(reply.id)" class="btn-submit" :disabled="submitting">回复</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="totalCommentPages > 1" class="pagination">
            <button :disabled="commentPage <= 0" @click="loadComments(commentPage - 1)">上一页</button>
            <span>{{ commentPage + 1 }} / {{ totalCommentPages }}</span>
            <button :disabled="commentPage >= totalCommentPages - 1" @click="loadComments(commentPage + 1)">下一页</button>
          </div>
        </div>
      </div>

      <div class="sidebar">
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
  const processed = []
  for (const c of commentList) {
    const procComment = { ...c }
    if (c.user?.avatar) {
      procComment.processedAvatar = await getAvatarUrl(c.user.avatar) || defaultAvatar
    } else {
      procComment.processedAvatar = defaultAvatar
    }
    if (c.replies && c.replies.length > 0) {
      procComment.replies = []
      for (const r of c.replies) {
        const procReply = { ...r }
        if (r.user?.avatar) {
          procReply.processedAvatar = await getAvatarUrl(r.user.avatar) || defaultAvatar
        } else {
          procReply.processedAvatar = defaultAvatar
        }
        procComment.replies.push(procReply)
      }
    }
    processed.push(procComment)
  }
  processedComments.value = processed
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
  background: var(--bg);
}

.main-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  gap: 24px;
}

.content-area {
  flex: 2;
}

.sidebar {
  flex: 1;
  min-width: 280px;
}

.post-card {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
}

.post-header {
  padding: 24px;
  border-bottom: 1px solid var(--border-light);
}

.post-header h1 {
  font-size: 22px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
  line-height: 1.4;
}

.post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.author {
  color: var(--text-secondary);
  text-decoration: none;
}

.author:hover {
  color: var(--primary);
}

.dot {
  width: 3px;
  height: 3px;
  background: var(--text-muted);
  border-radius: 50%;
  margin: 0 8px;
}

.board-tag {
  display: inline-block;
  padding: 4px 12px;
  background: var(--bg);
  color: var(--text-secondary);
  border-radius: 20px;
  font-size: 12px;
  text-decoration: none;
}

.board-tag:hover {
  background: var(--border-light);
  text-decoration: none;
}

.post-body {
  padding: 24px;
  font-size: 15px;
  line-height: 1.8;
  color: var(--text);
  white-space: pre-wrap;
}

.post-actions {
  padding: 16px 24px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-left {
  display: flex;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover {
  border-color: var(--border);
}

.action-btn.active {
  color: #cf222e;
  border-color: #cf222e;
  background: #fff0f0;
}

.action-right {
  display: flex;
  gap: 8px;
}

.btn-edit {
  padding: 6px 14px;
  background: var(--card-bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 13px;
  text-decoration: none;
}

.btn-edit:hover {
  background: var(--bg);
}

.btn-delete {
  padding: 6px 14px;
  background: var(--card-bg);
  color: #cf222e;
  border: 1px solid #cf222e;
  border-radius: var(--radius);
  font-size: 13px;
  cursor: pointer;
}

.btn-delete:hover {
  background: #ffebe9;
}

.loading, .empty {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-muted);
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
}

/* 评论区域 */
.comment-section {
  margin-top: 24px;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
}

.comment-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.comment-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.comment-form {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.comment-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
}

.comment-form textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.comment-form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.btn-submit {
  padding: 8px 20px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 14px;
  cursor: pointer;
}

.btn-submit:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-submit:disabled {
  background: var(--text-muted);
}

.comment-login-tip {
  padding: 16px 20px;
  text-align: center;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-light);
}

.comment-login-tip a {
  color: var(--primary);
}

.comment-list {
  padding: 8px 0;
}

.comment-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
}

.comment-item {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-main {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: 500;
  color: var(--text);
  text-decoration: none;
  font-size: 14px;
}

.comment-author:hover {
  color: var(--primary);
}

.comment-time {
  font-size: 12px;
  color: var(--text-muted);
}

.comment-text {
  font-size: 14px;
  color: var(--text);
  margin: 0;
  line-height: 1.6;
}

.comment-actions {
  margin-top: 8px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.comment-reply-btn,
.comment-delete {
  font-size: 12px;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.comment-reply-btn:hover {
  color: var(--primary);
}

.comment-delete:hover {
  color: #cf222e;
}

/* 回复表单 */
.reply-form {
  margin-top: 12px;
  margin-left: 48px;
  padding: 12px;
  background: var(--bg);
  border-radius: var(--radius);
}

.reply-form.nested {
  margin-left: 40px;
  margin-top: 8px;
}

.reply-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  box-sizing: border-box;
}

.reply-form textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.reply-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.reply-form-actions .btn-cancel {
  padding: 6px 12px;
  background: var(--card-bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 13px;
  cursor: pointer;
}

.reply-form-actions .btn-submit {
  padding: 6px 12px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: 13px;
  cursor: pointer;
}

.reply-form-actions .btn-submit:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
}

/* 子评论 */
.comment-replies {
  margin-top: 12px;
  margin-left: 48px;
  padding-left: 16px;
  border-left: 2px solid var(--border-light);
}

.reply-item {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
}

.reply-header-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.reply-author {
  font-weight: 500;
  color: var(--text);
  text-decoration: none;
  font-size: 13px;
}

.reply-author:hover {
  color: var(--primary);
}

.reply-time {
  font-size: 11px;
  color: var(--text-muted);
}

.reply-text {
  font-size: 13px;
  color: var(--text);
  margin: 0;
  line-height: 1.5;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
}

.pagination button {
  padding: 6px 14px;
  background: var(--card-bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 13px;
  cursor: pointer;
}

.pagination button:disabled {
  color: var(--text-muted);
  cursor: not-allowed;
}

/* 侧边栏 */
.sidebar-card {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  overflow: hidden;
}

.card-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  border-bottom: 1px solid var(--border-light);
  background: var(--bg);
}

.card-body {
  padding: 16px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
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
  color: var(--text);
  margin-bottom: 4px;
}

.author-bio {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}
</style>
