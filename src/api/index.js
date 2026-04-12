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
