import axios from 'axios';

// 火山引擎 DeepSeek API 地址
const VOLCENGINE_DEEPSEEK_API_URL = 'https://opensearch-service-cn-beijing.volces.com/model-serving/v2/openapi/engines/deepseek-chat/chat-completions';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface VolcengineDeepSeekCompletionParams {
  messages: DeepSeekMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

interface VolcengineDeepSeekResponse {
  id: string;
  created: number;
  choices: {
    index: number;
    message: DeepSeekMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 使用火山引擎的 DeepSeek API 生成回复
 * @param userMessage 用户消息
 * @returns 生成的回复文本
 */
export async function generateDeepSeekResponse(userMessage: string): Promise<string> {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error('火山引擎 DeepSeek API 密钥缺失。请设置 DEEPSEEK_API_KEY 环境变量。');
      return "抱歉，AI 服务目前无法使用。请稍后再试。";
    }

    const params: VolcengineDeepSeekCompletionParams = {
      messages: [
        { 
          role: "system", 
          content: "你是一个友好的AI助手，可以提供有帮助、安全、准确的信息。" 
        },
        { 
          role: "user", 
          content: userMessage 
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.95,
      stream: false
    };

    const response = await axios.post<VolcengineDeepSeekResponse>(
      VOLCENGINE_DEEPSEEK_API_URL,
      params,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    // 返回 AI 助手的回复内容
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('火山引擎 DeepSeek API 调用失败:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('错误详情:', error.response?.data);
    }
    
    return "抱歉，在处理您的请求时发生了错误。请稍后再试。";
  }
}