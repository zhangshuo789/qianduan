<template>
  <div class="post-page">
    <div class="main-container">
      <div class="content-area">
        <div v-if="loading" class="loading">
          <div class="spinner spinner-lg"></div>
          <span>加载中...</span>
        </div>
        <article v-else-if="post" class="post-card animate-fade-in-up">
          <div class="post-header">
            <h1>{{ post.title }}</h1>
            <div class="post-meta">
              <router-link :to="`/user/${post.user.id}`" class="author-link">
                <img :src="authorAvatar" class="author-avatar-small" />
                <span class="author-name">{{ post.user.nickname }}</span>
              </router-link>
              <span class="meta-dot"></span>
              <span class="meta-time">发布于 {{ formatDate(post.createdAt) }}</span>
              <template v-if="post.updatedAt !== post.createdAt">
                <span class="meta-dot"></span>
                <span class="meta-edited">编辑于 {{ formatDate(post.updatedAt) }}</span>
              </template>
            </div>
            <router-link :to="`/board/${post.board.id}`" class="board-tag">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              {{ post.board.name }}
            </router-link>
          </div>
          <div class="post-body">{{ post.content }}</div>

          <div class="post-actions">
            <div class="action-left">
              <button class="action-btn" :class="{ active: post.liked }" @click="handleLike">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>{{ post.likeCount || 0 }}</span>
              </button>
              <button class="action-btn" :class="{ active: post.favorited }" @click="handleFavorite">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <span>{{ post.favoriteCount || 0 }}</span>
              </button>
              <span class="action-btn action-btn-static">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
                </svg>
                <span>{{ post.commentCount || 0 }}</span>
              </span>
            </div>
            <div class="action-right" v-if="canEdit">
              <router-link :to="`/edit-post/${post.id}`" class="btn-edit">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                编辑
              </router-link>
              <button @click="handleDelete" class="btn-delete">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                删除
              </button>
              <button v-if="user && user.id !== post.user?.id" @click="showReportModal = true" class="btn-report">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                  <line x1="4" y1="22" x2="4" y2="15"/>
                </svg>
                举报
              </button>
            </div>
          </div>
        </article>
        <div v-else class="empty">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>帖子不存在</p>
        </div>
      </div>

      <div class="sidebar">
        <div class="sidebar-card author-card" v-if="post">
          <div class="card-header">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            作者信息
          </div>
          <div class="card-body">
            <router-link :to="`/user/${post.user.id}`" class="author-info">
              <img :src="authorAvatar" class="author-avatar" />
              <div class="author-details">
                <span class="author-name-main">{{ post.user.nickname }}</span>
                <p class="author-bio">查看他的更多帖子</p>
              </div>
              <svg class="author-arrow" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </router-link>
          </div>
        </div>

        <div v-if="post" class="sidebar-card comment-sidebar">
          <div class="card-header">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            评论 ({{ totalComments }})
          </div>
          <div class="comment-list">
            <div v-if="commentsLoading" class="loading-sm">
              <div class="spinner"></div>
              <span>加载评论...</span>
            </div>
            <div v-else-if="processedComments.length === 0" class="comment-empty">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>暂无评论</span>
            </div>
            <div v-for="c in processedComments" :key="c.id" class="comment-item">
              <div class="comment-main">
                <img :src="c.processedAvatar" class="comment-avatar" />
                <div class="comment-content">
                  <div class="comment-header-row">
                    <router-link :to="`/user/${c.user.id}`" class="comment-author">{{ c.user.nickname }}</router-link>
                    <span class="comment-time">{{ formatDate(c.createdAt) }}</span>
                  </div>
                  <p class="comment-text">{{ c.content }}</p>
                  <div class="comment-actions">
                    <button v-if="user" @click="setReplyTo(c)" class="comment-reply-btn">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 17 4 12 9 7"/>
                        <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                      </svg>
                      回复
                    </button>
                    <button v-if="user && user.id === c.user.id" @click="deleteComment(c.id)" class="comment-delete">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                      删除
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="c.replies && c.replies.length > 0" class="comment-replies">
                <div v-for="reply in c.replies" :key="reply.id" class="reply-item">
                  <img :src="reply.processedAvatar" class="reply-avatar" />
                  <div class="reply-content">
                    <div class="reply-header-row">
                      <router-link :to="`/user/${reply.user.id}`" class="reply-author">{{ reply.user.nickname }}</router-link>
                      <span v-if="reply.replyToName" class="reply-to">回复 <span class="reply-to-name">@{{ reply.replyToName }}</span></span>
                      <span class="reply-time">{{ formatDate(reply.createdAt) }}</span>
                    </div>
                    <p class="reply-text">{{ reply.content }}</p>
                    <div class="comment-actions">
                      <button v-if="user" @click="setReplyTo(reply)" class="comment-reply-btn">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="9 17 4 12 9 7"/>
                          <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                        </svg>
                        回复
                      </button>
                      <button v-if="user && user.id === reply.user.id" @click="deleteComment(reply.id)" class="comment-delete">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="totalCommentPages > 1" class="pagination">
            <button :disabled="commentPage <= 0" @click="loadComments(commentPage - 1)" class="page-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span class="page-info">{{ commentPage + 1 }} / {{ totalCommentPages }}</span>
            <button :disabled="commentPage >= totalCommentPages - 1" @click="loadComments(commentPage + 1)" class="page-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="post && user" class="sidebar-card comment-form-card">
          <div class="card-header">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            发表评论
          </div>
          <div class="card-body">
            <div v-if="replyingTo" class="reply-indicator">
              <span>回复 <strong>@{{ replyToUser }}</strong></span>
              <button @click="cancelReply" class="cancel-reply-btn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <textarea v-model="commentContent" :placeholder="replyingTo ? `回复 ${replyToUser}...` : '发表你的看法...'" rows="3"></textarea>
            <button @click="submitComment" class="btn-submit-full" :disabled="submitting">
              <svg v-if="!submitting" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              {{ submitting ? '提交中...' : (replyingTo ? '发送回复' : '发表评论') }}
            </button>
          </div>
        </div>
        <div v-if="post && !user" class="sidebar-card login-hint-card">
          <div class="login-hint">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p><router-link to="/login">登录</router-link>后可发表评论</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 举报弹窗 -->
    <div class="modal-overlay" v-if="showReportModal" @click.self="showReportModal = false">
      <div class="modal ui-card">
        <h3 class="modal-title">举报帖子</h3>
        <div class="form-group">
          <label>举报原因</label>
          <select v-model="reportReason">
            <option value="">请选择举报原因</option>
            <option value="垃圾广告">垃圾广告</option>
            <option value="违规内容">违规内容</option>
            <option value="人身攻击">人身攻击</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="form-group">
          <label>详细说明（可选）</label>
          <textarea v-model="reportDetail" placeholder="请详细描述问题..." rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showReportModal = false">取消</button>
          <button class="btn btn-primary" @click="submitReport" :disabled="!reportReason">提交举报</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { post as postApi, comment as commentApi, report as reportApi, getUser, getAvatarUrl, DEFAULT_AVATAR } from '@/api'
