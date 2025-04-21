# AI对话助手应用

一个基于DeepSeek模型的AI聊天应用，具有简洁的界面、聊天历史记录和推荐问题功能。

## 项目结构

```
AIDialogCompanion/
├── client/                 # 前端代码
│   ├── src/                # React源代码
│   │   ├── components/     # UI组件
│   │   ├── hooks/          # React钩子
│   │   ├── lib/            # 工具函数和类型定义
│   │   ├── pages/          # 页面组件
│   │   ├── App.tsx         # 应用入口组件
│   │   ├── index.css       # 全局样式
│   │   └── main.tsx        # 应用入口点
│   └── index.html          # HTML模板
├── server/                 # Node.js后端代码
│   ├── deepseek.ts         # DeepSeek API集成
│   ├── index.ts            # 服务器入口点
│   ├── python-service.ts   # Python服务管理
│   ├── routes.ts           # API路由定义
│   ├── storage.ts          # 数据存储接口
│   └── vite.ts             # Vite开发服务器配置
├── shared/                 # 前后端共享代码
│   ├── db.ts               # 数据库初始化
│   ├── schema.ts           # 数据模型定义
│   └── sqlite-storage.ts   # SQLite存储实现
├── config/                 # 配置文件
│   ├── .env                # 环境变量
│   ├── api.env             # API密钥配置
│   ├── config.ts           # TypeScript配置
│   └── news_api.env        # 新闻API配置
├── scripts/                # 脚本文件
│   ├── windows/            # Windows脚本
│   │   ├── build-for-production.bat  # 生产环境构建
│   │   ├── run-app.bat               # 应用启动
│   │   ├── start-frontend.bat        # 前端启动
│   │   ├── start-local.bat           # 本地开发启动
│   │   └── start-python-service.bat  # Python服务启动
│   └── unix/               # Unix/Linux/Mac脚本
│       ├── build-for-production.sh   # 生产环境构建
│       ├── make-scripts-executable.sh # 脚本权限设置
│       ├── run-app.sh                # 应用启动
│       ├── start-frontend.sh         # 前端启动
│       ├── start-local.sh            # 本地开发启动
│       └── start-python-service.sh   # Python服务启动
├── docs/                   # 文档
│   ├── README.md           # 详细文档
│   └── NEWS_FEATURE_README.md # 新闻功能文档
├── data/                   # 数据文件
├── api_service.py          # Python API服务
├── requirements.txt        # Python依赖
└── package.json            # Node.js依赖和脚本
```

## 功能特点

- 📝 干净简洁的用户界面，专注于聊天体验
- 📚 聊天历史记录保存和浏览
- 💡 推荐问题快速启动对话
- 🔄 实时聊天响应
- 🌐 基于DeepSeek-r1模型

## 快速开始

### 前提条件

- Node.js (v16+)
- npm (v7+)
- Python 3.7+
- 火山方舟API密钥

### 设置API密钥

将API密钥设置为环境变量或在config/.env文件中配置：

```bash
# 编辑config/.env文件
ARK_API_KEY=your_api_key_here
```

### 启动应用

#### Windows
```
scripts\windows\run-app.bat
```

#### Linux/Mac
```bash
# 添加执行权限
chmod +x scripts/unix/make-scripts-executable.sh
./scripts/unix/make-scripts-executable.sh

# 运行应用
./scripts/unix/run-app.sh
```

## 详细文档

更多详细信息，请参阅[详细文档](docs/README.md)。

## 许可证

[MIT许可证]
