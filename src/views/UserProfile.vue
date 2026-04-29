<template>
  <div class="profile-page">
    <div class="profile-hero" v-if="userInfo">
      <div class="profile-hero-bg">
        <div class="hero-shape hero-shape-1"></div>
        <div class="hero-shape hero-shape-2"></div>
      </div>
      <div class="profile-hero-content">
        <div class="profile-avatar-wrapper">
          <img :src="displayAvatar" class="profile-avatar" alt="用户头像" />
          <div class="profile-avatar-ring"></div>
        </div>
        <div class="profile-info">
          <h1 class="profile-name">{{ userInfo.nickname }}</h1>
          <p class="profile-bio">{{ userInfo.bio || '这个用户还没有填写个人简介' }}</p>
          <div class="profile-meta">
            <span class="profile-join">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {{ formatDate(userInfo.createdAt) }} 加入
            </span>
          </div>
        </div>
        <div class="profile-actions">
          <router-link v-if="isSelf" to="/edit-profile" class="btn-edit">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            编辑资料
          </router-link>
          <div v-else-if="user" class="action-buttons">
            <button class="btn-follow" :class="{ 'btn-following': isFollowing }" @click="toggleFollow">
              <svg v-if="!isFollowing" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 24v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {{ isFollowing ? '已关注' : '关注' }}
            </button>
            <router-link v-if="userInfo" :to="`/chat/${userInfo.id}`" class="btn-message">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              发私信
            </router-link>
          </div>
        </div>
      </div>
      <div class="profile-stats">
        <router-link :to="`/user/${route.params.id}?tab=posts`" class="stat-item">
          <span class="stat-value">{{ stats?.postCount || posts.length }}</span>
          <span class="stat-label">帖子</span>
        </router-link>
        <router-link :to="`/user/${route.params.id}?tab=following`" class="stat-item">
          <span class="stat-value">{{ stats?.followCount || 0 }}</span>
          <span class="stat-label">关注</span>
        </router-link>
        <router-link :to="`/user/${route.params.id}?tab=followers`" class="stat-item">
          <span class="stat-value">{{ stats?.followerCount || 0 }}</span>
          <span class="stat-label">粉丝</span>
        </router-link>
        <router-link v-if="!isSelf" :to="`/user/${route.params.id}?tab=friends`" class="stat-item">
          <span class="stat-value">{{ stats?.friendCount || 0 }}</span>
          <span class="stat-label">互关</span>
        </router-link>
      </div>
    </div>

    <div class="profile-container" v-if="userInfo">
      <div class="profile-main">
        <div class="profile-tabs">
          <button
            v-for="tab in visibleTabs"
            :key="tab.key"
            class="tab-btn"
            :class="{ 'tab-btn-active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <component :is="tab.icon" />
            {{ tab.label }}
          </button>
        </div>

        <div class="profile-content">
          <template v-if="activeTab === 'posts'">
            <div v-if="postsLoading" class="loading-state">
              <div class="spinner spinner-lg"></div>
              <span>加载中...</span>
            </div>
            <div v-else-if="posts.length === 0" class="empty-state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <p>暂无帖子</p>
            </div>
            <div v-else class="post-list">
              <router-link v-for="(p, index) in posts" :key="p.postId" :to="`/post/${p.postId}`" class="post-card animate-fade-in-up" :style="{ animationDelay: `${index * 50}ms` }">
                <div class="post-content">
                  <h3 class="post-title">{{ p.title }}</h3>
                  <div class="post-meta">
                    <span class="meta-board">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                      {{ p.board?.name || '未分类' }}
                    </span>
                    <span class="meta-dot"></span>
                    <span class="meta-time">{{ formatDate(p.createdAt) }}</span>
                  </div>
                </div>
                <div class="post-arrow">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </router-link>
            </div>
          </template>

          <template v-else-if="activeTab === 'following'">
            <div v-if="followingLoading" class="loading-state">
              <div class="spinner spinner-lg"></div>
              <span>加载中...</span>
            </div>
            <div v-else-if="followingList.length === 0" class="empty-state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <p>暂无关注</p>
            </div>
            <div v-else class="user-list">
              <router-link v-for="(u, index) in followingList" :key="u.id" :to="`/user/${u.id}`" class="user-card animate-fade-in-up" :style="{ animationDelay: `${index * 50}ms` }">
                <img :src="u.processedAvatar || defaultAvatar" class="user-avatar" alt="头像" />
                <div class="user-info">
                  <span class="user-name">{{ u.nickname }}</span>
                  <span class="user-bio">{{ u.bio || '暂无简介' }}</span>
                </div>
                <div class="user-arrow">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </router-link>
            </div>
            <div v-if="totalFollowingPages > 1" class="pagination">
              <button class="page-btn" :disabled="followingPage <= 0" @click="loadFollowing(followingPage - 1)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                上一页
              </button>
              <span class="page-info">{{ followingPage + 1 }} / {{ totalFollowingPages }}</span>
              <button class="page-btn" :disabled="followingPage >= totalFollowingPages - 1" @click="loadFollowing(followingPage + 1)">
                下一页
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </template>

          <template v-else-if="activeTab === 'followers'">
            <div v-if="followersLoading" class="loading-state">
              <div class="spinner spinner-lg"></div>
              <span>加载中...</span>
            </div>
            <div v-else-if="followersList.length === 0" class="empty-state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <p>暂无粉丝</p>
            </div>
            <div v-else class="user-list">
              <router-link v-for="(u, index) in followersList" :key="u.id" :to="`/user/${u.id}`" class="user-card animate-fade-in-up" :style="{ animationDelay: `${index * 50}ms` }">
                <img :src="u.processedAvatar || defaultAvatar" class="user-avatar" alt="头像" />
                <div class="user-info">
                  <span class="user-name">{{ u.nickname }}</span>
                  <span class="user-bio">{{ u.bio || '暂无简介' }}</span>
                </div>
                <div class="user-arrow">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </router-link>
            </div>
            <div v-if="totalFollowersPages > 1" class="pagination">
              <button class="page-btn" :disabled="followersPage <= 0" @click="loadFollowers(followersPage - 1)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                上一页
              </button>
              <span class="page-info">{{ followersPage + 1 }} / {{ totalFollowersPages }}</span>
              <button class="page-btn" :disabled="followersPage >= totalFollowersPages - 1" @click="loadFollowers(followersPage + 1)">
                下一页
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </template>

          <template v-else-if="activeTab === 'friends'">
            <div v-if="friendsLoading" class="loading-state">
              <div class="spinner spinner-lg"></div>
              <span>加载中...</span>
            </div>
            <div v-else-if="friendsList.length === 0" class="empty-state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <p>暂无互关好友</p>
            </div>
            <div v-else class="user-list">
              <router-link v-for="(u, index) in friendsList" :key="u.id" :to="`/user/${u.id}`" class="user-card animate-fade-in-up" :style="{ animationDelay: `${index * 50}ms` }">
                <img :src="u.processedAvatar || defaultAvatar" class="user-avatar" alt="头像" />
                <div class="user-info">
                  <span class="user-name">{{ u.nickname }}</span>
                  <span class="user-bio">{{ u.bio || '暂无简介' }}</span>
                </div>
                <div class="user-arrow">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </router-link>
            </div>
            <div v-if="totalFriendsPages > 1" class="pagination">
              <button class="page-btn" :disabled="friendsPage <= 0" @click="loadFriends(friendsPage - 1)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                上一页
              </button>
              <span class="page-info">{{ friendsPage + 1 }} / {{ totalFriendsPages }}</span>
              <button class="page-btn" :disabled="friendsPage >= totalFriendsPages - 1" @click="loadFriends(friendsPage + 1)">
                下一页
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </template>

          <template v-else-if="activeTab === 'feed'">
            <div v-if="feedLoading" class="loading-state">
              <div class="spinner spinner-lg"></div>
              <span>加载中...</span>
            </div>
            <div v-else-if="feedList.length === 0" class="empty-state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 11a9 9 0 0 1 9 9"/>
                <path d="M4 4a16 16 0 0 1 16 16"/>
                <circle cx="5" cy="19" r="1"/>
              </svg>
              <p>暂无动态</p>
            </div>
            <div v-else class="post-list">
              <router-link v-for="(f, index) in feedList" :key="f.postId" :to="`/post/${f.postId || f.id}`" class="post-card animate-fade-in-up" :style="{ animationDelay: `${index * 50}ms` }">
                <div class="post-content">
                  <h3 class="post-title">{{ f.title }}</h3>
                  <div class="post-meta">
                    <span class="meta-author">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      {{ f.user?.nickname || '' }}
                    </span>
                    <span class="meta-dot"></span>
                    <span class="meta-time">{{ formatDate(f.createdAt) }}</span>
                  </div>
                </div>
                <div class="post-arrow">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </router-link>
            </div>
          </template>

          <template v-else-if="activeTab === 'favorites'">
            <div v-if="favoritesLoading" class="loading-state">
              <div class="spinner spinner-lg"></div>
              <span>加载中...</span>
            </div>
            <div v-else-if="favorites.length === 0" class="empty-state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <p>暂无收藏</p>
            </div>
            <div v-else class="post-list">
              <router-link v-for="(p, index) in favorites" :key="p.postId || p.id" :to="`/post/${p.postId || p.id}`" class="post-card animate-fade-in-up" :style="{ animationDelay: `${index * 50}ms` }">
                <div class="post-content">
                  <h3 class="post-title">{{ p.title }}</h3>
                  <div class="post-meta">
                    <span class="meta-board">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                      {{ p.board?.name || '未分类' }}
                    </span>
                    <span class="meta-dot"></span>
                    <span class="meta-time">{{ formatDate(p.createdAt) }}</span>
                  </div>
                </div>
                <div class="post-arrow">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </router-link>
            </div>
            <div v-if="totalFavoritePages > 1" class="pagination">
              <button class="page-btn" :disabled="favoritePage <= 0" @click="loadFavorites(favoritePage - 1)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                上一页
              </button>
              <span class="page-info">{{ favoritePage + 1 }} / {{ totalFavoritePages }}</span>
              <button class="page-btn" :disabled="favoritePage >= totalFavoritePages - 1" @click="loadFavorites(favoritePage + 1)">
                下一页
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </template>
        </div>
      </div>

      <div class="profile-sidebar">
        <div class="sidebar-card">
          <div class="sidebar-header">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            快捷导航
          </div>
          <div class="sidebar-body">
            <router-link :to="`/user/${route.params.id}`" class="sidebar-link" :class="{ 'sidebar-link-active': activeTab === 'posts' }">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              我的帖子
            </router-link>
            <router-link :to="`/user/${route.params.id}?tab=favorites`" class="sidebar-link" :class="{ 'sidebar-link-active': activeTab === 'favorites' }">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              我的收藏
            </router-link>
            <router-link :to="`/user/${route.params.id}?tab=following`" class="sidebar-link" :class="{ 'sidebar-link-active': activeTab === 'following' }">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              我的关注
            </router-link>
            <router-link :to="`/user/${route.params.id}?tab=followers`" class="sidebar-link" :class="{ 'sidebar-link-active': activeTab === 'followers' }">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="10" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              我的粉丝
            </router-link>
          </div>
        </div>

        <div class="sidebar-card" v-if="isSelf">
          <div class="sidebar-header">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            操作
          </div>
          <div class="sidebar-body">
            <router-link to="/edit-profile" class="sidebar-action">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              编辑个人资料
            </router-link>
            <router-link to="/create-post" class="sidebar-action sidebar-action-primary">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              发布新帖子
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-page">
      <div class="spinner spinner-lg"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="!userInfo" class="empty-page">
      <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>用户不存在</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, h } from 'vue'
