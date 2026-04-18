# 前端部署配置说明

## 环境变量配置

前端使用 `.env` 文件管理不同环境的配置。

### 文件说明

| 文件 | 用途 | 是否提交到 git |
|------|------|---------------|
| `.env.example` | 配置模板 | 是 |
| `.env.development.local` | 本地开发环境 | 否（已在 .gitignore）|
| `.env.production` | 生产环境配置 | 是 |

### 配置项说明

```bash
# API 配置
VITE_API_BASE_URL=http://localhost:8080    # 后端 API 地址
VITE_API_PREFIX=/api                        # API 前缀

# 文件服务配置
VITE_FILE_BASE_URL=http://localhost:8080   # 文件服务地址
VITE_FILE_UPLOAD_PATH=/api/file/upload     # 文件上传路径
VITE_FILE_DOWNLOAD_PATH=/api/file/download  # 文件下载路径

# SSE 配置
VITE_SSE_URL=http://localhost:8080         # SSE 服务地址
```

## 本地开发

```bash
npm install
npm run dev
```

## Docker 部署

### 1. 构建生产版本

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 2. Docker 部署方式

#### 方式一：Nginx 部署

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

#### 方式二：独立容器

```bash
# 构建镜像
docker build -t volleyball-frontend .

# 运行容器
docker run -d -p 80:80 --name volleyball-frontend volleyball-frontend
```

### 3. 生产环境配置

在服务器上创建 `.env.production.local` 文件：

```bash
# 后端 API 地址（根据实际服务器配置）
VITE_API_BASE_URL=http://your-server-ip:8080

# 文件服务地址
VITE_FILE_BASE_URL=http://your-server-ip:8080
VITE_SSE_URL=http://your-server-ip:8080
```

重新构建：
```bash
npm run build
```

## 后端文件存储说明

后端 JAR 包部署时，文件存储在 JAR 包外部：

```
/path/to/app.jar
/data/files/           # 上传的文件
  /avatars/
  /posts/
  /events/
```

确保 Docker 容器将 `/app/data/files` 映射到宿主机的实际存储路径。

## 常用命令

```bash
# 开发环境启动
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 仅检查代码
npm run lint
```
