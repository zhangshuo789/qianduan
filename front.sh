#!/bin/bash
# volleyball_deploy.sh
# 部署排球社区前端到 Nginx 容器

set -e

# 配置参数
CONTAINER_NAME="volleyball-frontend"
HOST_PORT="8091"
BACKEND_HOST="121.40.154.188"
BACKEND_PORT="8090"
NGINX_HTML_DIR="/usr/share/nginx/html"
LOCAL_DIST_DIR="./dist"

echo "========================================"
echo "  排球社区前端部署脚本"
echo "========================================"

# 检查构建目录是否存在
if [ ! -d "$LOCAL_DIST_DIR" ]; then
    echo "[提示] 构建目录不存在，开始构建..."
    npm run build
fi

echo ""
echo "步骤 1/5: 停止并删除旧容器..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm -f $CONTAINER_NAME 2>/dev/null || true

echo ""
echo "步骤 2/5: 启动新 Nginx 容器..."
docker run -d -p $HOST_PORT:80 --name $CONTAINER_NAME nginx

echo ""
echo "步骤 3/5: 复制构建文件到容器..."
docker cp $LOCAL_DIST_DIR/. $CONTAINER_NAME:$NGINX_HTML_DIR/

echo ""
echo "步骤 4/5: 写入 Nginx 配置..."
TMP_CONF=$(mktemp)
cat > $TMP_CONF <<EOF
server {
    listen 80;
    server_name localhost;

    root $NGINX_HTML_DIR;
    index index.html;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api/ {
        proxy_pass http://$BACKEND_HOST:$BACKEND_PORT/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # SSE 连接
    location /api/sse/ {
        proxy_pass http://$BACKEND_HOST:$BACKEND_PORT/api/sse/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # SPA 路由支持
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

docker cp $TMP_CONF $CONTAINER_NAME:/etc/nginx/conf.d/default.conf
rm $TMP_CONF

echo ""
echo "步骤 5/5: 重启 Nginx 容器..."
docker restart $CONTAINER_NAME

echo ""
echo "========================================"
echo "  部署完成！"
echo "========================================"
echo "访问地址: http://localhost:$HOST_PORT"
echo "API 代理: http://$BACKEND_HOST:$BACKEND_PORT"
