# Como Colocar seu Aplicativo Online

Seu aplicativo já está pronto e funcionando localmente! Para acessá-lo de qualquer lugar, você precisa hospedá-lo na nuvem. Aqui estão as opções mais fáceis e gratuitas:

## Opção 1: Render.com (Recomendado - Mais Fácil)

O Render é perfeito para projetos Node.js e se conecta diretamente ao seu GitHub.

1. **Crie uma conta** em [render.com](https://render.com/) (pode usar o GitHub).
2. **Suba seu código** para o GitHub (se ainda não fez):
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin master
   ```
3. No painel do Render, clique em **"New +"** e selecione **"Web Service"**.
4. Conecte seu repositório do GitHub.
5. Preencha os dados:
   - **Name**: `meu-app-mongodb` (ou outro nome)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Clique em **"Advanced"** e adicione a variável de ambiente:
   - **Key**: `MONGODB_URI`
   - **Value**: `mongodb+srv://yurimix2_db_user:IutxcmAVDBntq2Fu@mayu.udobfo0.mongodb.net/?retryWrites=true&w=majority`
7. Clique em **"Create Web Service"**.

Pronto! Em alguns minutos, o Render te dará um link como `https://meu-app-mongodb.onrender.com` que funciona de qualquer lugar.

## Opção 2: Vercel + MongoDB Atlas

A Vercel é ótima para APIs e tem integração excelente.

1. Crie uma conta em [vercel.com](https://vercel.com/).
2. Instale a CLI: `npm install -g vercel`
3. Na pasta do projeto, execute: `vercel --prod`
4. Siga as instruções na tela e adicione a variável `MONGODB_URI` quando solicitado.

## Endpoints da sua API

Uma vez online, você poderá acessar sua API através dos seguintes endpoints:

- **GET /** - Informações gerais da API
- **GET /api/usuarios** - Lista todos os usuários cadastrados
- **POST /api/usuarios** - Cria um novo usuário (envie JSON com `nome` e `email`)
- **GET /api/usuarios/:id** - Busca um usuário específico pelo ID

## Testando sua API Online

Você pode testar usando qualquer navegador ou ferramentas como Postman:
```
https://seu-link-do-render.onrender.com/api/usuarios
```

## Segurança Importante

⚠️ **Nunca compartilhe seu arquivo `.env` publicamente.** Ele contém a senha do seu banco de dados. Ao usar serviços como Render ou Vercel, adicione sempre as variáveis de ambiente no painel deles, nunca no código.

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>