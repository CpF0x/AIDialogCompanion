import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useUserId(): string {
  const [userId, setUserId] = useState<string>('');
  
  useEffect(() => {
    // 尝试从localStorage获取用户ID
    let storedUserId = localStorage.getItem('user_id');
    
    // 如果没有，生成一个新的并存储
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem('user_id', storedUserId);
    }
    
    setUserId(storedUserId);
  }, []);
  
  return userId;
} 