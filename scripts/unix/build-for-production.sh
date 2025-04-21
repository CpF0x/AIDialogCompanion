#!/bin/bash

# 颜色代码
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
RED="\033[0;31m"
RESET="\033[0m"

# 打印带颜色的消息
print_message() {
  echo -e "$1$2${RESET}"
}

# 打印标题
print_header() {
  echo
  print_message "${BLUE}" "======================================================"
  print_message "${BLUE}" "$1"
  print_message "${BLUE}" "======================================================"
  echo
}

print_header "生产环境构建脚本"

# 检查Node.js
if ! command -v node &> /dev/null; then
  print_message "${RED}" "错误: 未找到Node.js。请安装Node.js。"
  print_message "${YELLOW}" "访问 https://nodejs.org/ 安装Node.js"
  exit 1
fi

NODE_VERSION=$(node --version)
print_message "${GREEN}" "✅ 已找到Node.js: ${NODE_VERSION}"

# 检查npm
if ! command -v npm &> /dev/null; then
  print_message "${RED}" "错误: 未找到npm。请重新安装Node.js。"
  exit 1
fi

NPM_VERSION=$(npm --version)
print_message "${GREEN}" "✅ 已找到npm: ${NPM_VERSION}"

# 安装依赖
print_header "安装依赖"
print_message "${GREEN}" "正在安装Node.js依赖..."
npm install

# 构建前端
print_header "构建前端应用"
print_message "${GREEN}" "正在构建前端应用..."
NODE_ENV=production npm run build

# 成功消息
if [ $? -eq 0 ]; then
  print_header "构建完成"
  print_message "${GREEN}" "✅ 前端应用已成功构建"
  print_message "${GREEN}" "✅ 构建文件位于 ./client/dist 目录"
  print_message "${YELLOW}" "要在生产环境中运行应用:"
  print_message "${YELLOW}" "1. 设置必要的环境变量:"
  print_message "${YELLOW}" "   export NODE_ENV=production"
  print_message "${YELLOW}" "   export ARK_API_KEY=your_api_key_here"
  print_message "${YELLOW}" "2. 在一个终端中启动Python API服务:"
  print_message "${YELLOW}" "   python api_service.py"
  print_message "${YELLOW}" "3. 在另一个终端中启动Node.js应用:"
  print_message "${YELLOW}" "   export PYTHON_API_URL=http://localhost:5001"
  print_message "${YELLOW}" "   node server/index.js"
else
  print_header "构建失败"
  print_message "${RED}" "❌ 前端应用构建失败"
  print_message "${YELLOW}" "请检查上面的错误信息"
fi