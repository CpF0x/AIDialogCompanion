#!/bin/bash

# 颜色代码
GREEN="\033[0;32m"
RESET="\033[0m"

# 使脚本可执行
chmod +x start-local.sh
chmod +x start-python-service.sh
chmod +x start-frontend.sh
chmod +x build-for-production.sh
chmod +x make-scripts-executable.sh

echo -e "${GREEN}所有脚本已设置为可执行。${RESET}"
echo -e "${GREEN}您现在可以运行 ./start-local.sh 来启动应用。${RESET}"