import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DB_PATH = process.env.DATABASE_PATH ?? './database/api3.db';
const resolvedPath = path.resolve(DB_PATH);

// Conexão singleton — better-sqlite3 é síncrono e seguro para SQLite
const db = new Database(resolvedPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
});

// Habilita WAL mode para melhor performance de leitura/escrita concorrente
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export default db;
