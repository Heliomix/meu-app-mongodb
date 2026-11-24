-- Mayu Delivery Gestão - Schema do Banco de Dados
-- PostgreSQL

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'gerente', 'funcionario')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias de Produtos
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    unit VARCHAR(20) NOT NULL, -- kg, g, l, ml, unid, cx, pct, fardo, garrafa
    current_quantity DECIMAL(10, 3) DEFAULT 0,
    min_quantity DECIMAL(10, 3) DEFAULT 0,
    ideal_quantity DECIMAL(10, 3) DEFAULT 0,
    average_cost DECIMAL(10, 2) DEFAULT 0,
    last_purchase_price DECIMAL(10, 2) DEFAULT 0,
    main_supplier_id INTEGER, -- será referenciado depois
    internal_code VARCHAR(50),
    observations TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    seller_name VARCHAR(100),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    email VARCHAR(100),
    cnpj VARCHAR(18),
    address TEXT,
    payment_conditions TEXT,
    delivery_time TEXT,
    observations TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar referência de fornecedor principal na tabela de produtos
ALTER TABLE products ADD CONSTRAINT fk_main_supplier FOREIGN KEY (main_supplier_id) REFERENCES suppliers(id);

-- Tabela de Movimentações de Estoque
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'saida', 'perda', 'descarte', 'ajuste')),
    quantity DECIMAL(10, 3) NOT NULL,
    reason TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    batch_number VARCHAR(50),
    expiration_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pedidos de Compra
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    status VARCHAR(20) NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'pendente', 'enviado', 'recebido', 'cancelado')),
    total_estimated DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens do Pedido de Compra
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity DECIMAL(10, 3) NOT NULL,
    unit_price DECIMAL(10, 2),
    total_price DECIMAL(10, 2)
);

-- Tabela de Notas Fiscais
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    issue_date DATE NOT NULL,
    total_value DECIMAL(10, 2) NOT NULL,
    file_path TEXT, -- caminho para a imagem/PDF da nota
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'processada', 'cancelada')),
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens da Nota Fiscal
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity DECIMAL(10, 3) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL
);

