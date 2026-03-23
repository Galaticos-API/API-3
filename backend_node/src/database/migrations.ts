/**
 * migrations.ts
 * Executa com: npm run migrate
 * Cria as tabelas necessárias para autenticação no SQLite.
 */
import db from './db';

function runMigrations(): void {
  // Tabela de usuários
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      role       TEXT    NOT NULL DEFAULT 'analyst',
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Índice para busca por e-mail (login)
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  console.log('✅ Migrations concluídas com sucesso.');
  process.exit(0);
}

runMigrations();
