const { connectDB, client } = require('./db');

async function runTest() {
  try {
    await connectDB();

    // Verifica a conexão listando os bancos de dados
    const databases = await client.db().admin().listDatabases();
    console.log('Bancos de dados disponíveis:', databases.databases.map(db => db.name).join(', '));

    console.log('Teste de conexão concluído com sucesso!');
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error('Falha na conexão:', err.message);
    process.exit(1);
  }
}

runTest();