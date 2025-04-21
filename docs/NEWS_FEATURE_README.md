

# AI对话助手任务设计文档

## 1. 项目概述

AI对话助手是一个基于DeepSeek模型的智能聊天应用，提供聊天功能和新闻资讯服务。系统采用前后端分离架构，使用React前端和Node.js/Python后端，实现了用户友好的界面与强大的AI对话能力。

## 2. 系统架构

### 2.1 前端架构
- 基于React和TypeScript构建
- 使用Tailwind CSS和shadcn/ui组件库
- 采用WebSocket实现实时通信

### 2.2 后端架构
- Node.js服务器处理基本API请求和数据存储
- Python Flask服务处理AI模型交互和新闻服务
- SQLite数据库存储用户数据和聊天记录

### 2.3 AI模型与NewsAPI集成
- 使用DeepSeek-r1-250120模型（通过火山方舟Ark API）
- 支持流式文本生成
- **用户消息AI二次处理：发生新闻相关消息——>AI提取新闻关键词——>使用关键词调用NewsAPI获取相关新闻——>新闻再次提交给AI总结分析**

## 3. 核心AI任务逻辑

### 3.1 聊天对话功能
- **对话处理流程**：
  1. 用户发送消息到前端
  2. 前端通过API将消息发送到Node.js后端
  3. Node.js后端转发请求到Python服务
  4. Python服务调用DeepSeek API获取回复
  5. 使用流式响应将AI回复实时返回给前端

- **上下文管理**：
  1. 将对话历史作为上下文提供给模型
  2. 实现多轮对话能力
  3. 支持切换不同聊天记录

### 3.2 新闻资讯服务
- **关键词提取**：
  1. 分析用户消息提取新闻关键词
  2. 将中文关键词转换为英文以优化搜索

- **新闻检索**：
  1. 使用NewsAPI获取相关新闻
  2. 优先搜索中文新闻，无结果时搜索英文新闻
  3. 无相关结果时提供默认热门新闻

- **新闻推送**：
  1. 用户可订阅定期新闻总结
  2. 通过WebSocket推送新闻更新
  3. 支持手动触发新闻更新

## 4. API交互设计

### 4.1 前端与Node.js后端API
| 端点 | 方法 | 功能描述 |
|------|------|----------|
| `/api/chats` | GET | 获取用户的所有聊天记录 |
| `/api/chats` | POST | 创建新聊天会话 |
| `/api/chats/:id/messages` | GET | 获取特定聊天的消息 |
| `/api/chats/:id/messages` | POST | 发送新消息 |
| `/api/feature-cards` | GET | 获取推荐问题卡片 |

### 4.2 Node.js后端与Python服务API
| 端点 | 方法 | 功能描述 |
|------|------|----------|
| `/api/chat` | POST | 调用AI模型生成回复 |
| `/api/models` | GET | 获取可用AI模型列表 |
| `/api/subscribe-news` | POST | 订阅新闻服务 |
| `/api/unsubscribe-news` | POST | 取消订阅新闻服务 |
| `/api/trigger-news-summary` | POST | 触发新闻总结生成 |
| `/api/news-status` | GET | 获取新闻订阅状态 |

### 4.3 外部API集成
- **火山方舟API**：
  - 端点：`https://ark.cn-beijing.volces.com/api/v3/chat/completions`
  - 认证：Bearer令牌
  - 参数：模型ID、消息历史、温度等

- **NewsAPI**：
  - 用于获取最新新闻
  - 支持按关键词和语言搜索
  - 需要API密钥认证

## 5. 数据模型

### 5.1 主要数据实体
- **用户(users)**：存储用户信息
- **聊天(chats)**：记录聊天会话
- **消息(messages)**：存储对话消息内容
- **AI模型(aiModels)**：可用AI模型信息
- **功能卡片(featureCards)**：推荐问题卡片

### 5.2 WebSocket通信数据结构
- **连接确认**：`{type: 'connection', status: 'connected', userId}`
- **新闻订阅**：`{type: 'news_subscription', status: 'success', message, next_update}`
- **定时新闻**：`{type: 'scheduled_news', content}`

## 6. 系统配置要求

### 6.1 环境变量
- `ARK_API_KEY`：火山方舟API密钥
- `NEWS_API_KEY`：新闻API密钥
- `PYTHON_API_URL`：Python服务URL（默认http://localhost:5001）

### 6.2 硬件要求
- 支持现代浏览器的设备
- 服务器端：支持Node.js和Python环境的服务器

## 7. 扩展与优化方向

### 7.1 功能扩展
- 多模型支持与切换
- 个性化新闻偏好设置
- 内容安全过滤和审核机制

### 7.2 技术优化
- 实现消息缓存减少API调用
- 优化大量历史消息处理性能
- 实现多用户并发处理

## 8. 部署指南

### 8.1 开发环境
- 使用`run-app.bat`或`run-app.sh`脚本启动
- 自动安装依赖并启动前后端服务

### 8.2 生产环境
- 使用`build-for-production.bat`或`build-for-production.sh`构建
- 前端生成静态文件
- 后端使用生产级服务器运行

## 9. 故障排除

### 9.1 常见问题
- API密钥配置错误
- 服务端口冲突
- WebSocket连接失败

### 9.2 日志和监控
- 前端控制台日志
- 后端服务日志
- API调用状态监控
