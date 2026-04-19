/**
 * 赛事通知存储
 * 使用 localStorage 缓存未读通知，用户查看后删除
 */

const STORAGE_KEY = 'event_notifications'

export const notificationStore = {
  /**
   * 获取所有缓存的通知
   */
  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  /**
   * 添加通知到缓存
   */
  add(notification) {
    const list = this.getAll()
    // 添加到开头
    list.unshift({
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString()
    })
    // 最多保留 20 条
    if (list.length > 20) {
      list.splice(20)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    return list
  },

  /**
   * 标记通知为已读
   */
  markAsRead(id) {
    const list = this.getAll()
    const index = list.findIndex(n => n.id === id)
    if (index > -1) {
      list.splice(index, 1)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    }
    return list
  },

  /**
   * 标记所有通知为已读
   */
  markAllAsRead() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    return []
  },

  /**
   * 获取未读数量
   */
  getUnreadCount() {
    return this.getAll().filter(n => !n.read).length
  }
}

export default notificationStore
