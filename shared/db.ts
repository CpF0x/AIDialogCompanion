import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { users, chats, messages, featureCards } from './schema';
import * as path from 'path';
import * as fs from 'fs';

// 确保数据目录存在
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 连接到SQLite数据库
const dbPath = path.join(dbDir, 'aidialogsqlite.db');
const sqlite = new Database(dbPath);

// 初始化Drizzle ORM
export const db = drizzle(sqlite);

// 自动创建表（简单的migration）
export const initDatabase = () => {
  // 创建用户表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);

  // 创建聊天表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL DEFAULT 'New chat',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 创建消息表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER,
      content TEXT NOT NULL,
      is_user INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT,
      FOREIGN KEY (chat_id) REFERENCES chats(id)
    )
  `);

  // 创建特性卡表
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS feature_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    )
  `);

  console.log('Database initialized successfully.');
}; 