import os
import requests
import json
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import time

app = Flask(__name__)

# 详细的CORS配置
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5000", "*"],  # 允许的源
        "methods": ["GET", "POST", "OPTIONS"],  # 允许的方法
        "allow_headers": ["Content-Type", "Authorization", "X-API-Key"]  # 允许的头部
    }
})

# 初始化定时任务调度器
scheduler = BackgroundScheduler()
scheduler.start()

# API配置
ARK_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
from newsapi import NewsApiClient

# 初始化NewsAPI客户端
newsapi = NewsApiClient(api_key='adfa40201fca4c00800dc67af306c03b')

def extract_keywords(message, api_key):
    """使用DeepSeek模型从用户消息中提取关键词"""
    try:
        # 准备发送到DeepSeek API的请求
        payload = {
            "model": "deepseek-r1-250120",
            "messages": [
                {
                    "role": "system",
                    "content": "你是一个关键词提取助手。请从用户的消息中提取3-5个搜索新闻的关键词，并把这些关键词变为英文，只返回这些英文关键词，用逗号分隔，不要有其他内容。例如：'体育新闻' -> 'sports,news'"
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            "temperature": 0.3,
            "max_tokens": 100
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        # 调用DeepSeek API
        response = requests.post(
            ARK_API_URL,
            json=payload,
            headers=headers,
            timeout=60  # 添加60秒超时设置
        )

        # 检查响应状态
        response.raise_for_status()

        # 解析API响应
        result = response.json()
        keywords = result["choices"][0]["message"]["content"].strip()

        print(f"提取的关键词: {keywords}")

        # 如果关键词为空，尝试直接使用中文关键词
        if not keywords:
            # 移除"新闻"等通用词
            message = message.replace("新闻", "").replace("资讯", "").replace("消息", "")
            # 使用剩余内容作为关键词
            keywords = message.strip()
            print(f"使用原始消息作为关键词: {keywords}")

        return keywords
    except Exception as e:
        print(f"提取关键词失败: {e}")
        return ""

def get_news_by_keywords(keywords):
    """根据关键词获取相关新闻"""
    try:
        if not keywords:
            return get_today_news_default()

        print(f"使用关键词搜索新闻: {keywords}")

        # 尝试使用中文关键词搜索
        news = newsapi.get_everything(q=keywords, language='zh', sort_by='relevancy', page_size=10)
        print(f"中文关键词搜索NewsAPI响应: {news}")

        articles = news.get('articles', [])
        print(f"获取到 {len(articles)} 条中文相关新闻")

        if not articles:
            # 如果没有找到中文新闻，尝试使用英文关键词搜索
            news = newsapi.get_everything(q=keywords, language='en', sort_by='relevancy', page_size=10)
            articles = news.get('articles', [])
            print(f"获取到 {len(articles)} 条英文相关新闻")

        if not articles:
            # 如果仍然没有找到相关新闻，回退到默认新闻
            print("未找到相关新闻，使用默认新闻")
            return get_today_news_default()

        news_text = "\n".join([
            f"- {article.get('title', '无标题')}: {article.get('description', '无描述')}"
            for article in articles if article.get('description')
        ])

        if not news_text.strip():
            print("新闻内容为空，使用默认新闻")
            return get_today_news_default()

        return news_text
    except Exception as e:
        print(f"获取关键词新闻失败: {e}")
        return get_today_news_default()

def get_today_news():
    """获取新闻，支持特定主题的新闻查询"""
    try:
        # 获取API密钥
        api_key = os.environ.get("ARK_API_KEY") or os.environ.get("DEEPSEEK_API_KEY")
        if not api_key:
            print("API密钥未设置，无法提取关键词")
            return get_today_news_default()

        # 从用户最近的消息中提取关键词
        # 这里我们使用一个全局变量来存储最近的用户消息
        global latest_user_message
        if latest_user_message:
            # 尝试从用户消息中提取关键词
            keywords = extract_keywords(latest_user_message, api_key)
            if keywords:
                # 使用提取的关键词获取相关新闻
                return get_news_by_keywords(keywords)

        # 如果没有最近的用户消息或提取关键词失败，返回默认新闻
        return get_today_news_default()
    except Exception as e:
        print(f"获取新闻失败: {e}")
        return get_today_news_default()

def get_today_news_default():
    """获取今日默认新闻（当关键词提取或搜索失败时使用）"""
    try:
        # 尝试获取中文新闻
        news = newsapi.get_top_headlines(language='zh', country='cn')
        print(f"NewsAPI 响应: {news}")

        articles = news.get('articles', [])
        print(f"获取到 {len(articles)} 条新闻")

        if not articles:
            # 如果没有中文新闻，尝试获取全球新闻
            news = newsapi.get_top_headlines(language='en')
            articles = news.get('articles', [])
            print(f"获取到 {len(articles)} 条英文新闻")

        if not articles:
            return "获取新闻失败：没有找到任何新闻文章"

        news_text = "\n".join([
            f"- {article.get('title', '无标题')}: {article.get('description', '无描述')}"
            for article in articles if article.get('description')
        ])

        if not news_text.strip():
            return "获取新闻失败：新闻文章没有有效内容"

        return news_text
    except Exception as e:
        print(f"获取新闻失败: {e}")
        return f"获取新闻失败: {str(e)}"

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
        "name": "Claude-3.5",
        "description": "api待接入",
        "max_tokens": 1500,
        "temperature": 0.8,
        "top_p": 0.9
    },
    "qwen-max": {
        "name": "Gemini 2.0 Flash",
        "description": "api待接入",
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

# 全局变量，用于存储最近的用户消息
latest_user_message = ""

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
        stream = data.get('stream', False)  # 新增：是否使用流式输出

        if not user_message:
            return jsonify({"error": "消息不能为空"}), 400

        # 检查模型ID是否有效
        if model_id not in AVAILABLE_MODELS:
            return jsonify({"error": f"无效的模型ID: {model_id}。请使用有效的模型ID。"}), 400

        # 获取模型配置
        model_config = AVAILABLE_MODELS[model_id]

        # 更新全局变量，存储最近的用户消息
        global latest_user_message
        latest_user_message = user_message

        # 检查是否是新闻相关查询
        news_keywords = ["新闻", "大事", "发生了什么", "今天新闻", "最近新闻", "时事", "热点",
                "今日头条", "最新消息", "新闻摘要", "今日要闻", "新闻播报"]
        is_news_query = any(keyword in user_message.lower() for keyword in news_keywords)

        system_message = "你是一个友好的AI助手，可以提供有帮助、安全、准确的信息。"
        if is_news_query:
            # 获取新闻内容
            news = get_today_news()
            # 根据新闻内容生成系统消息
            if "体育" in user_message:
                system_message = f"你是体育新闻分析助手。请根据以下体育相关新闻简要总结今天的重要体育事件:\n\n{news}"
            elif "科技" in user_message:
                system_message = f"你是科技新闻分析助手。请根据以下科技相关新闻简要总结今天的重要科技事件:\n\n{news}"
            elif "娱乐" in user_message:
                system_message = f"你是娱乐新闻分析助手。请根据以下娱乐相关新闻简要总结今天的重要娱乐事件:\n\n{news}"
            else:
                system_message = f"你是新闻分析助手。请根据以下新闻简要总结今天的重要事件:\n\n{news}"

        # 准备发送到火山方舟API的请求
        payload = {
            "model": model_id,
            "messages": [
                {
                    "role": "system",
                    "content": system_message
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            "temperature": model_config["temperature"],
            "max_tokens": model_config["max_tokens"],
            "top_p": model_config["top_p"],
            "stream": stream  # 新增：是否使用流式输出
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        # 如果是流式输出，使用流式响应
        if stream:
            def generate():
                # 调用火山方舟API并获取流式响应
                with requests.post(
                    ARK_API_URL,
                    json=payload,
                    headers=headers,
                    stream=True,
                    timeout=60  # 添加60秒超时设置
                ) as response:
                    # 检查响应状态
                    response.raise_for_status()

                    # 逐行处理流式响应
                    for line in response.iter_lines():
                        if line:
                            # 解析SSE格式的数据
                            line = line.decode('utf-8')
                            if line.startswith('data:'):
                                data = line[5:].strip()
                                if data == '[DONE]':
                                    # 流式响应结束
                                    yield f"data: [DONE]\n\n"
                                else:
                                    try:
                                        # 解析JSON数据
                                        json_data = json.loads(data)
                                        delta = json_data.get('choices', [{}])[0].get('delta', {})
                                        content = delta.get('content', '')
                                        if content:
                                            # 发送内容增量
                                            yield f"data: {json.dumps({'content': content, 'model': {'id': model_id, 'name': model_config['name']}})}"
                                            yield "\n\n"
                                    except json.JSONDecodeError:
                                        print(f"无法解析JSON数据: {data}")

            # 返回流式响应
            return Response(generate(), mimetype='text/event-stream')
        else:
            # 非流式输出，使用原有的处理方式
            response = requests.post(
                ARK_API_URL,
                json=payload,
                headers=headers,
                timeout=60  # 添加60秒超时设置
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

@app.route('/api/test-news', methods=['GET'])
def test_news():
    """测试新闻API功能"""
    try:
        # 获取查询参数
        query = request.args.get('query', '')

        # 如果提供了查询参数，则更新全局变量
        global latest_user_message
        if query:
            latest_user_message = query

        news = get_today_news()
        return jsonify({"status": "success", "news": news})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

# 存储订阅新闻自动推送的用户
news_subscribers = {}

# 添加WebSocket客户端注册API
@app.route('/api/register-client', methods=['POST'])
def register_client():
    """注册WebSocket客户端连接"""
    try:
        data = request.json
        user_id = data.get('user_id')

        if not user_id:
            return jsonify({"status": "error", "message": "用户ID不能为空"}), 400

        # 存储连接到Node.js服务器的客户端ID，而不是直接存储客户端对象
        # 我们只记录该用户在Node.js服务器中有活跃连接，实际的WebSocket对象由Node.js管理
        if user_id in news_subscribers:
            # 标记该用户有活跃连接
            news_subscribers[user_id]["has_active_connection"] = True
            print(f"已更新用户 {user_id} 的连接状态")
        else:
            # 如果用户尚未订阅，只记录连接状态但不自动订阅
            next_update = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
            news_subscribers[user_id] = {
                "has_active_connection": True,
                "next_update": next_update,
                "subscribed": False  # 标记用户尚未订阅
            }
            print(f"已记录用户 {user_id} 的连接状态，但尚未订阅服务")

        return jsonify({"status": "success", "message": "客户端已注册"})
    except Exception as e:
        print(f"注册客户端失败: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# 添加WebSocket客户端注销API
@app.route('/api/unregister-client', methods=['POST'])
def unregister_client():
    """注销WebSocket客户端连接"""
    try:
        data = request.json
        user_id = data.get('user_id')

        if not user_id:
            return jsonify({"status": "error", "message": "用户ID不能为空"}), 400

        # 检查用户是否已订阅新闻
        if user_id in news_subscribers:
            # 标记该用户没有活跃连接
            news_subscribers[user_id]["has_active_connection"] = False
            print(f"已标记用户 {user_id} 没有活跃连接")

        return jsonify({"status": "success", "message": "客户端已注销"})
    except Exception as e:
        print(f"注销客户端失败: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

def generate_news_summary():
    """生成新闻总结"""
    try:
        # 获取今日新闻
        news_text = get_today_news()

        # 生成新闻总结
        api_key = os.environ.get("ARK_API_KEY") or os.environ.get("DEEPSEEK_API_KEY")
        if not api_key:
            return "无法生成新闻总结：API密钥未设置"

        # 准备发送到DeepSeek API的请求
        payload = {
            "model": "deepseek-r1-250120",
            "messages": [
                {
                    "role": "system",
                    "content": f"你是新闻总结助手。请将以下新闻简明扼要地总结为5-7条重要新闻要点:\n\n{news_text}"
                }
            ],
            "temperature": 0.3,
            "max_tokens": 500
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        # 调用DeepSeek API
        response = requests.post(
            ARK_API_URL,
            json=payload,
            headers=headers,
            timeout=60  # 添加60秒超时设置
        )

        # 检查响应状态
        response.raise_for_status()

        # 解析API响应
        result = response.json()
        summary = result["choices"][0]["message"]["content"].strip()

        # 准备要发送的消息
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        message = {
            "type": "scheduled_news",
            "content": summary,
            "timestamp": current_time
        }

        # 发送新闻总结给所有已订阅且有活跃连接的用户
        # 这里我们只通知Node.js服务器发送消息，实际的WebSocket通信由Node.js处理
        try:
            # 获取所有已订阅且有活跃连接的用户ID
            active_subscribers = [
                user_id
                for user_id, info in news_subscribers.items()
                if info.get("subscribed", False) and info.get("has_active_connection", False)
            ]

            if active_subscribers:
                # 使用HTTP请求通知Node.js服务器发送消息
                notify_payload = {
                    "user_ids": active_subscribers,
                    "message": message
                }

                # 假设Node.js服务器提供了一个接口用于广播消息
                broadcast_url = "http://localhost:5000/api/broadcast-news"
                broadcast_response = requests.post(
                    broadcast_url,
                    json=notify_payload
                )

                broadcast_response.raise_for_status()
                print(f"已通知Node.js服务器向{len(active_subscribers)}个用户发送新闻总结")
        except Exception as e:
            print(f"通知Node.js服务器发送消息失败: {e}")

        return summary
    except Exception as e:
        print(f"生成新闻总结失败: {e}")
        return f"生成新闻总结失败: {str(e)}"

@app.route('/api/subscribe-news', methods=['POST'])
def subscribe_news():
    """订阅每日新闻总结"""
    try:
        data = request.json
        user_id = data.get('user_id')

        if not user_id:
            return jsonify({"status": "error", "message": "用户ID不能为空"}), 400

        # 计算下一次发送时间 (24小时后)
        next_update = datetime.now() + timedelta(days=1)
        next_update_str = next_update.strftime("%Y-%m-%d %H:%M:%S")

        # 检查是否已经存在此用户
        if user_id in news_subscribers:
            # 如果已经订阅，则返回成功
            if news_subscribers[user_id].get("subscribed", False):
                return jsonify({
                    "status": "success",
                    "message": "您已经订阅了每日新闻总结",
                    "next_update": news_subscribers[user_id].get("next_update", next_update_str)
                })

            # 更新订阅状态
            news_subscribers[user_id]["subscribed"] = True
            news_subscribers[user_id]["next_update"] = next_update_str
        else:
            # 添加到订阅列表
            news_subscribers[user_id] = {
                "has_active_connection": True,  # 假设有活跃连接
                "next_update": next_update_str,
                "subscribed": True  # 标记用户已订阅
            }

        # 如果这是第一个订阅用户，启动定时任务
        has_subscribed_users = any(info.get("subscribed", False) for info in news_subscribers.values())
        if has_subscribed_users:
            # 添加定时任务，每24小时运行一次
            try:
                scheduler.add_job(
                    generate_news_summary,
                    'interval',
                    days=1,
                    id='daily_news_summary',
                    replace_existing=True
                )
                print("已启动每日新闻总结定时任务")
            except Exception as e:
                print(f"启动定时任务失败: {e}")

        return jsonify({
            "status": "success",
            "message": "成功订阅每日新闻总结",
            "next_update": next_update_str
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/unsubscribe-news', methods=['POST'])
def unsubscribe_news():
    """取消订阅每日新闻总结"""
    try:
        data = request.json
        user_id = data.get('user_id')

        if not user_id:
            return jsonify({"status": "error", "message": "用户ID不能为空"}), 400

        # 检查用户是否已订阅
        if user_id in news_subscribers:
            # 标记为未订阅，但保留连接状态
            news_subscribers[user_id]["subscribed"] = False
            print(f"用户 {user_id} 已取消订阅，但保留连接状态")

            # 检查是否还有其他订阅用户
            has_subscribed_users = any(info.get("subscribed", False) for info in news_subscribers.values())

            # 如果没有订阅用户了，移除定时任务
            if not has_subscribed_users:
                try:
                    scheduler.remove_job('daily_news_summary')
                    print("已移除每日新闻总结定时任务")
                except Exception as e:
                    print(f"移除定时任务失败: {e}")
        else:
            return jsonify({"status": "error", "message": "用户未订阅新闻"}), 404

        return jsonify({
            "status": "success",
            "message": "成功取消订阅每日新闻总结"
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/news-status', methods=['GET'])
def get_news_status():
    """获取新闻订阅状态"""
    try:
        user_id = request.args.get('user_id')

        if not user_id:
            return jsonify({"status": "error", "message": "用户ID不能为空"}), 400

        # 检查是否已订阅
        if user_id in news_subscribers and news_subscribers[user_id].get("subscribed", False):
            return jsonify({
                "status": "success",
                "subscribed": True,
                "next_update": news_subscribers[user_id].get("next_update", "明天")
            })
        else:
            return jsonify({
                "status": "success",
                "subscribed": False
            })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/trigger-news-summary', methods=['POST'])
def trigger_news_summary():
    """手动触发新闻总结发送（用于测试）"""
    try:
        # 检查权限（简单实现，实际应加入认证）
        api_key = request.headers.get('X-API-Key')
        if not api_key or api_key != os.environ.get("ADMIN_API_KEY", "test-key"):
            return jsonify({"status": "error", "message": "未授权访问"}), 401

        # 获取查询关键词
        query = request.args.get('query', '')

        # 如果提供了查询参数，则更新全局变量
        global latest_user_message
        if query:
            latest_user_message = query
            print(f"已更新最新用户消息为: {query}")

        # 生成并发送新闻总结
        summary = generate_news_summary()

        return jsonify({
            "status": "success",
            "message": "新闻总结已触发",
            "summary": summary
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# 运行Flask应用
if __name__ == "__main__":
    # 从环境变量中获取端口配置，默认使用5001
    port = int(os.environ.get("PYTHON_API_PORT", 5001))
    print(f"Python API服务正在端口 {port} 上启动")
    app.run(debug=True, host="0.0.0.0", port=port)