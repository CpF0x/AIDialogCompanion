import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 火山方舟API配置
ARK_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"

# 支持的模型列表
AVAILABLE_MODELS = {
    "deepseek-r1-250120": {
        "name": "DeepSeek R1",
        "description": "DeepSeek R1 250120版本，具有强大的文本理解和生成能力",
        "max_tokens": 2000,
        "temperature": 0.7,
        "top_p": 0.95
    },
    "spark-3.5": {
        "name": "讯飞星火",
        "description": "讯飞星火3.5模型，擅长中文理解和创作",
        "max_tokens": 1500,
        "temperature": 0.8,
        "top_p": 0.9
    },
    "qwen-max": {
        "name": "通义千问Max",
        "description": "阿里巴巴通义千问Max模型，全能的AI助手",
        "max_tokens": 2000,
        "temperature": 0.7,
        "top_p": 0.95
    }
}

# 默认模型ID
DEFAULT_MODEL_ID = "deepseek-r1-250120"

@app.route('/api/models', methods=['GET'])
def get_models():
    """获取所有可用的模型列表"""
    models_list = []
    for model_id, model_info in AVAILABLE_MODELS.items():
        models_list.append({
            "id": model_id,
            "name": model_info["name"],
            "description": model_info["description"]
        })
    return jsonify(models_list)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        # 获取API密钥
        api_key = os.environ.get("ARK_API_KEY") or os.environ.get("DEEPSEEK_API_KEY")
        if not api_key:
            return jsonify({"error": "API密钥未设置。请设置ARK_API_KEY环境变量。"}), 500
        
        # 从请求中获取用户消息和模型ID
        data = request.json
        user_message = data.get('message', '')
        model_id = data.get('model_id', DEFAULT_MODEL_ID)
        
        if not user_message:
            return jsonify({"error": "消息不能为空"}), 400
            
        # 检查模型ID是否有效
        if model_id not in AVAILABLE_MODELS:
            return jsonify({"error": f"无效的模型ID: {model_id}。请使用有效的模型ID。"}), 400
            
        # 获取模型配置
        model_config = AVAILABLE_MODELS[model_id]
        
        # 准备发送到火山方舟API的请求
        payload = {
            "model": model_id,
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
            "temperature": model_config["temperature"],
            "max_tokens": model_config["max_tokens"],
            "top_p": model_config["top_p"]
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
        return jsonify({
            "response": ai_message,
            "model": {
                "id": model_id,
                "name": model_config["name"]
            }
        })
        
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