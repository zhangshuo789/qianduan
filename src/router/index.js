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
import Events from '@/views/Events.vue'
import EventDetail from '@/views/EventDetail.vue'
import MySubscriptions from '@/views/MySubscriptions.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import AdminUsers from '@/views/AdminUsers.vue'
import AdminReports from '@/views/AdminReports.vue'
import AdminEvents from '@/views/AdminEvents.vue'
import AdminGroups from '@/views/AdminGroups.vue'
import AdminSettings from '@/views/AdminSettings.vue'

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
  { path: '/group/:id', name: 'GroupChat', component: GroupChat },
  { path: '/events', name: 'Events', component: Events },
  { path: '/event/:id', name: 'EventDetail', component: EventDetail },
  { path: '/my-subscriptions', name: 'MySubscriptions', component: MySubscriptions },
  {
    path: '/admin',
    component: AdminDashboard,
    children: [
      { path: '', redirect: '/admin/overview' },
      { path: 'overview', name: 'AdminOverview', component: AdminDashboard },
      { path: 'users', name: 'AdminUsers', component: AdminUsers },
      { path: 'reports', name: 'AdminReports', component: AdminReports },
      { path: 'events', name: 'AdminEvents', component: AdminEvents },
      { path: 'groups', name: 'AdminGroups', component: AdminGroups },
      { path: 'settings', name: 'AdminSettings', component: AdminSettings }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
