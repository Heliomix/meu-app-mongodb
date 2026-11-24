const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function createAdmin() {
  try {
    const hash = await bcrypt.hash('admin123', 10);

    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, active)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (email)
       DO UPDATE SET password_hash = $3, name = $1, role = $4`,
      ['Administrador Mayu', 'admin@mayudelvery.com', hash, 'admin']
    );

    console.log('Usuário admin criado/atualizado com sucesso!');
    console.log('Email: admin@mayudelvery.com');
    console.log('Senha: admin123');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao criar usuário:', err.message);
    process.exit(1);
  }
}

createAdmin();