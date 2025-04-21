# AI对话助手应用

一个基于DeepSeek模型的AI聊天应用，具有简洁的界面、聊天历史记录和推荐问题功能。

![应用截图](attached_assets/image_1741848389367.png)

## 功能特点

- 📝 干净简洁的用户界面，专注于聊天体验
- 📚 聊天历史记录保存和浏览
- 💡 推荐问题快速启动对话
- 🔄 实时聊天响应
- 🌐 基于DeepSeek-r1模型

## 技术栈

- **前端**: React, TypeScript, Tailwind CSS, shadcn/ui
- **后端**: Node.js, Express, Python Flask
- **AI模型**: DeepSeek-r1-250120 (火山方舟 Ark API)

## 快速开始

### 前提条件

- Node.js (v16+)
- npm (v7+)
- Python 3.7+
- 火山方舟API密钥

### 设置API密钥

将API密钥设置为环境变量：

```bash
# Windows
set ARK_API_KEY=your_api_key_here

# Linux/Mac
export ARK_API_KEY=your_api_key_here
```

### 方法1：使用自动启动脚本（推荐）

我们提供了自动启动脚本，简化安装和运行过程：

#### Windows
```
run-app.bat
```

#### Linux/Mac
```bash
# 添加执行权限
chmod +x run-app.sh

# 运行脚本
./run-app.sh
```

### 方法2：手动启动

1. 安装依赖
   ```bash
   npm install
   pip install flask flask-cors requests
   ```

2. 启动Python API服务
   ```bash
   python api_service.py
   ```

3. 在另一个终端启动Node.js应用
   ```bash
   # 设置Python API URL
   set PYTHON_API_URL=http://localhost:5001  # Windows
   export PYTHON_API_URL=http://localhost:5001  # Linux/Mac
   
   # 启动应用
   npm run dev
   ```

4. 打开浏览器访问: http://localhost:5000

## 故障排除

### Python API服务问题

- 确认Python和Flask正确安装
- 检查端口5001是否被占用
- 验证API密钥是否正确设置

### Node.js应用问题

- 确认Python服务正在运行
- 检查PYTHON_API_URL环境变量是否正确设置
- 确认所有依赖已正确安装

### AI回复未生成

- 确认API密钥正确设置且有效
- 检查Python API服务日志中是否有错误

## 许可证

[MIT许可证]