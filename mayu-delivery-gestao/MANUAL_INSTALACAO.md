# Manual de Instalação - Mayu Delivery Gestão

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- Node.js (versão 18 ou superior)
- PostgreSQL (versão 14 ou superior)
- Git (opcional, para versionamento)

## Passo 1: Configuração do Banco de Dados

1. Instale o PostgreSQL em seu computador Windows:
   - Baixe o instalador em https://www.postgresql.org/download/windows/
   - Execute o instalador e siga as instruções
   - Anote a senha do usuário postgres

2. Crie o banco de dados:
   ```sql
   -- Acesse o PostgreSQL via pgAdmin ou linha de comando
   CREATE DATABASE mayu_delivery;
   
   -- Execute o script de criação das tabelas
   \i database/schema.sql
   ```

3. Configure as credenciais no arquivo `.env`:
   - Edite o arquivo `server/.env`
   - Atualize as variáveis DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASSWORD

## Passo 2: Configuração do Backend

1. Abra o terminal na pasta do projeto:
   ```powershell
   cd C:\Users\helio\Claude-Projetos\mayu-delivery-gestao\server
   ```

2. Instale as dependências:
   ```powershell
   npm install
   ```

3. Inicie o servidor:
   ```powershell
   npm run dev
   ```

   O servidor iniciará na porta 3000: http://localhost:3000

## Passo 3: Configuração do Frontend

1. Abra um novo terminal na pasta do cliente:
   ```powershell
   cd C:\Users\helio\Claude-Projetos\mayu-delivery-gestao\client
   ```

2. Instale as dependências:
   ```powershell
   npm install
   ```

3. Inicie o aplicativo:
   ```powershell
   npm run dev
   ```

   O frontend iniciará na porta 5173: http://localhost:5173

## Passo 4: Acesso ao Sistema

1. Abra o navegador e acesse: http://localhost:5173
2. Faça login com as credenciais padrão:
   - Email: admin@mayudelvery.com
   - Senha: admin123

## Acesso pelo Celular (na mesma rede)

1. Descubra o IP do seu computador Windows:
   ```powershell
   ipconfig
   ```
   Procure por "Endereço IPv4"

2. No celular, acesse:
   ```
   http://SEU_IP:5173
   ```
   Substitua SEU_IP pelo endereço encontrado

## Backup do Banco de Dados

Para fazer backup dos dados:
```powershell
pg_dump -U postgres mayu_delivery > backup_mayu_delivery.sql
```

Para restaurar:
```powershell
psql -U postgres mayu_delivery < backup_mayu_delivery.sql
```

## Solução de Problemas

### Erro de conexão com o banco de dados
- Verifique se o PostgreSQL está em execução
- Confirme as credenciais no arquivo server/.env
- Certifique-se de que o banco de dados 'mayu_delivery' foi criado

### Porta já em uso
- Altere a porta no arquivo server/.env (variável PORT)
- Ou encerre o processo que está usando a porta:
  ```powershell
  netstat -ano | findstr :3000
  taskkill /PID [NUMERO_DO_PID] /F
  ```

### Erro de CORS
- Certifique-se de que o backend está rodando
- Verifique se o frontend está apontando para a URL correta do backend

## Estrutura do Projeto

```
mayu-delivery-gestao/
├── database/
│   └── schema.sql          # Script do banco de dados
├── server/
│   ├── config/
│   │   └── database.js     # Configuração do PostgreSQL
│   ├── middleware/
│   │   └── auth.js         # Autenticação JWT
│   ├── routes/
│   │   ├── auth.js         # Rotas de autenticação
│   │   ├── products.js     # Rotas de produtos
│   │   ├── categories.js   # Rotas de categorias
│   │   ├── suppliers.js    # Rotas de fornecedores
│   │   ├── stock.js        # Rotas de estoque
│   │   ├── purchaseOrders.js # Rotas de pedidos
│   │   ├── invoices.js     # Rotas de notas fiscais
│   │   ├── dashboard.js    # Rotas do dashboard
│   │   └── users.js        # Rotas de usuários
│   ├── .env                # Variáveis de ambiente
│   └── index.js            # Servidor Express
└── client/
    ├── src/
    │   ├── components/
    │   │   └── Sidebar.jsx # Menu lateral
    │   ├── pages/
    │   │   ├── Login.jsx   # Tela de login
    │   │   ├── Dashboard.jsx # Dashboard
    │   │   ├── Products.jsx # Produtos
    │   │   ├── Stock.jsx   # Estoque
    │   │   ├── PurchaseOrders.jsx # Pedidos
    │   │   └── Suppliers.jsx # Fornecedores
    │   ├── App.jsx         # Componente principal
    │   ├── App.css         # Estilos globais
    │   ├── index.css       # Estilos base
    │   └── main.jsx        # Ponto de entrada React
    └── vite.config.js      # Configuração do Vite
```

## Próximos Passos

A Etapa 1 está completa! Nas próximas etapas, implementaremos:
- Etapa 2: Movimentações de estoque avançadas
- Etapa 3: Comparação de preços entre fornecedores
- Etapa 4: Leitura de notas fiscais via OCR
- Etapa 5: Relatórios e permissões avançadas