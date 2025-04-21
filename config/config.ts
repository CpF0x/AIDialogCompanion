/**
 * 应用配置文件
 * 集中管理所有配置信息
 */

import path from 'path';
import { fileURLToPath } from 'url';

// 在ES模块中获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量中获取配置，提供默认值
export const config = {
  // 服务器配置
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    host: '0.0.0.0',
  },

  // Python API服务配置
  pythonApi: {
    url: process.env.PYTHON_API_URL || 'http://localhost:5001',
    port: parseInt(process.env.PYTHON_API_PORT || '5001', 10),
  },

  // 数据库配置
  database: {
    path: process.env.DATABASE_PATH || path.resolve(__dirname, '../data/aidialogsqlite.db'),
  },

  // API密钥配置
  apiKeys: {
    ark: process.env.ARK_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
  },

  // 环境配置
  env: {
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',
  }
};

export default config;
