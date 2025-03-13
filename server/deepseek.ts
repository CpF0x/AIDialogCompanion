import axios from 'axios';

// Python API服务的地址
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5001';

export interface Model {
  id: string;
  name: string;
  description: string;
}

export interface ModelResponse {
  id: string;
  name: string;
}

export interface ChatResponse {
  response: string;
  model: ModelResponse;
}

/**
 * 使用Python API服务生成回复
 * @param userMessage 用户消息
 * @param modelId 模型ID（可选）
 * @returns 包含AI回复及使用的模型信息
 */
export async function generateDeepSeekResponse(
  userMessage: string, 
  modelId?: string
): Promise<ChatResponse> {
  try {
    // 首先检查Python服务是否运行
    try {
      await axios.get(`${PYTHON_API_URL}/health`);
    } catch (healthError) {
      console.error('Python API服务未运行或无法访问:', healthError);
      return {
        response: "抱歉，AI服务当前不可用。请确保Python API服务正在运行。",
        model: { id: "unknown", name: "未知模型" }
      };
    }

    // 准备请求数据
    const requestData: Record<string, any> = { message: userMessage };
    
    // 如果指定了模型ID，则添加到请求中
    if (modelId) {
      requestData.model_id = modelId;
    }

    // 调用Python API服务
    const response = await axios.post(
      `${PYTHON_API_URL}/api/chat`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // 返回AI助手的回复内容和模型信息
    return {
      response: response.data.response,
      model: response.data.model
    };
  } catch (error) {
    console.error('调用Python API服务失败:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('错误详情:', error.response?.data);
    }
    
    return {
      response: "抱歉，在处理您的请求时发生了错误。请稍后再试。",
      model: { id: "unknown", name: "未知模型" }
    };
  }
}

/**
 * 获取可用的模型列表
 * @returns 模型列表
 */
export async function getAvailableModels(): Promise<Model[]> {
  try {
    // 首先检查Python服务是否运行
    try {
      await axios.get(`${PYTHON_API_URL}/health`);
    } catch (healthError) {
      console.error('Python API服务未运行或无法访问:', healthError);
      return [];
    }

    // 调用Python API服务获取模型列表
    const response = await axios.get(`${PYTHON_API_URL}/api/models`);
    
    // 返回模型列表
    return response.data;
  } catch (error) {
    console.error('获取模型列表失败:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('错误详情:', error.response?.data);
    }
    
    return [];
  }
}