import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { log } from "./vite";

/**
 * 启动Python API服务
 */
export function startPythonApiService() {
  // 检查是否在Replit环境中运行
  const isReplit = process.env.REPL_ID != null;
  
  // 确定Python脚本路径
  const apiServicePath = path.resolve("./api_service.py");
  
  // 检查Python API服务脚本是否存在
  if (!fs.existsSync(apiServicePath)) {
    log(`找不到Python API服务脚本: ${apiServicePath}`, "python-api");
    log("请确保 api_service.py 文件存在于项目根目录中", "python-api");
    return;
  }
  
  // 确定Python解释器路径
  let pythonCommand = isReplit ? "python" : "python";
  
  // 在Windows环境中可能需要使用"python"或"py"
  if (process.platform === "win32") {
    pythonCommand = "python";
  }
  
  // 启动Python API服务
  log(`启动Python API服务: ${pythonCommand} ${apiServicePath}`, "python-api");
  
  try {
    const pythonProcess = spawn(pythonCommand, [apiServicePath]);
    
    // 监听标准输出
    pythonProcess.stdout.on("data", (data) => {
      log(`${data}`, "python-api");
    });
    
    // 监听标准错误
    pythonProcess.stderr.on("data", (data) => {
      log(`错误: ${data}`, "python-api");
    });
    
    // 监听进程关闭
    pythonProcess.on("close", (code) => {
      log(`Python API服务已退出，退出码: ${code}`, "python-api");
      
      if (code !== 0) {
        log("Python API服务异常退出，请检查错误日志", "python-api");
      }
    });
    
    // 处理Node.js进程退出时的清理
    process.on("exit", () => {
      log("Node.js进程退出，正在关闭Python API服务", "python-api");
      pythonProcess.kill();
    });
    
    // 监听意外终止信号
    process.on("SIGINT", () => {
      log("收到SIGINT信号，正在关闭Python API服务", "python-api");
      pythonProcess.kill();
      process.exit(0);
    });
    
    process.on("SIGTERM", () => {
      log("收到SIGTERM信号，正在关闭Python API服务", "python-api");
      pythonProcess.kill();
      process.exit(0);
    });
    
    return pythonProcess;
  } catch (error) {
    log(`启动Python API服务失败: ${error}`, "python-api");
    log("请确保已安装Python并且可以从命令行访问", "python-api");
    return null;
  }
}

// 查看Python API服务的配置，确保API服务使用的是端口5001