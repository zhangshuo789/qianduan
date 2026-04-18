/**
 * 环境配置
 * 通过 vite 的 import.meta.env 读取环境变量
 */

const env = import.meta.env

export const config = {
  // API 配置
  apiBaseUrl: env.VITE_API_BASE_URL || 'http://localhost:8080',
  apiPrefix: env.VITE_API_PREFIX || '/api',

  // 文件服务配置
  fileBaseUrl: env.VITE_FILE_BASE_URL || 'http://localhost:8080',
  fileUploadPath: env.VITE_FILE_UPLOAD_PATH || '/api/file/upload',
  fileDownloadPath: env.VITE_FILE_DOWNLOAD_PATH || '/api/file/download',

  // SSE 配置
  sseUrl: env.VITE_SSE_URL || 'http://localhost:8080',

  // 判断是否为生产环境
  isProduction: env.PROD,
  // 判断是否为开发环境
  isDevelopment: env.DEV
}

export default config