import { useRoute } from 'vue-router'
import { user as userApi, follow as followApi, getUser, getAvatarUrl, DEFAULT_AVATAR } from '@/api'
import { toastBus } from '@/utils/toast'

const route = useRoute()
const userInfo = ref(null)
const loading = ref(true)
const user = getUser()
const defaultAvatar = DEFAULT_AVATAR
const activeTab = ref('posts')
const posts = ref([])
const postsLoading = ref(false)
const favorites = ref([])
const favoritesLoading = ref(false)
const favoritePage = ref(0)
const totalFavoritePages = ref(0)
const displayAvatar = ref('')

const stats = ref(null)
const isFollowing = ref(false)
const followLoading = ref(false)
const followingList = ref([])
const followingLoading = ref(false)
const followingPage = ref(0)
const totalFollowingPages = ref(0)
const followersList = ref([])
const followersLoading = ref(false)
const followersPage = ref(0)
const totalFollowersPages = ref(0)
const friendsList = ref([])
const friendsLoading = ref(false)
const friendsPage = ref(0)
const totalFriendsPages = ref(0)
const feedList = ref([])
const feedLoading = ref(false)

const isSelf = computed(() => user && user.id == route.params.id)

const IconPosts = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      h('polyline', { points: '14 2 14 8 20 8' })
    ])
  }
}

