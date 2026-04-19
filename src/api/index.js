const API_BASE = '/api'

function getHeaders(options) {
  const token = localStorage.getItem('token')
  const headers = {
    ...options.headers
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getHeaders(options)
  }

  const res = await fetch(API_BASE + url, {
    ...options,
    headers
  })

  let data
  try {
    data = await res.json()
  } catch (e) {
    throw new Error(`响应解析失败: ${res.status} ${res.statusText}`)
  }

  if (data.code !== 200) {
    throw new Error(data.message || `请求失败 (${data.code})`)
  }
  return data
}

async function multipartRequest(url, formData) {
  const headers = getHeaders({})

  const res = await fetch(API_BASE + url, {
    method: 'POST',
    headers,
    body: formData
  })

  let data
  try {
    data = await res.json()
  } catch (e) {
    throw new Error(`响应解析失败: ${res.status} ${res.statusText}`)
  }

  if (data.code !== 200) {
    throw new Error(data.message || `请求失败 (${data.code})`)
  }
  return data
}

export const auth = {
  register(data) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  login(data) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

export const user = {
  getInfo(id) {
    return request(`/user/${id}`)
  },
  update(id, data) {
    return request(`/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  getFavorites(id, page = 0, size = 10) {
    return request(`/user/${id}/favorites?page=${page}&size=${size}`)
  },
  getStats(id) {
    return request(`/user/${id}/stats`)
  },
  getFeed(id, page = 0, size = 10) {
    return request(`/user/${id}/feed?page=${page}&size=${size}`)
  },
  getPosts(id, page = 0, size = 10) {
    return request(`/user/${id}/posts?page=${page}&size=${size}`)
  }
}

export const board = {
  list() {
    return request('/boards')
  },
  getPosts(id, page = 0, size = 10) {
    return request(`/boards/${id}/posts?page=${page}&size=${size}`)
  }
}

export const post = {
  create(data) {
    return request('/post', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  getDetail(id) {
    return request(`/post/${id}`)
  },
  update(id, data) {
    return request(`/post/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  delete(id) {
    return request(`/post/${id}`, {
      method: 'DELETE'
    })
  },
  like(id) {
    return request(`/post/${id}/like`, { method: 'POST' })
  },
  unlike(id) {
    return request(`/post/${id}/unlike`, { method: 'DELETE' })
  },
  favorite(id) {
    return request(`/post/${id}/favorite`, { method: 'POST' })
  },
  unfavorite(id) {
    return request(`/post/${id}/unfavorite`, { method: 'DELETE' })
  },
  getComments(id, page = 0, size = 10) {
    return request(`/post/${id}/comments?page=${page}&size=${size}`)
  },
  addComment(postId, content, parentId = null) {
    return request(`/post/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId })
    })
  }
}

export const comment = {
  delete(id) {
    return request(`/comment/${id}`, { method: 'DELETE' })
  }
}

export const report = {
  create(data) {
    return request('/admin/reports', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

export const file = {
  upload(formData) {
    return multipartRequest('/file/upload', formData)
  }
}

export const follow = {
  follow(userId) {
    return request(`/follow/${userId}`, { method: 'POST' })
  },
  unfollow(userId) {
    return request(`/follow/${userId}`, { method: 'DELETE' })
  },
  getFollowStatus(userId) {
    return request(`/follow/${userId}/status`)
  },
  getFollowing(userId, page = 0, size = 10) {
    return request(`/user/${userId}/following?page=${page}&size=${size}`)
  },
  getFollowers(userId, page = 0, size = 10) {
    return request(`/user/${userId}/followers?page=${page}&size=${size}`)
  },
  getFriends(userId, page = 0, size = 10) {
    return request(`/user/${userId}/friends?page=${page}&size=${size}`)
  }
}

export const message = {
  getConversations() {
    return request('/message/conversations')
  },
  getPrivateMessages(userId, page = 0, size = 20) {
    return request(`/message/private/${userId}?page=${page}&size=${size}`)
  },
  sendPrivateMessage(userId, content) {
    return request(`/message/private/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
  },
  markAsRead(conversationWithUserId) {
    return request('/message/read', {
      method: 'POST',
      body: JSON.stringify({ conversationWithUserId })
    })
  },
  getUnreadCount() {
    return request('/message/unread-count')
  }
}

export const group = {
  create(data) {
    return request('/group', { method: 'POST', body: JSON.stringify(data) })
  },
  getInfo(id) {
    return request(`/group/${id}`)
  },
  getMembers(id) {
    return request(`/group/${id}/members`)
  },
  addMember(groupId, userId) {
    return request(`/group/${groupId}/members?userId=${userId}`, { method: 'POST' })
  },
  removeMember(groupId, userId) {
    return request(`/group/${groupId}/members/${userId}`, { method: 'DELETE' })
  },
  leave(groupId, userId) {
    return request(`/group/${groupId}/members/${userId}/leave`, { method: 'POST' })
  },
  banMember(groupId, userId) {
    return request(`/group/${groupId}/ban/${userId}`, { method: 'POST' })
  },
  unbanMember(groupId, userId) {
    return request(`/group/${groupId}/unban/${userId}`, { method: 'DELETE' })
  },
  getMessages(groupId, page = 0, size = 20) {
    return request(`/group/${groupId}/messages?page=${page}&size=${size}`)
  },
  sendMessage(groupId, content) {
    return request(`/group/${groupId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
  }
}

export const event = {
  list(page = 0, size = 10) {
    return request(`/event?page=${page}&size=${size}`)
  },
  getDetail(id) {
    return request(`/event/${id}`)
  },
  create(data) {
    return request('/event', { method: 'POST', body: JSON.stringify(data) })
  },
  createWithImages(formData) {
    const token = localStorage.getItem('token')
    return fetch('/api/event', {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    }).then(res => {
      if (!res.ok) {
        return res.json().then(err => { throw new Error(err.message || '请求失败') })
      }
      return res.json()
    }).then(data => {
      if (data.code !== 200) {
        throw new Error(data.message || '请求失败')
      }
      return data
    })
  },
  update(id, data) {
    return request(`/event/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  delete(id) {
    return request(`/event/${id}`, { method: 'DELETE' })
  },
  subscribe(id) {
    return request(`/event/${id}/subscribe`, { method: 'POST' })
  },
  unsubscribe(id) {
    return request(`/event/${id}/subscribe`, { method: 'DELETE' })
  },
  register(id, data) {
    return request(`/event/${id}/register`, { method: 'POST', body: JSON.stringify(data) })
  },
  getRegistrations(id) {
    return request(`/event/${id}/registration`)
  },
  reviewRegistration(eventId, regId, approved) {
    return request(`/event/${eventId}/registration/${regId}?approved=${approved}`, { method: 'PUT' })
  },
  getSubscriptions(userId) {
    return request(`/user/${userId}/subscriptions`)
  }
}

export const admin = {
  // 用户管理
  getUsers(params = {}) {
    return request(`/admin/users?page=${params.page || 0}&size=${params.size || 10}&keyword=${params.keyword || ''}&disabled=${params.disabled || ''}`)
  },
  setUserRole(userId, roleId) {
    return request(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ roleId }) })
  },
  setUserStatus(userId, disabled, reason) {
    return request(`/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ disabled, reason }) })
  },

  // 内容审核
  getReports(params = {}) {
    return request(`/admin/reports?page=${params.page || 0}&size=${params.size || 10}&status=${params.status || ''}`)
  },
  handleReport(reportId, approved, result) {
    return request(`/admin/reports/${reportId}`, { method: 'PUT', body: JSON.stringify({ approved, result }) })
  },
  getPendingCount() {
    return request('/admin/reports/pending')
  },

  // 内容管理
  deletePost(postId) {
    return request(`/admin/posts/${postId}`, { method: 'DELETE' })
  },
  deleteComment(commentId) {
    return request(`/admin/comments/${commentId}`, { method: 'DELETE' })
  },

  // 赛事管理
  getEvents(params = {}) {
    return request(`/admin/events?page=${params.page || 0}&size=${params.size || 10}`)
  },
  updateEventStatus(eventId, status) {
    return request(`/admin/events/${eventId}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
  },
  getEventRegistrations(eventId) {
    return request(`/admin/events/${eventId}/registrations`)
  },

  // 群聊管理
  getGroups(params = {}) {
    return request(`/admin/groups?page=${params.page || 0}&size=${params.size || 10}`)
  },
  changeGroupOwner(groupId, newOwnerId) {
    return request(`/admin/groups/${groupId}/owner`, { method: 'PUT', body: JSON.stringify({ newOwnerId }) })
  },
  dissolveGroup(groupId) {
    return request(`/admin/groups/${groupId}`, { method: 'DELETE' })
  },

  // 数据统计
  getOverview() {
    return request('/admin/stats/overview')
  },
  getUserStats() {
    return request('/admin/stats/users')
  },
  getContentStats() {
    return request('/admin/stats/content')
  },

  // 系统配置
  getBoards() {
    return request('/admin/boards')
  },
  createBoard(data) {
    return request('/admin/boards', { method: 'POST', body: JSON.stringify(data) })
  },
  updateBoard(id, data) {
    return request(`/admin/boards/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  deleteBoard(id) {
    return request(`/admin/boards/${id}`, { method: 'DELETE' })
  },
  getSensitiveWords() {
    return request('/admin/sensitive-words')
  },
  addSensitiveWord(data) {
    return request('/admin/sensitive-words', { method: 'POST', body: JSON.stringify(data) })
  },
  updateSensitiveWord(id, data) {
    return request(`/admin/sensitive-words/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  deleteSensitiveWord(id) {
    return request(`/admin/sensitive-words/${id}`, { method: 'DELETE' })
  },

  // 操作日志
  getLogs(params = {}) {
    return request(`/admin/logs?page=${params.page || 0}&size=${params.size || 10}`)
  },

  // 管理通知
  sendNotification(data) {
    return request(`/admin/notification/send?type=${data.type || 'BROADCAST'}&persist=${data.persist !== false}`, {
      method: 'POST',
      body: JSON.stringify({ title: data.title, content: data.content })
    })
  },
  getNotificationList() {
    return request('/admin/notification/list')
  },
  getNotificationUnreadCount() {
    return request('/admin/notification/unread-count')
  },
  markNotificationRead(id) {
    return request(`/admin/notification/${id}/read`, { method: 'PUT' })
  },
  markAllNotificationsRead() {
    return request('/admin/notification/read-all', { method: 'PUT' })
  }
}

// SSE 全局实例
let eventSource = null
let reconnectTimer = null
let reconnectAttempts = 0
let sseCallbacks = null

// SSE 重连配置
const SSE_RECONNECT_DELAY = 1000      // 初始重连延迟 1 秒
const SSE_MAX_DELAY = 30000            // 最大重连延迟 30 秒
const SSE_MAX_ATTEMPTS = 10            // 最大重连次数

export function connectSSE(onMessage, onGroupMessage, onEventUpdate, onEventStatusChanged, onNewRegistration, onRegistrationResult, onBroadcast) {
  // 保存回调函数引用，用于重连
  sseCallbacks = {
    onMessage,
    onGroupMessage,
    onEventUpdate,
    onEventStatusChanged,
    onNewRegistration,
    onRegistrationResult,
    onBroadcast
  }

  // 如果已存在连接，先断开
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }

  const token = localStorage.getItem('token')
  if (!token) return null

  // 清除之前的重连定时器
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  try {
    console.log('SSE connecting...')
    eventSource = new EventSource(`/api/sse/connect?token=${encodeURIComponent(token)}`)

    // 连接打开，重置重连计数
    eventSource.onopen = () => {
      console.log('SSE connected')
      reconnectAttempts = 0
    }

    eventSource.onerror = () => {
      console.warn('SSE connection error, will retry...')
      scheduleReconnect()
    }

    // 绑定所有事件监听
    bindSSEListeners()

  } catch (e) {
    console.warn('SSE connection exception:', e)
    scheduleReconnect()
    return null
  }

  return eventSource
}

function bindSSEListeners() {
  if (!eventSource || !sseCallbacks) return

  const { onMessage, onGroupMessage, onEventUpdate, onEventStatusChanged, onNewRegistration, onRegistrationResult, onBroadcast } = sseCallbacks

  eventSource.addEventListener('newMessage', (e) => {
    try {
      onMessage(JSON.parse(e.data))
    } catch (err) {
      console.error('SSE newMessage parse error:', err)
    }
  })

  eventSource.addEventListener('newGroupMessage', (e) => {
    try {
      onGroupMessage(JSON.parse(e.data))
    } catch (err) {
      console.error('SSE newGroupMessage parse error:', err)
    }
  })

  eventSource.addEventListener('eventUpdate', (e) => {
    try {
      onEventUpdate(JSON.parse(e.data))
    } catch (err) {
      console.error('SSE eventUpdate parse error:', err)
    }
  })

  eventSource.addEventListener('eventStatusChanged', (e) => {
    try {
      onEventStatusChanged(JSON.parse(e.data))
    } catch (err) {
      console.error('SSE eventStatusChanged parse error:', err)
    }
  })

  eventSource.addEventListener('newRegistration', (e) => {
    try {
      onNewRegistration(JSON.parse(e.data))
    } catch (err) {
      console.error('SSE newRegistration parse error:', err)
    }
  })

  eventSource.addEventListener('registrationResult', (e) => {
    try {
      onRegistrationResult(JSON.parse(e.data))
    } catch (err) {
      console.error('SSE registrationResult parse error:', err)
    }
  })

  eventSource.addEventListener('broadcast', (e) => {
    try {
      console.log('SSE broadcast:', e.data)
      if (onBroadcast) {
        onBroadcast(JSON.parse(e.data))
      }
    } catch (err) {
      console.error('SSE broadcast parse error:', err)
    }
  })
}

function scheduleReconnect() {
  // 超过最大重连次数，停止重连
  if (reconnectAttempts >= SSE_MAX_ATTEMPTS) {
    console.warn('SSE max reconnect attempts reached, stopping...')
    disconnectSSE()
    return
  }

  // 计算延迟时间（指数退避）
  const delay = Math.min(
    SSE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts),
    SSE_MAX_DELAY
  )

  console.log(`SSE reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${SSE_MAX_ATTEMPTS})`)

  reconnectTimer = setTimeout(() => {
    reconnectAttempts++
    if (sseCallbacks) {
      connectSSE(
        sseCallbacks.onMessage,
        sseCallbacks.onGroupMessage,
        sseCallbacks.onEventUpdate,
        sseCallbacks.onEventStatusChanged,
        sseCallbacks.onNewRegistration,
        sseCallbacks.onRegistrationResult,
        sseCallbacks.onBroadcast
      )
    }
  }, delay)
}

export function disconnectSSE() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  reconnectAttempts = 0
  sseCallbacks = null

  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}

import { ref } from 'vue'

const currentUser = ref(getUserFromStorage())

function getUserFromStorage() {
  const data = localStorage.getItem('user')
  return data ? JSON.parse(data) : null
}

export function getUser() {
  return currentUser.value
}

export function useUser() {
  return currentUser
}

export function setAuth(token, user) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  currentUser.value = user
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  currentUser.value = null
}

export async function getAvatarUrl(avatar) {
  // 后端返回的 avatar 已是完整 URL，可直接访问
  return avatar || null
}
