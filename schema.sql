-- Esquema de base de datos para Cloudflare D1
-- Tabla de usuarios que vincula direcciones de wallet con cuentas de Steam

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wallet_address TEXT NOT NULL UNIQUE,
  steam_id TEXT UNIQUE,
  steam_username TEXT,
  steam_avatar TEXT,
  steam_profile_url TEXT,
  trade_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX idx_wallet_address ON users (wallet_address);
CREATE INDEX idx_steam_id ON users (steam_id);

-- Insertar algunos datos de prueba (opcional)
-- INSERT INTO users (wallet_address) VALUES ('0x1234567890abcdef1234567890abcdef12345678');

-- Para ver los datos
-- SELECT * FROM users; 