const IconFavorites = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' })
    ])
  }
}

const IconFollowing = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
      h('circle', { cx: 9, cy: 7, r: 4 }),
      h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
      h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
    ])
  }
}

const IconFollowers = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
      h('circle', { cx: 10, cy: 7, r: 4 }),
      h('line', { x1: 19, y1: 8, x2: 19, y2: 14 }),
      h('line', { x1: 22, y1: 11, x2: 16, y2: 11 })
    ])
  }
}

const IconFriends = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
      h('circle', { cx: 9, cy: 7, r: 4 }),
      h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
      h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
    ])
  }
}

const IconFeed = {
  render() {
    return h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M4 11a9 9 0 0 1 9 9' }),
      h('path', { d: 'M4 4a16 16 0 0 1 16 16' }),
      h('circle', { cx: 5, cy: 19, r: 1 })
    ])
  }
}

const tabs = [
  { key: 'posts', label: '帖子', icon: IconPosts },
  { key: 'favorites', label: '收藏', icon: IconFavorites },
  { key: 'following', label: '关注', icon: IconFollowing },
  { key: 'followers', label: '粉丝', icon: IconFollowers },
  { key: 'friends', label: '互关', icon: IconFriends },
  { key: 'feed', label: '动态', icon: IconFeed }
]

