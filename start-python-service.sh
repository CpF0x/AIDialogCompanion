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

print_header "DeepSeek Python API服务启动脚本"

# 检查Python
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
  print_message "${RED}" "错误: 未找到Python。请安装Python 3.7+。"
  print_message "${YELLOW}" "访问 https://www.python.org/downloads/ 安装Python"
  exit 1
fi

# 确定Python命令
if command -v python3 &> /dev/null; then
  PYTHON_CMD="python3"
else
  PYTHON_CMD="python"
fi

PYTHON_VERSION=$(${PYTHON_CMD} --version)
print_message "${GREEN}" "✅ 已找到 ${PYTHON_VERSION}"

# 检查pip
if ! ${PYTHON_CMD} -m pip --version &> /dev/null; then
  print_message "${RED}" "未找到pip。请确保pip已安装。"
  print_message "${YELLOW}" "你可以尝试: '${PYTHON_CMD} -m ensurepip' 或安装pip"
  exit 1
fi

PIP_VERSION=$(${PYTHON_CMD} -m pip --version | grep -o "pip .*" | cut -d' ' -f1-2)
print_message "${GREEN}" "✅ 已找到 ${PIP_VERSION}"

# 检查API密钥环境变量
print_message "${GREEN}" "正在检查API密钥..."
API_KEY_SET=false

# 检查火山方舟API密钥
if [ -n "${ARK_API_KEY}" ]; then
  print_message "${GREEN}" "✅ 已设置ARK_API_KEY环境变量"
  API_KEY_SET=true
elif [ -n "${DEEPSEEK_API_KEY}" ]; then
  print_message "${GREEN}" "✅ 已设置DEEPSEEK_API_KEY环境变量"
  API_KEY_SET=true
else
  print_message "${YELLOW}" "⚠️ 未设置API密钥环境变量。AI聊天功能无法正常工作。"
  print_message "${YELLOW}" "请通过以下命令设置环境变量:"
  print_message "${YELLOW}" "  export ARK_API_KEY=你的密钥值"
  print_message "${YELLOW}" "  或"
  print_message "${YELLOW}" "  export DEEPSEEK_API_KEY=你的密钥值"
  
  read -p "是否要继续启动服务? [y/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# 安装Python依赖
print_header "安装Python依赖"
print_message "${GREEN}" "正在安装Flask依赖..."
${PYTHON_CMD} -m pip install flask flask-cors requests

# 启动Python API服务
print_header "启动Python API服务"
print_message "${GREEN}" "正在启动Python API服务..."
print_message "${YELLOW}" "服务将在 http://localhost:5001 上运行"
print_message "${YELLOW}" "在另一个终端窗口运行 'npm run dev' 来启动前端应用"
print_message "${YELLOW}" "按Ctrl+C终止服务"

# 设置端口环境变量
export PYTHON_API_PORT=5001

# 启动Python服务
${PYTHON_CMD} api_service.py