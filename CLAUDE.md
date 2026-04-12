# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 + Vite frontend for a volleyball community forum (排球社区). Interfaces with a Spring Boot backend at `localhost:8080`.

## Commands

```sh
npm install          # Install dependencies
npm run dev          # Start dev server with hot reload (http://localhost:5173)
npm run build         # Production build
npm run preview       # Preview production build
```

## Architecture

- **Framework**: Vue 3 (Composition API `<script setup>`)
- **Router**: Vue Router 4
- **Build Tool**: Vite 5
- **Path Alias**: `@/` maps to `src/`
- **API Proxy**: `/api` proxied to `http://localhost:8080`

### Pages (src/views/)

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Board list |
| Login | `/login` | User login |
| Register | `/register` | User registration |
| Board | `/board/:id` | Posts in a board |
| PostDetail | `/post/:id` | View/edit/delete post, like, favorite, comment |
| CreatePost | `/create-post` | Create new post |
| EditPost | `/edit-post/:id` | Edit existing post |
| UserProfile | `/user/:id` | User profile with posts and favorites |
| EditProfile | `/edit-profile` | Edit user profile |

### Components (src/components/)

| Component | Description |
|-----------|-------------|
| NavBar | Top navigation bar with search, user menu |

### API Service (src/api/index.js)

- `auth.register/login` — authentication
- `user.getInfo/update/getFavorites` — user profile and favorites
- `board.list/getPosts` — boards and posts
- `post.create/getDetail/update/delete/like/unlike/favorite/unfavorite/getComments/addComment` — post CRUD and interactions
- `comment.delete` — delete comment

### Authentication

Token stored in `localStorage` as `token`. Sent via `Authorization: Bearer <token>` header.

## Configuration Files

- `vite.config.js` — Vite config with Vue plugin, `@` alias, and API proxy
- `jsconfig.json` — Path mapping for IDE autocompletion

## Notes

- Node.js 20.19.0+ or 22.12.0+ required
- No test framework, no state management (Pinia), no CSS framework
- Style: simple solid colors, no gradients