const visibleTabs = computed(() => {
  if (isSelf.value) {
    return tabs
  }
  return tabs.filter(t => t.key !== 'favorites' && t.key !== 'feed')
})

function formatDate(d) {
  return new Date(d).toLocaleDateString('zh-CN')
}

async function loadUserInfo() {
  loading.value = true
  try {
    const res = await userApi.getInfo(route.params.id)
    userInfo.value = res.data
    if (res.data.avatar) {
      displayAvatar.value = (await getAvatarUrl(res.data.avatar)) || defaultAvatar
    } else {
      displayAvatar.value = defaultAvatar
    }
    loadStats()
    if (!isSelf.value && user) {
      loadFollowStatus()
    }
  } catch (e) {
    console.error(e)
    userInfo.value = null
  } finally {
    loading.value = false
  }
}

async function loadPosts() {
  postsLoading.value = true
  try {
    const res = await userApi.getPosts(route.params.id)
    posts.value = res.data?.content || []
  } catch (e) {
    console.error(e)
    posts.value = []
  } finally {
    postsLoading.value = false
  }
}

async function loadStats() {
  try {
    const res = await userApi.getStats(route.params.id)
    stats.value = res.data
  } catch (e) {
    console.error(e)
    stats.value = null
  }
}

async function loadFollowStatus() {
  try {
    const res = await followApi.getFollowStatus(route.params.id)
    isFollowing.value = res.data?.following || false
  } catch (e) {
    console.error(e)
    isFollowing.value = false
  }
}

async function toggleFollow() {
  if (!user) {
    toastBus.warning('请先登录')
    return
  }
  followLoading.value = true
  try {
    if (isFollowing.value) {
      await followApi.unfollow(route.params.id)
      isFollowing.value = false
    } else {
      await followApi.follow(route.params.id)
      isFollowing.value = true
    }
    loadStats()
  } catch (e) {
    toastBus.error(e.message)
  } finally {
    followLoading.value = false
  }
}

async function loadFavorites(p = 0) {
  favoritesLoading.value = true
  try {
    const res = await userApi.getFavorites(route.params.id, p)
    favorites.value = res.data.content
    totalFavoritePages.value = res.data.totalPages
    favoritePage.value = p
  } catch (e) {
    console.error(e)
  } finally {
    favoritesLoading.value = false
  }
}

