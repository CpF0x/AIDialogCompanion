#!/bin/bash

# 颜色设置
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
RED="\033[0;31m"
RESET="\033[0m"

# 标题
echo -e "\n${BLUE}======================================================${RESET}"
echo -e "${BLUE}            AI对话助手应用启动脚本                ${RESET}"
echo -e "${BLUE}======================================================${RESET}\n"

# 确保在正确的目录中
cd "$(dirname "$0")"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未找到Node.js，请安装Node.js。${RESET}"
    echo -e "${YELLOW}请访问 https://nodejs.org/ 安装Node.js${RESET}"
    read -p "按Enter键退出..."
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ 已找到Node.js: ${NODE_VERSION}${RESET}"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: 未找到npm，请重新安装Node.js。${RESET}"
    read -p "按Enter键退出..."
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ 已找到npm: ${NPM_VERSION}${RESET}"

# 安装依赖
echo -e "\n${GREEN}正在检查Node.js依赖...${RESET}"
npm install

# 启动应用
echo -e "\n${BLUE}======================================================${RESET}"
echo -e "${BLUE}                  启动应用                      ${RESET}"
echo -e "${BLUE}======================================================${RESET}\n"
echo -e "${GREEN}正在启动应用...${RESET}"
echo -e "${YELLOW}请在浏览器访问: http://localhost:5000${RESET}"
echo -e "${YELLOW}按Ctrl+C终止应用${RESET}"

# 启动应用
npm run dev 