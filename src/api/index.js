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

// SSE 全局实例
let eventSource = null

export function connectSSE(onMessage, onGroupMessage) {
  if (eventSource) {
    eventSource.close()
  }
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    // EventSource 不支持 Header，只能用 Query 参数
    console.log('SSE connecting to:', `http://localhost:8080/api/sse/connect?token=${encodeURIComponent(token)}`)
    eventSource = new EventSource(`http://localhost:8080/api/sse/connect?token=${encodeURIComponent(token)}`)

    eventSource.onerror = () => {
      // SSE 连接失败时静默关闭，避免持续报错
      console.warn('SSE 连接失败，已断开')
      disconnectSSE()
    }

    eventSource.addEventListener('newMessage', (e) => {
      try {
        console.log('SSE received newMessage:', e.data)
        onMessage(JSON.parse(e.data))
      } catch (err) {
        console.error('SSE message parse error:', err)
      }
    })

    eventSource.addEventListener('newGroupMessage', (e) => {
      try {
        onGroupMessage(JSON.parse(e.data))
      } catch (err) {
        console.error('SSE group message parse error:', err)
      }
    })
  } catch (e) {
    console.warn('SSE 连接异常:', e)
    return null
  }

  return eventSource
}

export function disconnectSSE() {
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
