
-- Criar tabela de usuários se não existir
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de produtos se não existir
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  unit VARCHAR(20) DEFAULT 'unidade',
  current_quantity DECIMAL(10,3) DEFAULT 0,
  min_quantity DECIMAL(10,3) DEFAULT 10,
  last_purchase_price DECIMAL(10,2) DEFAULT 0,
  category_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de fornecedores se não existir
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(100),
  seller_name VARCHAR(100),
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  email VARCHAR(100),
  cnpj VARCHAR(20),
  address TEXT,
  payment_conditions TEXT,
  delivery_time TEXT,
  observations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário admin (senha: admin123)
INSERT INTO users (name, email, password_hash, role)
VALUES ('Administrador', 'admin@mayudelvery.com', '$2a$10$YourHashedPasswordHere', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Inserir produtos de exemplo
INSERT INTO products (name, unit, current_quantity, min_quantity, last_purchase_price) VALUES
('Arroz Integral 1kg', 'unidade', 50, 20, 8.50),
('Feijão Preto 1kg', 'unidade', 30, 15, 7.90),
('Óleo de Soja 900ml', 'unidade', 40, 20, 6.50),
('Macarrão Espaguete 500g', 'unidade', 60, 25, 4.20),
('Molho de Tomate 340g', 'unidade', 45, 20, 3.80),
('Açúcar Refinado 1kg', 'unidade', 35, 15, 5.60),
('Sal Refinado 1kg', 'unidade', 25, 10, 2.50),
('Café Torrado 500g', 'unidade', 20, 10, 12.90),
('Leite Integral 1L', 'unidade', 100, 50, 4.50),
('Farinha de Trigo 1kg', 'unidade', 30, 15, 5.20)
ON CONFLICT DO NOTHING;
