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

print_header "DeepSeek Web前端启动脚本"

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

# 检查Python API服务是否运行
print_message "${GREEN}" "正在检查Python API服务..."
if command -v curl &> /dev/null; then
  if curl -s http://localhost:5001/health &> /dev/null; then
    print_message "${GREEN}" "✅ Python API服务正在运行"
  else
    print_message "${YELLOW}" "⚠️ 无法连接到Python API服务"
    print_message "${YELLOW}" "请先在另一个终端窗口运行 './start-python-service.sh'"
    
    read -p "是否继续启动前端? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
else
  print_message "${YELLOW}" "⚠️ 未找到curl，无法检查Python API服务"
  print_message "${YELLOW}" "请确保Python API服务已在另一个终端窗口中运行"
fi

# 设置Python API URL环境变量
export PYTHON_API_URL="http://localhost:5001"

# 安装依赖
print_header "安装Node.js依赖"
print_message "${GREEN}" "正在安装Node.js依赖..."
npm install

# 启动前端应用
print_header "启动前端应用"
print_message "${GREEN}" "正在启动前端应用..."
print_message "${YELLOW}" "请在浏览器中访问: http://localhost:5000"
print_message "${YELLOW}" "按Ctrl+C终止应用"

# 启动应用
npm run dev