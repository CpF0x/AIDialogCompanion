import { useState, useEffect, useRef, useCallback } from 'react';

export default function useWebSocket(userId: string | number) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  
  // 建立WebSocket连接
  useEffect(() => {
    // 确保有用户ID
    if (!userId) return;
    
    // 确定WebSocket URL - 修改为实际服务器地址
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws?userId=${userId}`;
    
    console.log(`尝试连接WebSocket: ${wsUrl}`);
    
    // 创建WebSocket连接
    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // 事件处理
      socket.onopen = () => {
        console.log('WebSocket连接已建立');
        setConnected(true);
      };
      
      socket.onmessage = (event) => {
        console.log('收到WebSocket消息:', event.data);
        setLastMessage(event);
      };
      
      socket.onclose = () => {
        console.log('WebSocket连接已关闭');
        setConnected(false);
        
        // 尝试重新连接
        setTimeout(() => {
          console.log('尝试重新连接WebSocket...');
          setConnected(false);
          // 实际重连逻辑会在下一个useEffect周期执行
        }, 5000);
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket错误:', error);
      };
      
      // 清理函数
      return () => {
        console.log('清理WebSocket连接');
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    } catch (error) {
      console.error('创建WebSocket连接失败:', error);
    }
  }, [userId, connected]);
  
  // 发送消息方法
  const sendMessage = useCallback((message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.error('WebSocket未连接，无法发送消息');
      // 尝试重新连接
      setConnected(false);
    }
  }, []);
  
  return { connected, lastMessage, sendMessage };
} 