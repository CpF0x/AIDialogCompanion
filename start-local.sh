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

# 检查命令是否存在
check_command() {
  command -v $1 >/dev/null 2>&1 || { 
    print_message "${RED}" "错误: 未找到 $1。请先安装 $1。"; 
    return 1; 
  }
  return 0
}

# 检查环境变量
check_env_var() {
  if [ -z "${!1}" ]; then
    print_message "${YELLOW}" "警告: 未设置环境变量 $1。AI聊天功能可能无法正常工作。"
    print_message "${YELLOW}" "请通过以下命令设置环境变量:"
    print_message "${YELLOW}" "  export $1=你的密钥值"
    return 1
  fi
  return 0
}

print_header "AI聊天应用本地启动脚本"

# 检查必要的依赖
print_message "${GREEN}" "正在检查必要的依赖..."

# 检查Node.js
if ! check_command "node"; then
  print_message "${YELLOW}" "请访问 https://nodejs.org/ 安装 Node.js"
  exit 1
fi

NODE_VERSION=$(node -v)
print_message "${GREEN}" "✅ 已找到 Node.js: ${NODE_VERSION}"

# 检查npm
if ! check_command "npm"; then
  print_message "${RED}" "未找到npm。请重新安装Node.js。"
  exit 1
fi

NPM_VERSION=$(npm -v)
print_message "${GREEN}" "✅ 已找到 npm: ${NPM_VERSION}"

# 检查Python
if ! check_command "python"; then
  if ! check_command "python3"; then
    print_message "${RED}" "未找到Python。请安装Python 3.7+。"
    print_message "${YELLOW}" "访问 https://www.python.org/downloads/ 安装Python"
    exit 1
  else
    PYTHON_CMD="python3"
  fi
else
  PYTHON_CMD="python"
fi

PYTHON_VERSION=$(${PYTHON_CMD} --version)
print_message "${GREEN}" "✅ 已找到 ${PYTHON_VERSION}"

# 检查pip
if ! ${PYTHON_CMD} -m pip --version >/dev/null 2>&1; then
  print_message "${RED}" "未找到pip。请确保pip已安装。"
  print_message "${YELLOW}" "你可以尝试: '${PYTHON_CMD} -m ensurepip' 或安装pip"
  exit 1
fi

PIP_VERSION=$(${PYTHON_CMD} -m pip --version | grep -o "pip .*" | cut -d' ' -f1-2)
print_message "${GREEN}" "✅ 已找到 ${PIP_VERSION}"

# 检查API密钥环境变量
print_message "${GREEN}" "正在检查API密钥..."
ENV_VAR_SET=true

# 检查火山方舟API密钥
if ! check_env_var "ARK_API_KEY" && ! check_env_var "DEEPSEEK_API_KEY"; then
  ENV_VAR_SET=false
fi

if [ "$ENV_VAR_SET" = false ]; then
  print_message "${YELLOW}" "请设置必要的环境变量以启用完整功能。"
  print_message "${YELLOW}" "即将继续启动应用程序，但AI聊天功能可能不可用。"
  read -p "按Enter键继续..." 
fi

# 安装Python依赖
print_header "安装Python依赖"
print_message "${GREEN}" "正在安装Python依赖..."
${PYTHON_CMD} -m pip install flask flask-cors requests

# 安装Node.js依赖
print_header "安装Node.js依赖"
print_message "${GREEN}" "正在安装Node.js依赖..."
npm install

# 启动应用
print_header "启动应用"
print_message "${GREEN}" "启动AI聊天应用..."
print_message "${YELLOW}" "请在浏览器中访问: http://localhost:5000"
print_message "${YELLOW}" "按Ctrl+C终止应用"

# 设置Python API服务地址环境变量
export PYTHON_API_URL="http://localhost:5001"

# 启动应用
npm run dev