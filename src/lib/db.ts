import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

const DB_PATH = path.join(os.homedir(), '.openclaw/workspace/memory/aiko_brain.db');

// Lazy initialization - only create database when accessed
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    // Ensure directory exists
    const fs = require('fs');
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    db = new Database(DB_PATH);
    
    // Enable foreign keys
    db.prepare('PRAGMA foreign_keys = ON').run();

    // Initialize tables if not exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS quests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'todo',
        is_ready INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'medium',
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quest_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'todo',
        is_ready INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        result TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
  }
  return db;
}

// Export a proxy that lazily initializes the database
const dbProxy = new Proxy({} as Database.Database, {
  get(target, prop) {
    return Reflect.get(getDb(), prop);
  }
});

export default dbProxy;
