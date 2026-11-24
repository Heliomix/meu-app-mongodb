const pool = require('./config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('Iniciando seed do banco de dados...');

    // Criar tabelas se não existirem
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

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

      CREATE TABLE IF NOT EXISTS invoice_history (
        id SERIAL PRIMARY KEY,
        supplier_name VARCHAR(100),
        product_name VARCHAR(100) NOT NULL,
        quantity DECIMAL(10,3) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        week_number INTEGER,
        year INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tabelas criadas com sucesso!');

    // Criar hash da senha admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Inserir usuário admin
    const adminResult = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING RETURNING *',
      ['Administrador', 'admin@mayudelvery.com', hashedPassword, 'admin']
    );

    if (adminResult.rows.length > 0) {
      console.log('Usuário admin criado com sucesso!');
    } else {
      console.log('Usuário admin já existe.');
    }

    // Inserir produtos de exemplo
    const products = [
      ['Arroz Integral 1kg', 'unidade', 50, 20, 8.50],
      ['Feijão Preto 1kg', 'unidade', 30, 15, 7.90],
      ['Óleo de Soja 900ml', 'unidade', 40, 20, 6.50],
      ['Macarrão Espaguete 500g', 'unidade', 60, 25, 4.20],
      ['Molho de Tomate 340g', 'unidade', 45, 20, 3.80],
      ['Açúcar Refinado 1kg', 'unidade', 35, 15, 5.60],
      ['Sal Refinado 1kg', 'unidade', 25, 10, 2.50],
      ['Café Torrado 500g', 'unidade', 20, 10, 12.90],
      ['Leite Integral 1L', 'unidade', 100, 50, 4.50],
      ['Farinha de Trigo 1kg', 'unidade', 30, 15, 5.20]
    ];

    let insertedCount = 0;
    for (const product of products) {
      const result = await pool.query(
        'INSERT INTO products (name, unit, current_quantity, min_quantity, last_purchase_price) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        product
      );
      if (result.rowCount > 0) insertedCount++;
    }

    console.log(`${insertedCount} produtos inseridos com sucesso!`);
    console.log('Seed concluído! Você pode fazer login com:');
    console.log('Email: admin@mayudelvery.com');
    console.log('Senha: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar seed:', error);
    process.exit(1);
  }
}

seedDatabase();