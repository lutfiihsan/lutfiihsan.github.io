-- Phase B migration: portfolio CMS table
-- Run: wrangler d1 execute myporto-db --remote --file=./worker/migrations/002_portfolio.sql

CREATE TABLE IF NOT EXISTS portfolio (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