import { toastBus } from '@/utils/toast'

const route = useRoute()
const router = useRouter()
const post = ref(null)
const loading = ref(true)
const user = getUser()
const defaultAvatar = DEFAULT_AVATAR

const comments = ref([])
const commentsLoading = ref(true)
const commentContent = ref('')
const replyingTo = ref(null)
const replyToUser = ref(null)
const submitting = ref(false)
const commentPage = ref(0)
const totalCommentPages = ref(0)
const totalComments = ref(0)

const showReportModal = ref(false)
const reportReason = ref('')
const reportDetail = ref('')

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
  const commentMap = new Map()
  const topLevelComments = []

  for (const c of commentList) {
    const proc = { ...c }
    if (c.user?.avatar) {
      proc.processedAvatar = await getAvatarUrl(c.user.avatar) || defaultAvatar
    } else {
      proc.processedAvatar = defaultAvatar
    }
    proc.replies = []
    commentMap.set(c.id, proc)
  }

  for (const c of commentList) {
    const proc = commentMap.get(c.id)
    const parentId = c.parentId ?? c.parent_id
    
    if (!parentId) {
      topLevelComments.push(proc)
    } else {
      let rootParentId = parentId
      let current = commentMap.get(parentId)
      while (current && (current.parentId || current.parent_id)) {
        rootParentId = current.parentId || current.parent_id
        current = commentMap.get(rootParentId)
      }
      
      const rootParent = commentMap.get(rootParentId)
      if (rootParent && rootParentId !== c.id) {
        const parentComment = commentMap.get(parentId)
        proc.replyToName = parentComment?.user?.nickname || ''
        rootParent.replies.push(proc)
      } else {
        topLevelComments.push(proc)
      }
    }
  }

  for (const tc of topLevelComments) {
    tc.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  }
  
  topLevelComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
    toastBus.error(e.message)
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
    toastBus.error(e.message)
  }
}

