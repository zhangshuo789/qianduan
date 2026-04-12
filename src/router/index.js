import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Board from '@/views/Board.vue'
import PostDetail from '@/views/PostDetail.vue'
import CreatePost from '@/views/CreatePost.vue'
import UserProfile from '@/views/UserProfile.vue'
import EditProfile from '@/views/EditProfile.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/board/:id', name: 'Board', component: Board },
  { path: '/post/:id', name: 'PostDetail', component: PostDetail },
  { path: '/create-post', name: 'CreatePost', component: CreatePost },
  { path: '/edit-post/:id', name: 'EditPost', component: CreatePost },
  { path: '/user/:id', name: 'UserProfile', component: UserProfile },
  { path: '/edit-profile', name: 'EditProfile', component: EditProfile }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
