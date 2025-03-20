import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { NewspaperIcon, BellIcon, BellOffIcon } from "lucide-react";
import useWebSocket from '@/lib/useWebSocket';
import { useUserId } from '@/lib/useUserId';
import { Input } from "@/components/ui/input";

export default function NewsSubscription() {
  const [subscribed, setSubscribed] = useState(false);
  const [nextUpdate, setNextUpdate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newsSummary, setNewsSummary] = useState<string | null>(null);
  const [newsKeyword, setNewsKeyword] = useState<string>('');
  const userId = useUserId();
  const { sendMessage, lastMessage } = useWebSocket(userId);

  // 处理WebSocket消息
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        console.log('收到WebSocket消息:', data);
        
        // 处理连接确认
        if (data.type === 'connection' && data.status === 'connected') {
          // 请求订阅状态信息
          fetch(`/api/news-status?user_id=${userId}`)
            .then(res => res.json())
            .then(result => {
              if (result.status === 'success') {
                setSubscribed(result.subscribed);
                if (result.subscribed) {
                  setNextUpdate(result.next_update);
                }
              }
            });
        }
        
        // 处理订阅响应
        else if (data.type === 'news_subscription') {
          setLoading(false);
          if (data.status === 'success') {
            setSubscribed(true);
            setNextUpdate(data.next_update);
            alert("订阅成功：" + data.message);
          } else {
            alert("订阅失败：" + data.message);
          }
        }
        
        // 处理取消订阅响应
        else if (data.type === 'news_unsubscription') {
          setLoading(false);
          if (data.status === 'success') {
            setSubscribed(false);
            setNextUpdate(null);
            alert("已取消订阅");
          } else {
            alert("取消订阅失败：" + data.message);
          }
        }
        
        // 处理定时新闻消息
        else if (data.type === 'scheduled_news') {
          // 显示新闻总结通知
          alert("每日新闻总结已送达");
          // 保存新闻总结内容
          setNewsSummary(data.content);
          
          // 这里可以更新下一次更新时间
          const nextDay = new Date();
          nextDay.setDate(nextDay.getDate() + 1);
          setNextUpdate(nextDay.toLocaleString());
        }
      } catch (error) {
        console.error('处理WebSocket消息失败:', error);
      }
    }
  }, [lastMessage, userId]);

  // 订阅/取消订阅新闻
  const toggleSubscription = () => {
    setLoading(true);
    if (subscribed) {
      // 发送取消订阅请求
      sendMessage(JSON.stringify({
        type: 'unsubscribe_news'
      }));
    } else {
      // 发送订阅请求
      sendMessage(JSON.stringify({
        type: 'subscribe_news'
      }));
    }
  };

  // 手动测试获取新闻总结
  const testNewsUpdate = () => {
    if (!subscribed) {
      alert("请先订阅新闻服务");
      return;
    }
    
    setLoading(true);
    // 发送测试请求
    fetch(`http://localhost:5001/api/trigger-news-summary?query=${encodeURIComponent(newsKeyword)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'test-key'
      }
    })
    .then(res => res.json())
    .then(data => {
      setLoading(false);
      if (data.status === 'success') {
        alert("测试成功：请等待新闻总结推送");
      } else {
        alert("测试失败：" + data.message);
      }
    })
    .catch(err => {
      setLoading(false);
      alert("请求错误：" + err.message);
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center">
          <NewspaperIcon className="mr-2 h-5 w-5 text-orange-500" />
          <CardTitle>每日新闻总结</CardTitle>
        </div>
        <CardDescription>
          订阅每日新闻自动总结，每天为您推送重要新闻概要
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          {subscribed ? (
            <div className="flex items-center text-green-600">
              <BellIcon className="mr-2 h-4 w-4" />
              <p>您已订阅每日新闻总结</p>
            </div>
          ) : (
            <div className="flex items-center text-gray-500">
              <BellOffIcon className="mr-2 h-4 w-4" />
              <p>您尚未订阅每日新闻总结</p>
            </div>
          )}
          
          {nextUpdate && (
            <p className="mt-2 text-xs text-gray-500">
              下一次更新: {nextUpdate}
            </p>
          )}
          
          <div className="mt-4 flex gap-2">
            <Input 
              placeholder="输入新闻关键词"
              value={newsKeyword}
              onChange={(e) => setNewsKeyword(e.target.value)}
              className="flex-grow"
            />
            <Button 
              onClick={toggleSubscription} 
              disabled={loading}
              variant={subscribed ? "destructive" : "default"}
              size="sm"
            >
              {subscribed ? "取消订阅" : "订阅"}
            </Button>
            {subscribed && (
              <Button 
                onClick={testNewsUpdate} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                测试推送
              </Button>
            )}
          </div>
          
          {newsSummary && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium mb-2">最新新闻总结:</h3>
              <p className="text-xs whitespace-pre-wrap text-gray-700">{newsSummary}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 