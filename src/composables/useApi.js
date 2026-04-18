import { toastBus } from '@/utils/toast'
import * as api from '@/api'

async function wrapApi(apiFn, ...args) {
  try {
    const result = await apiFn(...args)
    return result
  } catch (error) {
    const message = error.message || '操作失败'
    toastBus.error(message)
    throw error
  }
}

export function useApi() {
  return {
    // Auth
    register: (data) => wrapApi(api.auth.register, data),
    login: (data) => wrapApi(api.auth.login, data),

    // User
    getUserInfo: (id) => wrapApi(api.user.getInfo, id),
    updateUser: (id, data) => wrapApi(api.user.update, id, data),
    getFavorites: (id, page, size) => wrapApi(api.user.getFavorites, id, page, size),
    getStats: (id) => wrapApi(api.user.getStats, id),
    getFeed: (id, page, size) => wrapApi(api.user.getFeed, id, page, size),
    getPosts: (id, page, size) => wrapApi(api.user.getPosts, id, page, size),

    // Board
    getBoards: () => wrapApi(api.board.list),
    getBoardPosts: (id, page, size) => wrapApi(api.board.getPosts, id, page, size),

    // Post
    createPost: (data) => wrapApi(api.post.create, data),
    getPostDetail: (id) => wrapApi(api.post.getDetail, id),
    updatePost: (id, data) => wrapApi(api.post.update, id, data),
    deletePost: (id) => wrapApi(api.post.delete, id),
    likePost: (id) => wrapApi(api.post.like, id),
    unlikePost: (id) => wrapApi(api.post.unlike, id),
    favoritePost: (id) => wrapApi(api.post.favorite, id),
    unfavoritePost: (id) => wrapApi(api.post.unfavorite, id),
    getComments: (id, page, size) => wrapApi(api.post.getComments, id, page, size),
    addComment: (postId, content, parentId) => wrapApi(api.post.addComment, postId, content, parentId),

    // Comment
    deleteComment: (id) => wrapApi(api.comment.delete, id),

    // Report
    createReport: (data) => wrapApi(api.report.create, data),

    // File
    uploadFile: (formData) => wrapApi(api.file.upload, formData),

    // Follow
    follow: (userId) => wrapApi(api.follow.follow, userId),
    unfollow: (userId) => wrapApi(api.follow.unfollow, userId),
    getFollowStatus: (userId) => wrapApi(api.follow.getFollowStatus, userId),
    getFollowing: (userId, page, size) => wrapApi(api.follow.getFollowing, userId, page, size),
    getFollowers: (userId, page, size) => wrapApi(api.follow.getFollowers, userId, page, size),
    getFriends: (userId, page, size) => wrapApi(api.follow.getFriends, userId, page, size),

    // Message
    getConversations: () => wrapApi(api.message.getConversations),
    getPrivateMessages: (userId, page, size) => wrapApi(api.message.getPrivateMessages, userId, page, size),
    sendPrivateMessage: (userId, content) => wrapApi(api.message.sendPrivateMessage, userId, content),
    markAsRead: (conversationWithUserId) => wrapApi(api.message.markAsRead, conversationWithUserId),
    getUnreadCount: () => wrapApi(api.message.getUnreadCount),

    // Group
    createGroup: (data) => wrapApi(api.group.create, data),
    getGroupInfo: (id) => wrapApi(api.group.getInfo, id),
    getGroupMembers: (id) => wrapApi(api.group.getMembers, id),
    addGroupMember: (groupId, userId) => wrapApi(api.group.addMember, groupId, userId),
    removeGroupMember: (groupId, userId) => wrapApi(api.group.removeMember, groupId, userId),
    leaveGroup: (groupId, userId) => wrapApi(api.group.leave, groupId, userId),
    banGroupMember: (groupId, userId) => wrapApi(api.group.banMember, groupId, userId),
    unbanGroupMember: (groupId, userId) => wrapApi(api.group.unbanMember, groupId, userId),
    getGroupMessages: (groupId, page, size) => wrapApi(api.group.getMessages, groupId, page, size),
    sendGroupMessage: (groupId, content) => wrapApi(api.group.sendMessage, groupId, content),

    // Event
    getEvents: (page, size) => wrapApi(api.event.list, page, size),
    getEventDetail: (id) => wrapApi(api.event.getDetail, id),
    createEvent: (data) => wrapApi(api.event.create, data),
    updateEvent: (id, data) => wrapApi(api.event.update, id, data),
    deleteEvent: (id) => wrapApi(api.event.delete, id),
    subscribeEvent: (id) => wrapApi(api.event.subscribe, id),
    unsubscribeEvent: (id) => wrapApi(api.event.unsubscribe, id),
    registerEvent: (id, data) => wrapApi(api.event.register, id, data),
    getEventRegistrations: (id) => wrapApi(api.event.getRegistrations, id),
    reviewRegistration: (eventId, regId, approved) => wrapApi(api.event.reviewRegistration, eventId, regId, approved),
    getSubscriptions: (userId) => wrapApi(api.event.getSubscriptions, userId),

    // Admin
    getUsers: (params) => wrapApi(api.admin.getUsers, params),
    setUserRole: (userId, roleId) => wrapApi(api.admin.setUserRole, userId, roleId),
    setUserStatus: (userId, disabled, reason) => wrapApi(api.admin.setUserStatus, userId, disabled, reason),
    getReports: (params) => wrapApi(api.admin.getReports, params),
    handleReport: (reportId, approved, result) => wrapApi(api.admin.handleReport, reportId, approved, result),
    getPendingCount: () => wrapApi(api.admin.getPendingCount),
    adminDeletePost: (postId) => wrapApi(api.admin.deletePost, postId),
    adminDeleteComment: (commentId) => wrapApi(api.admin.deleteComment, commentId),
    getAdminEvents: (params) => wrapApi(api.admin.getEvents, params),
    updateEventStatus: (eventId, status) => wrapApi(api.admin.updateEventStatus, eventId, status),
    getEventAdminRegistrations: (eventId) => wrapApi(api.admin.getEventRegistrations, eventId),
    getAdminGroups: (params) => wrapApi(api.admin.getGroups, params),
    changeGroupOwner: (groupId, newOwnerId) => wrapApi(api.admin.changeGroupOwner, groupId, newOwnerId),
    dissolveGroup: (groupId) => wrapApi(api.admin.dissolveGroup, groupId),
    getOverview: () => wrapApi(api.admin.getOverview),
    getUserStats: () => wrapApi(api.admin.getUserStats),
    getContentStats: () => wrapApi(api.admin.getContentStats),
    getAdminBoards: () => wrapApi(api.admin.getBoards),
    createBoard: (data) => wrapApi(api.admin.createBoard, data),
    updateBoard: (id, data) => wrapApi(api.admin.updateBoard, id, data),
    deleteBoard: (id) => wrapApi(api.admin.deleteBoard, id),
    getSensitiveWords: () => wrapApi(api.admin.getSensitiveWords),
    addSensitiveWord: (data) => wrapApi(api.admin.addSensitiveWord, data),
    updateSensitiveWord: (id, data) => wrapApi(api.admin.updateSensitiveWord, id, data),
    deleteSensitiveWord: (id) => wrapApi(api.admin.deleteSensitiveWord, id),
    getLogs: (params) => wrapApi(api.admin.getLogs, params)
  }
}

export { toastBus as toast }
export const toastSuccess = toastBus.success.bind(toastBus)
export const toastError = toastBus.error.bind(toastBus)
export const toastWarning = toastBus.warning.bind(toastBus)
export const toastInfo = toastBus.info.bind(toastBus)
