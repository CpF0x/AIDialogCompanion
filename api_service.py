import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 火山方舟API配置
ARK_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
MODEL_ID = "deepseek-r1-250120"  # 使用您指定的模型ID

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # 获取API密钥
        api_key = os.environ.get("ARK_API_KEY") or os.environ.get("DEEPSEEK_API_KEY")
        if not api_key:
            return jsonify({"error": "API密钥未设置。请设置ARK_API_KEY环境变量。"}), 500
        
        # 从请求中获取用户消息
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({"error": "消息不能为空"}), 400
            
        # 准备发送到火山方舟API的请求
        payload = {
            "model": MODEL_ID,
            "messages": [
                {
                    "role": "system",
                    "content": "你是一个友好的AI助手，可以提供有帮助、安全、准确的信息。"
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            "temperature": 0.7,
            "max_tokens": 2000,
            "top_p": 0.95
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        # 调用火山方舟API
        response = requests.post(
            ARK_API_URL,
            json=payload,
            headers=headers
        )
        
        # 检查响应状态
        response.raise_for_status()
        
        # 解析API响应
        result = response.json()
        
        # 返回AI助手的响应内容
        ai_message = result["choices"][0]["message"]["content"]
        return jsonify({"response": ai_message})
        
    except requests.exceptions.RequestException as e:
        print(f"API请求错误: {e}")
        if hasattr(e, 'response') and e.response is not None:
            error_detail = e.response.json() if e.response.content else {"error": str(e)}
            print(f"错误详情: {error_detail}")
            return jsonify({"error": f"API请求失败: {error_detail}"}), 500
        return jsonify({"error": f"API请求失败: {str(e)}"}), 500
    except Exception as e:
        print(f"处理请求时出错: {e}")
        return jsonify({"error": f"处理请求时出错: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    # 获取端口，如果未设置则默认为5001
    port = int(os.environ.get('PYTHON_API_PORT', 5001))
    # 启动服务器，监听所有网络接口以确保在容器或远程访问时可用
    app.run(host='0.0.0.0', port=port, debug=True)