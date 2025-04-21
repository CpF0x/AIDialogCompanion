import axios from 'axios';
import config from '../config/config';

// 从配置文件中获取Python API服务的地址
const PYTHON_API_URL = config.pythonApi.url;

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

export interface StreamChatResponse {
  content: string;
  model: ModelResponse;
}

/**
 * 使用Python API服务生成回复
 * @parsm userMessage 用户消息
 * @param modelId 模型ID（可选）
 * @param stream 是否使用流式输出（可选）
 * @returns 包含AI回复及使用的模型信息
 */
export async function generateDeepSeekResponse(
  userMessage: string,
  modelId?: string,
  stream?: boolean
): Promise<ChatResponse | ReadableStream<StreamChatResponse>> {
  try {
    // 首先检查Python服务是否运行
    try {
      await axios.get(`${PYTHON_API_URL}/health`);
    } catch (healthError) {
      console.error('Python API服务未运行或无法访问:', healthError);
      if (stream) {
        throw new Error('Python API服务未运行或无法访问');
      }
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

    // 如果需要流式输出，则添加到请求中
    if (stream) {
      requestData.stream = true;

      // 创建流式响应
      return new ReadableStream<StreamChatResponse>({
        async start(controller) {
          try {
            // 使用fetch API进行流式请求
            const response = await fetch(`${PYTHON_API_URL}/api/chat`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream'
              },
              body: JSON.stringify(requestData)
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
              throw new Error('Response body is null');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });

              // 处理SSE格式的数据
              const lines = buffer.split('\n\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.substring(6);

                  if (data === '[DONE]') {
                    // 流式响应结束
                    controller.close();
                    return;
                  }

                  try {
                    // 解析JSON数据
                    const jsonData = JSON.parse(data);
                    controller.enqueue(jsonData);
                  } catch (e) {
                    console.error('解析JSON数据失败:', e, data);
                  }
                }
              }
            }

            controller.close();
          } catch (error) {
            console.error('流式请求失败:', error);
            controller.error(error);
          }
        }
      });
    } else {
      // 非流式输出，使用原有的处理方式
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
    }
  } catch (error) {
    console.error('调用Python API服务失败:', error);

    if (axios.isAxiosError(error)) {
      console.error('错误详情:', error.response?.data);
    }

    if (stream) {
      throw error;
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