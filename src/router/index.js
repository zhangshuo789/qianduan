import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Board from '@/views/Board.vue'
import PostDetail from '@/views/PostDetail.vue'
import CreatePost from '@/views/CreatePost.vue'
import UserProfile from '@/views/UserProfile.vue'
import EditProfile from '@/views/EditProfile.vue'
import Messages from '@/views/Messages.vue'
import Chat from '@/views/Chat.vue'
import Groups from '@/views/Groups.vue'
import GroupChat from '@/views/GroupChat.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/board/:id', name: 'Board', component: Board },
  { path: '/post/:id', name: 'PostDetail', component: PostDetail },
  { path: '/create-post', name: 'CreatePost', component: CreatePost },
  { path: '/edit-post/:id', name: 'EditPost', component: CreatePost },
  { path: '/user/:id', name: 'UserProfile', component: UserProfile },
  { path: '/edit-profile', name: 'EditProfile', component: EditProfile },
  { path: '/messages', name: 'Messages', component: Messages },
  { path: '/chat/:userId', name: 'Chat', component: Chat },
  { path: '/groups', name: 'Groups', component: Groups },
  { path: '/group/:id', name: 'GroupChat', component: GroupChat }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
