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

// SSE 全局实例
let eventSource = null

export function connectSSE(onMessage, onGroupMessage) {
  if (eventSource) {
    eventSource.close()
  }
  const token = localStorage.getItem('token')
  if (!token) return null

  eventSource = new EventSource(`/api/sse/connect?token=${encodeURIComponent(token)}`)

  eventSource.addEventListener('newMessage', (e) => {
    try {
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

  return eventSource
}

export function disconnectSSE() {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}

export function getUser() {
  const data = localStorage.getItem('user')
  return data ? JSON.parse(data) : null
}

export function setAuth(token, user) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export async function getAvatarUrl(avatar) {
  // 后端返回的 avatar 已是完整 URL，可直接访问
  return avatar || null
}
