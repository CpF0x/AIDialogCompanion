import axios from 'axios';

// Python API服务的地址
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5001';

/**
 * 使用Python API服务生成回复
 * @param userMessage 用户消息
 * @returns 生成的回复文本
 */
export async function generateDeepSeekResponse(userMessage: string): Promise<string> {
  try {
    // 首先检查Python服务是否运行
    try {
      await axios.get(`${PYTHON_API_URL}/health`);
    } catch (healthError) {
      console.error('Python API服务未运行或无法访问:', healthError);
      return "抱歉，AI服务当前不可用。请确保Python API服务正在运行。";
    }

    // 调用Python API服务
    const response = await axios.post(
      `${PYTHON_API_URL}/api/chat`,
      { message: userMessage },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // 返回AI助手的回复内容
    return response.data.response;
  } catch (error) {
    console.error('调用Python API服务失败:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('错误详情:', error.response?.data);
    }
    
    return "抱歉，在处理您的请求时发生了错误。请稍后再试。";
  }
}