async function handleDelete() {
  if (!confirm('确定删除此帖子？')) return
  try {
    await postApi.delete(route.params.id)
    router.push('/')
  } catch (e) {
    toastBus.error(e.message)
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
    if (replyingTo.value) {
      await postApi.addComment(route.params.id, commentContent.value, replyingTo.value)
    } else {
      await postApi.addComment(route.params.id, commentContent.value)
    }
    commentContent.value = ''
    replyingTo.value = null
    replyToUser.value = null
    loadComments(0)
    post.value.commentCount = (post.value.commentCount || 0) + 1
  } catch (e) {
    toastBus.error(e.message)
  } finally {
    submitting.value = false
  }
}

function setReplyTo(comment) {
  if (!user) {
    router.push('/login')
    return
  }
  replyingTo.value = comment.id
  replyToUser.value = comment.user.nickname
}

function cancelReply() {
  replyingTo.value = null
  replyToUser.value = null
}

async function deleteComment(id) {
  if (!confirm('确定删除此评论？')) return
  try {
    await commentApi.delete(id)
    loadComments(commentPage.value)
    post.value.commentCount = Math.max((post.value.commentCount || 1) - 1, 0)
  } catch (e) {
    toastBus.error(e.message)
  }
}

async function submitReport() {
  if (!reportReason.value) {
    toastBus.warning('请选择举报原因')
    return
  }
  try {
    await reportApi.create({
      targetType: 'POST',
      targetId: post.value.id,
      reason: reportReason.value + (reportDetail.value ? ': ' + reportDetail.value : '')
    })
    toastBus.success('举报成功，我们会尽快处理')
    showReportModal.value = false
    reportReason.value = ''
    reportDetail.value = ''
  } catch (e) {
    toastBus.error(e.message || '举报失败')
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
  min-height: 100%;
  background: var(--color-bg);
}

.main-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: var(--space-lg);
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: var(--space-lg);
}

.content-area {
  min-width: 0;
}

.post-card {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);
  padding: var(--space-xl);
}

.post-header {
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.post-header h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-md);
  line-height: 1.4;
}

.post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
}

.author-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.author-link:hover {
  background: var(--color-bg-soft);
}

.author-avatar-small {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.author-name {
  color: var(--color-text);
  font-weight: 500;
}

.meta-dot {
  width: 4px;
  height: 4px;
  background: var(--color-text-muted);
  border-radius: var(--radius-full);
}

.meta-time, .meta-edited {
  color: var(--color-text-muted);
}

.board-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  text-decoration: none;
  transition: all var(--transition-fast);
}

.board-tag:hover {
  background: var(--color-primary);
  color: white;
}

