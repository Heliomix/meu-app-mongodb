const { connectDB, client } = require('./db');

async function exemploDeUso() {
  try {
    // 1. Conecta ao banco de dados
    await connectDB();

    // 2. Seleciona o banco de dados e a coleção (tabela)
    // O MongoDB cria o banco e a coleção automaticamente se não existirem
    const db = client.db('meu_projeto');
    const collection = db.collection('usuarios');

    // 3. Insere um documento de exemplo
    const novoUsuario = { nome: 'Helio', email: 'yurimix2@gmail.com', cargo: 'Desenvolvedor' };
    const resultadoInsercao = await collection.insertOne(novoUsuario);
    console.log('✅ Usuário inserido com ID:', resultadoInsercao.insertedId);

    // 4. Busca o documento que acabamos de inserir
    const usuarioEncontrado = await collection.findOne({ email: 'yurimix2@gmail.com' });
    console.log('✅ Usuário encontrado no banco:', usuarioEncontrado);

    console.log('\n🎉 Exemplo de uso concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a operação:', error);
  } finally {
    // 5. Fecha a conexão de forma segura ao final
    await client.close();
  }
}

exemploDeUso();