async function loadFollowing(p = 0) {
  followingLoading.value = true
  try {
    const res = await followApi.getFollowing(route.params.id, p)
    followingList.value = res.data.content || []
    totalFollowingPages.value = res.data.totalPages || 0
    followingPage.value = p
    for (const u of followingList.value) {
      if (u.avatar) {
        u.processedAvatar = await getAvatarUrl(u.avatar) || defaultAvatar
      } else {
        u.processedAvatar = defaultAvatar
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    followingLoading.value = false
  }
}

async function loadFollowers(p = 0) {
  followersLoading.value = true
  try {
    const res = await followApi.getFollowers(route.params.id, p)
    followersList.value = res.data.content || []
    totalFollowersPages.value = res.data.totalPages || 0
    followersPage.value = p
    for (const u of followersList.value) {
      if (u.avatar) {
        u.processedAvatar = await getAvatarUrl(u.avatar) || defaultAvatar
      } else {
        u.processedAvatar = defaultAvatar
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    followersLoading.value = false
  }
}

async function loadFriends(p = 0) {
  friendsLoading.value = true
  try {
    const res = await followApi.getFriends(route.params.id, p)
    friendsList.value = res.data.content || []
    totalFriendsPages.value = res.data.totalPages || 0
    friendsPage.value = p
    for (const u of friendsList.value) {
      if (u.avatar) {
        u.processedAvatar = await getAvatarUrl(u.avatar) || defaultAvatar
      } else {
        u.processedAvatar = defaultAvatar
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    friendsLoading.value = false
  }
}

async function loadFeed() {
  feedLoading.value = true
  try {
    const res = await userApi.getFeed(route.params.id)
    feedList.value = res.data.content || []
  } catch (e) {
    console.error(e)
  } finally {
    feedLoading.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'posts' && posts.value.length === 0) {
    loadPosts()
  } else if (tab === 'favorites' && favorites.value.length === 0) {
    loadFavorites()
  } else if (tab === 'following' && followingList.value.length === 0) {
    loadFollowing()
  } else if (tab === 'followers' && followersList.value.length === 0) {
    loadFollowers()
  } else if (tab === 'friends' && friendsList.value.length === 0) {
    loadFriends()
  } else if (tab === 'feed' && feedList.value.length === 0) {
    loadFeed()
  }
})

watch(
  () => route.query.tab,
  (tab) => {
    if (tab === 'posts') {
      activeTab.value = 'posts'
      loadPosts()
    } else if (tab === 'favorites') {
      activeTab.value = 'favorites'
      loadFavorites()
    } else if (tab === 'following') {
      activeTab.value = 'following'
      loadFollowing()
    } else if (tab === 'followers') {
      activeTab.value = 'followers'
      loadFollowers()
    } else if (tab === 'friends') {
      activeTab.value = 'friends'
      loadFriends()
    } else if (tab === 'feed') {
      activeTab.value = 'feed'
      loadFeed()
    } else {
      activeTab.value = 'posts'
      loadPosts()
    }
  },
  { immediate: true }
)

watch(
  () => route.params.id,
  () => {
    posts.value = []
    favorites.value = []
    followingList.value = []
    followersList.value = []
    friendsList.value = []
    feedList.value = []
    stats.value = null
    isFollowing.value = false
    loadUserInfo()
    loadPosts()
  }
)

onMounted(() => {
  loadUserInfo()
  loadPosts()
})
</script>

<style scoped>
.profile-page {
  min-height: calc(100vh - 72px);
}

.profile-hero {
  background: var(--color-primary-gradient);
  padding: var(--space-2xl) var(--space-lg);
  position: relative;
  overflow: hidden;
}

.profile-hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-shape {
  position: absolute;
  border-radius: var(--radius-full);
  filter: blur(60px);
  opacity: 0.3;
}

.hero-shape-1 {
  width: 300px;
  height: 300px;
  background: white;
  top: -100px;
  right: 10%;
}

.hero-shape-2 {
  width: 200px;
  height: 200px;
  background: white;
  bottom: -50px;
  left: 5%;
}

.profile-hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  position: relative;
}

.profile-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 4px solid white;
  box-shadow: var(--shadow-lg);
}

.profile-avatar-ring {
  position: absolute;
  inset: -6px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-full);
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: white;
  margin-bottom: var(--space-1);
}

.profile-bio {
  font-size: var(--text-base);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: var(--space-2);
  line-height: 1.5;
}

.profile-meta {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.profile-join {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.75);
}

.profile-actions {
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: var(--space-sm);
}

.btn-edit {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-lg);
  background: white;
  color: var(--color-primary);
  border-radius: var(--radius-lg);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 600;
  transition: all var(--transition-fast);
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  text-decoration: none;
}

.btn-follow {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-lg);
  background: white;
  color: var(--color-primary);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.btn-follow:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-following {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.btn-following:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-message {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-lg);
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  white-space: nowrap;
}

.btn-message:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  background: rgba(255, 255, 255, 0.25);
  text-decoration: none;
}