-- Tabela de Histórico de Preços
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    price DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    invoice_id INTEGER REFERENCES invoices(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir categorias iniciais
INSERT INTO categories (name) VALUES
('Peixes e Similares'),
('Embalagens'),
('Bebidas'),
('Nectar da Serra'),
('Diversos'),
('Mercearia'),
('Oriental'),
('Giosa e Harumaki'),
('Carnes'),
('Limpeza');

-- Inserir produtos iniciais (sem quantidade, preço ou fornecedor)
-- Peixes e Similares
INSERT INTO products (name, category_id, unit) VALUES
('Alho Negro', (SELECT id FROM categories WHERE name = 'Peixes e Similares'), 'unid'),
('Atum', (SELECT id FROM categories WHERE name = 'Peixes e Similares'), 'kg'),
('Camarão 41/50 - Sushi e Fry', (SELECT id FROM categories WHERE name = 'Peixes e Similares'), 'kg'),
('Camarão 61/70 - Ebi Roll', (SELECT id FROM categories WHERE name = 'Peixes e Similares'), 'kg'),
('Camarão VG 16/20', (SELECT id FROM categories WHERE name = 'Peixes e Similares'), 'kg'),
('Dourado', (SELECT id FROM categories WHERE name = 'Peixes e Similares'), 'kg'),
('Haddock Carpaccio', (SELECT id FROM categories WHERE name = 'Peixes e Similares'), 'kg'),
('Haddock Lombo', (SELECT id FROM categories WHERE name = 'Peixes e Similares'), 'kg'),
('Kani', (SELECT id FROM categories WHERE name = 'Peixes e Similares'), 'unid'),
('Ovas Massago Black', (SELECT id FROM categories WHERE name = 'Peixes e Similares'), 'g'),
('Ovas Massago Laranja', (SELECT id FROM categories WHERE name = 'Peixes e Similares'), 'g'),
('Polvo', (SELECT id FROM categories WHERE name = 'Peixes e Similares'), 'kg'),
('Salmão', (SELECT id FROM categories WHERE name = 'Peixes e Similares'), 'kg'),
('Tilápia', (SELECT id FROM categories WHERE name = 'Peixes e Similares'), 'kg'),
('Wakame', (SELECT id FROM categories WHERE name = 'Peixes e Similares'), 'g');

-- Embalagens
INSERT INTO products (name, category_id, unit) VALUES
('Embalagem Mini 00', (SELECT id FROM categories WHERE name = 'Embalagens'), 'unid'),
('Embalagem 00', (SELECT id FROM categories WHERE name = 'Embalagens'), 'unid'),
('Embalagem 02', (SELECT id FROM categories WHERE name = 'Embalagens'), 'unid'),
('Embalagem 03', (SELECT id FROM categories WHERE name = 'Embalagens'), 'unid'),
('Embalagem Bento Rasa', (SELECT id FROM categories WHERE name = 'Embalagens'), 'unid'),
('Embalagem Fry', (SELECT id FROM categories WHERE name = 'Embalagens'), 'unid'),
('Embalagem Harumaki', (SELECT id FROM categories WHERE name = 'Embalagens'), 'unid'),
('Embalagem para Ceviche', (SELECT id FROM categories WHERE name = 'Embalagens'), 'unid'),
('Embalagem para Poke', (SELECT id FROM categories WHERE name = 'Embalagens'), 'unid'),
('Embalagem Shimeji', (SELECT id FROM categories WHERE name = 'Embalagens'), 'unid'),
('Embalagem Yakissoba', (SELECT id FROM categories WHERE name = 'Embalagens'), 'unid'),
('Nozoki', (SELECT id FROM categories WHERE name = 'Embalagens'), 'unid'),
('Pote para Molho', (SELECT id FROM categories WHERE name = 'Embalagens'), 'unid'),
('Pote para Sopa', (SELECT id FROM categories WHERE name = 'Embalagens'), 'unid'),
('Temakeira Retangular', (SELECT id FROM categories WHERE name = 'Embalagens'), 'unid');

-- Bebidas
INSERT INTO products (name, category_id, unit) VALUES
('Água com Gás', (SELECT id FROM categories WHERE name = 'Bebidas'), 'unid'),
('Cerveja', (SELECT id FROM categories WHERE name = 'Bebidas'), 'unid'),
('Coca-Cola Normal', (SELECT id FROM categories WHERE name = 'Bebidas'), 'unid'),
('Coca-Cola Zero', (SELECT id FROM categories WHERE name = 'Bebidas'), 'unid'),
('Guaraná Normal', (SELECT id FROM categories WHERE name = 'Bebidas'), 'unid'),
('Guaraná Zero', (SELECT id FROM categories WHERE name = 'Bebidas'), 'unid'),
('Saquê Azuma Kirin', (SELECT id FROM categories WHERE name = 'Bebidas'), 'unid'),
('Suco Pêssego', (SELECT id FROM categories WHERE name = 'Bebidas'), 'unid'),
('Suco Uva', (SELECT id FROM categories WHERE name = 'Bebidas'), 'unid'),
('Vinho Branco', (SELECT id FROM categories WHERE name = 'Bebidas'), 'unid'),
('Vinho Rosé', (SELECT id FROM categories WHERE name = 'Bebidas'), 'unid'),
('Vinho Tinto', (SELECT id FROM categories WHERE name = 'Bebidas'), 'unid');

-- Nectar da Serra
INSERT INTO products (name, category_id, unit) VALUES
('Brownie', (SELECT id FROM categories WHERE name = 'Nectar da Serra'), 'unid'),
('Farofa', (SELECT id FROM categories WHERE name = 'Nectar da Serra'), 'unid'),
('Ganache', (SELECT id FROM categories WHERE name = 'Nectar da Serra'), 'unid');

-- Diversos
INSERT INTO products (name, category_id, unit) VALUES
('Bobina Impressora', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Bobina Picotada 20x35', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Bobina Picotada 30x40', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Bobina Picotada 40x60', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Durex 18mm', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Durex 45mm', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Espeto de Bambu', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Etiqueta Manual', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Faca Descartável', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Garfo Descartável', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Grampo de Grampeador', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Perfex', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('PVC Filme', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Saco para Molho Delivery', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Sacola Grande 40x50', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Sacola Pequena 35x48', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Touca Descartável', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Hashi Mayu', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Saco Papel Grande', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Saco Papel Pequeno', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid'),
('Colher para Sobremesa', (SELECT id FROM categories WHERE name = 'Diversos'), 'unid');

-- Mercearia
INSERT INTO products (name, category_id, unit) VALUES
('Açucar Cristal', (SELECT id FROM categories WHERE name = 'Mercearia'), 'kg'),
('Açucar Refinado', (SELECT id FROM categories WHERE name = 'Mercearia'), 'kg'),
('Amido de Milho', (SELECT id FROM categories WHERE name = 'Mercearia'), 'kg'),
('Arroz Branco', (SELECT id FROM categories WHERE name = 'Mercearia'), 'kg'),
('Azeite Extra Virgem', (SELECT id FROM categories WHERE name = 'Mercearia'), 'ml'),
('Colorau', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Cream Cheese', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Creme de Leite Fresco', (SELECT id FROM categories WHERE name = 'Mercearia'), 'ml'),
('Farinha de Mandioca', (SELECT id FROM categories WHERE name = 'Mercearia'), 'kg'),
('Farinha de Trigo', (SELECT id FROM categories WHERE name = 'Mercearia'), 'kg'),
('Feijão', (SELECT id FROM categories WHERE name = 'Mercearia'), 'kg'),
('Flocos de Arroz', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Flor de Sal', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Folha de Louro', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Fubá', (SELECT id FROM categories WHERE name = 'Mercearia'), 'kg'),
('Leite de Coco', (SELECT id FROM categories WHERE name = 'Mercearia'), 'ml'),
('Leite Integral', (SELECT id FROM categories WHERE name = 'Mercearia'), 'l'),
('Macarrão Espaguete', (SELECT id FROM categories WHERE name = 'Mercearia'), 'unid'),
('Manteiga', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Mel', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Melado de Cana', (SELECT id FROM categories WHERE name = 'Mercearia'), 'ml'),
('Molho de Tomate', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Mostarda Amarela', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Óleo de Soja', (SELECT id FROM categories WHERE name = 'Mercearia'), 'ml'),
('Orégano', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Palmito', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Páprica Picante', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Pó de Café', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Queijo Coalho', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Sal Fino', (SELECT id FROM categories WHERE name = 'Mercearia'), 'kg'),
('Sal Grosso', (SELECT id FROM categories WHERE name = 'Mercearia'), 'kg'),
('Shimeji Escuro', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Shitake', (SELECT id FROM categories WHERE name = 'Mercearia'), 'g'),
('Vinagre Branco', (SELECT id FROM categories WHERE name = 'Mercearia'), 'ml');

-- Oriental
INSERT INTO products (name, category_id, unit) VALUES
('Ajinomoto', (SELECT id FROM categories WHERE name = 'Oriental'), 'g'),
('Arroz Japonês', (SELECT id FROM categories WHERE name = 'Oriental'), 'kg'),
('Azeite Trufado Colitali', (SELECT id FROM categories WHERE name = 'Oriental'), 'ml'),
('Azeite Trufado La Pastina', (SELECT id FROM categories WHERE name = 'Oriental'), 'ml'),
('Corante San-Ei Vermelho', (SELECT id FROM categories WHERE name = 'Oriental'), 'ml'),
('Edamame', (SELECT id FROM categories WHERE name = 'Oriental'), 'g'),
('Farinha Panko', (SELECT id FROM categories WHERE name = 'Oriental'), 'g'),
('Gás para Maçarico', (SELECT id FROM categories WHERE name = 'Oriental'), 'unid'),
('Gengibre em Conserva', (SELECT id FROM categories WHERE name = 'Oriental'), 'g'),
('Gergelim Branco', (SELECT id FROM categories WHERE name = 'Oriental'), 'g'),
('Gergelim Preto', (SELECT id FROM categories WHERE name = 'Oriental'), 'g'),
('Hondashi', (SELECT id FROM categories WHERE name = 'Oriental'), 'g'),
('Massa para Yakissoba', (SELECT id FROM categories WHERE name = 'Oriental'), 'unid'),
('Molho de Ostra', (SELECT id FROM categories WHERE name = 'Oriental'), 'ml'),
('Nori', (SELECT id FROM categories WHERE name = 'Oriental'), 'unid'),
('Óleo de Gergelim', (SELECT id FROM categories WHERE name = 'Oriental'), 'ml'),
('Pasta Misso', (SELECT id FROM categories WHERE name = 'Oriental'), 'g'),
('Pimenta Sriracha', (SELECT id FROM categories WHERE name = 'Oriental'), 'ml'),
('Pimenta Tabasco', (SELECT id FROM categories WHERE name = 'Oriental'), 'ml'),
('Pimenta Togarashi', (SELECT id FROM categories WHERE name = 'Oriental'), 'g'),
('Saquê Culinário', (SELECT id FROM categories WHERE name = 'Oriental'), 'ml'),
('Shoyu Sachê', (SELECT id FROM categories WHERE name = 'Oriental'), 'unid'),
('Shoyu Tradicional', (SELECT id FROM categories WHERE name = 'Oriental'), 'ml'),
('Sweet Chilli', (SELECT id FROM categories WHERE name = 'Oriental'), 'ml'),
('Tempero para Sushi', (SELECT id FROM categories WHERE name = 'Oriental'), 'g'),
('Tofu', (SELECT id FROM categories WHERE name = 'Oriental'), 'g'),
('Tonkatsu', (SELECT id FROM categories WHERE name = 'Oriental'), 'ml'),
('Wasabi', (SELECT id FROM categories WHERE name = 'Oriental'), 'g');

-- Giosa e Harumaki
INSERT INTO products (name, category_id, unit) VALUES
('Giosa', (SELECT id FROM categories WHERE name = 'Giosa e Harumaki'), 'unid'),
('Harumaki Camarão', (SELECT id FROM categories WHERE name = 'Giosa e Harumaki'), 'unid'),
('Harumaki Frango', (SELECT id FROM categories WHERE name = 'Giosa e Harumaki'), 'unid'),
('Harumaki Legumes', (SELECT id FROM categories WHERE name = 'Giosa e Harumaki'), 'unid');

-- Carnes
INSERT INTO products (name, category_id, unit) VALUES
('Contra Filé', (SELECT id FROM categories WHERE name = 'Carnes'), 'kg'),
('Filé Mignon', (SELECT id FROM categories WHERE name = 'Carnes'), 'kg'),
('Peito de Frango', (SELECT id FROM categories WHERE name = 'Carnes'), 'kg');

-- Limpeza
INSERT INTO products (name, category_id, unit) VALUES
('Bucha Amarela', (SELECT id FROM categories WHERE name = 'Limpeza'), 'unid'),
('Bucha Verde Grossa', (SELECT id FROM categories WHERE name = 'Limpeza'), 'unid'),
('Desincrustante', (SELECT id FROM categories WHERE name = 'Limpeza'), 'l'),
('Desinfetante', (SELECT id FROM categories WHERE name = 'Limpeza'), 'l'),
('Detergente Neutro', (SELECT id FROM categories WHERE name = 'Limpeza'), 'l'),
('Limpa Inox', (SELECT id FROM categories WHERE name = 'Limpeza'), 'l'),
('Luva G', (SELECT id FROM categories WHERE name = 'Limpeza'), 'par'),
('Luva M', (SELECT id FROM categories WHERE name = 'Limpeza'), 'par'),
('Multiuso com Cloro', (SELECT id FROM categories WHERE name = 'Limpeza'), 'l'),
('Multiuso Comum', (SELECT id FROM categories WHERE name = 'Limpeza'), 'l'),
('Pano de Chão', (SELECT id FROM categories WHERE name = 'Limpeza'), 'unid'),
('Papel Toalha Cozinha', (SELECT id FROM categories WHERE name = 'Limpeza'), 'unid'),
('Papel Toalha Funcionário', (SELECT id FROM categories WHERE name = 'Limpeza'), 'unid'),
('Rodo', (SELECT id FROM categories WHERE name = 'Limpeza'), 'unid'),
('Saco de Lixo 100 LT', (SELECT id FROM categories WHERE name = 'Limpeza'), 'unid'),
('Saco de Lixo 200 LT', (SELECT id FROM categories WHERE name = 'Limpeza'), 'unid'),
('Vassoura', (SELECT id FROM categories WHERE name = 'Limpeza'), 'unid'),
('Álcool Líquido', (SELECT id FROM categories WHERE name = 'Limpeza'), 'l');

-- Inserir usuário administrador padrão (senha: admin123)
-- O hash deve ser gerado com bcrypt na aplicação real
INSERT INTO users (name, email, password_hash, role) VALUES
('Administrador', 'admin@mayudelvery.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNim1dMV6/I0bxO8YQS', 'admin');