.post-body {
  font-size: var(--text-base);
  line-height: 1.8;
  color: var(--color-text);
  margin-bottom: var(--space-xl);
  white-space: pre-wrap;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.action-left {
  display: flex;
  gap: var(--space-3);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-card);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.action-btn.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.action-btn-static {
  cursor: default;
}

.action-btn-static:hover {
  border-color: var(--color-border);
  color: var(--color-text-secondary);
  background: var(--color-card);
}

.action-right {
  display: flex;
  gap: var(--space-2);
}

.btn-edit, .btn-delete {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-edit {
  background: var(--color-bg-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  text-decoration: none;
}

.btn-edit:hover {
  background: var(--color-secondary-soft);
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}

.btn-delete {
  background: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
}

.btn-delete:hover {
  background: var(--color-error-soft);
}

.btn-report {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.btn-report:hover {
  background: var(--color-error-soft);
  border-color: var(--color-error);
  color: var(--color-error);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 400px;
  padding: var(--space-xl);
  background: var(--color-card);
  border-radius: var(--radius-xl);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 var(--space-xl);
}

.form-group {
  margin-bottom: var(--space-lg);
}

.form-group label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.form-group select,
.form-group textarea {
  width: 100%;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  background: var(--color-bg-page);
  color: var(--color-text);
  box-sizing: border-box;
  font-family: inherit;
}

.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
}

.btn {
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-secondary {
  background: var(--color-bg-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading, .empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  text-align: center;
  color: var(--color-text-muted);
  background: var(--color-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.sidebar-card {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-md) var(--space-lg);
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-bg-soft);
}

.card-body {
  padding: var(--space-lg);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  text-decoration: none;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.author-info:hover {
  background: var(--color-bg-soft);
}

.author-avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 3px solid var(--color-border-light);
}

.author-details {
  flex: 1;
}

.author-name-main {
  display: block;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.author-bio {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.author-arrow {
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
}

.author-info:hover .author-arrow {
  transform: translateX(4px);
  color: var(--color-primary);
}

.comment-sidebar .card-header {
  padding: var(--space-md) var(--space-lg);
}

.comment-list {
  max-height: 400px;
  overflow-y: auto;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.loading-sm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.comment-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-xl);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.comment-item {
  padding: var(--space-md);
  background: var(--color-bg-soft);
  border-radius: var(--radius-lg);
}

.comment-main {
  display: flex;
  gap: var(--space-3);
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.comment-author {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.comment-author:hover {
  color: var(--color-primary);
}

.comment-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.comment-text {
  font-size: var(--text-sm);
  color: var(--color-text);
  margin: 0;
  line-height: 1.6;
  word-break: break-all;
}

.comment-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.comment-reply-btn, .comment-delete {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.comment-reply-btn:hover {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.comment-delete:hover {
  color: var(--color-error);
  background: var(--color-error-soft);
}

.comment-replies {
  margin-top: var(--space-md);
  margin-left: var(--space-10);
  padding-left: var(--space-md);
  border-left: 2px solid var(--color-border);
}

.reply-item {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-sm);
  margin-bottom: var(--space-sm);
  background: var(--color-card);
  border-radius: var(--radius-md);
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-header-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.reply-author {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
}

.reply-author:hover {
  color: var(--color-primary);
}

.reply-time {
  font-size: 10px;
  color: var(--color-text-muted);
}

.reply-to {
  font-size: 10px;
  color: var(--color-text-muted);
}

.reply-to-name {
  color: var(--color-primary);
  font-weight: 500;
}

.reply-text {
  font-size: var(--text-xs);
  color: var(--color-text);
  margin: 0;
  line-height: 1.5;
  word-break: break-all;
}

.reply-form {
  margin-top: var(--space-md);
  margin-left: var(--space-10);
  padding: var(--space-md);
  background: var(--color-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.reply-form textarea {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  resize: vertical;
  font-family: inherit;
  font-size: var(--text-sm);
  box-sizing: border-box;
  transition: all var(--transition-fast);
}

.reply-form textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.reply-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-sm);
}

.btn-cancel {
  padding: var(--space-1) var(--space-3);
  background: var(--color-bg-soft);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-cancel:hover {
  background: var(--color-border);
}

.btn-submit {
  padding: var(--space-1) var(--space-3);
  background: var(--color-primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-submit:hover:not(:disabled) {
  box-shadow: var(--shadow-primary);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-md);
  border-top: 1px solid var(--color-border-light);
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-bg-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled) {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  min-width: 60px;
  text-align: center;
}

.comment-form-card .card-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.reply-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  background: var(--color-primary-soft);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.reply-indicator strong {
  color: var(--color-primary);
}

.cancel-reply-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.cancel-reply-btn:hover {
  background: var(--color-bg-soft);
  color: var(--color-text);
}

.comment-form-card textarea {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  resize: vertical;
  font-family: inherit;
  font-size: var(--text-sm);
  box-sizing: border-box;
  transition: all var(--transition-fast);
}

.comment-form-card textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.btn-submit-full {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3);
  background: var(--color-primary-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-submit-full:hover:not(:disabled) {
  box-shadow: var(--shadow-primary);
  transform: translateY(-2px);
}

.btn-submit-full:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-hint-card .card-body {
  padding: var(--space-xl);
}

.login-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  text-align: center;
  color: var(--color-text-muted);
}

.login-hint p {
  font-size: var(--text-sm);
  margin: 0;
}

.login-hint a {
  color: var(--color-primary);
  font-weight: 500;
}

.slide-enter-active,
.slide-leave-active {
  transition: all var(--transition-normal);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 960px) {
  .main-container {
    grid-template-columns: 1fr;
  }

  .post-card {
    padding: var(--space-lg);
  }

  .post-header h1 {
    font-size: var(--text-xl);
  }
}

@media (max-width: 640px) {
  .main-container {
    padding: var(--space-md);
  }

  .post-card {
    padding: var(--space-md);
  }

  .post-actions {
    flex-direction: column;
    gap: var(--space-md);
  }

  .action-left {
    width: 100%;
    justify-content: center;
  }

  .action-right {
    width: 100%;
    justify-content: center;
  }
}
</style>