.profile-stats {
  max-width: 1200px;
  margin: var(--space-lg) auto 0;
  display: flex;
  justify-content: center;
  gap: var(--space-2xl);
  position: relative;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.1);
  text-decoration: none;
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.75);
  margin-top: var(--space-1);
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);
  display: flex;
  gap: var(--space-lg);
}

.profile-main {
  flex: 1;
  min-width: 0;
}

.profile-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.profile-tabs {
  display: flex;
  gap: var(--space-2);
  background: var(--color-card);
  padding: var(--space-3);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-md);
  background: transparent;
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  background: var(--color-bg-soft);
  color: var(--color-text);
}

.tab-btn-active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.profile-content {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  padding: var(--space-lg);
  min-height: 300px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
}

.loading-state span,
.empty-state p {
  margin-top: var(--space-md);
  font-size: var(--text-sm);
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.post-card {
  display: flex;
  align-items: center;
  padding: var(--space-lg);
  background: var(--color-bg-soft);
  border-radius: var(--radius-lg);
  text-decoration: none;
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-fast);
}

.post-card:hover {
  background: var(--color-card);
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-sm);
  transform: translateX(4px);
  text-decoration: none;
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.post-meta {
  display: flex;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.meta-board,
.meta-author {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.meta-dot {
  width: 4px;
  height: 4px;
  background: var(--color-text-muted);
  border-radius: var(--radius-full);
  margin: 0 var(--space-2);
}

.post-arrow {
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.post-card:hover .post-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.user-card {
  display: flex;
  align-items: center;
  padding: var(--space-md);
  background: var(--color-bg-soft);
  border-radius: var(--radius-lg);
  text-decoration: none;
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-fast);
}

.user-card:hover {
  background: var(--color-card);
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-sm);
  text-decoration: none;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  object-fit: cover;
  margin-right: var(--space-md);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: block;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
}

.user-bio {
  display: block;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-arrow {
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
}

.user-card:hover .user-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
}

.page-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-md);
  background: var(--color-bg-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled) {
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
  padding: var(--space-2) var(--space-md);
}

.sidebar-card {
  background: var(--color-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  overflow: hidden;
  margin-bottom: var(--space-md);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-md) var(--space-lg);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-bg-soft);
}

.sidebar-header svg {
  color: var(--color-primary);
}

.sidebar-body {
  padding: var(--space-md);
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
}

.sidebar-link:hover {
  background: var(--color-bg-soft);
  color: var(--color-text);
  text-decoration: none;
}

.sidebar-link-active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.sidebar-action {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  transition: all var(--transition-fast);
  margin-bottom: var(--space-2);
}

.sidebar-action:hover {
  background: var(--color-bg-soft);
  color: var(--color-text);
  text-decoration: none;
}

.sidebar-action-primary {
  background: var(--color-primary-gradient);
  color: white;
}

.sidebar-action-primary:hover {
  box-shadow: var(--shadow-primary);
  transform: translateY(-2px);
  color: white;
}

.loading-page,
.empty-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--color-text-muted);
}

.loading-page span,
.empty-page p {
  margin-top: var(--space-md);
  font-size: var(--text-base);
}

@media (max-width: 900px) {
  .profile-container {
    flex-direction: column;
  }

  .profile-sidebar {
    width: 100%;
  }

  .profile-hero-content {
    flex-wrap: wrap;
    text-align: center;
  }

  .profile-info {
    text-align: center;
  }

  .profile-actions {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .profile-stats {
    gap: var(--space-lg);
  }
}
</style>
