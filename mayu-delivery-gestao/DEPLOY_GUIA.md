# Guia de Deploy - Mayu Delivery Gestão

Este guia vai te ajudar a colocar o sistema no ar para acessar de qualquer lugar.

## Passo 1: Banco de Dados na Nuvem (Neon.tech)

1. Acesse https://neon.tech e crie uma conta gratuita
2. Clique em "Create Project"
3. Dê um nome (ex: `mayu-delivery`)
4. Escolha a região mais próxima (ex: `AWS us-east-1`)
5. Clique em "Create Project"
6. Copie a **Connection String** que aparece (parece com: `postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb`)
7. Substitua as variáveis no seu `.env` do servidor por essa nova string

## Passo 2: Backend no Render.com

1. Acesse https://render.com e crie uma conta
2. Clique em "New +" e selecione "Web Service"
3. Conecte seu repositório GitHub (precisa subir o código primeiro)
4. Configure:
   - **Name:** `mayu-delivery-server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
5. Em "Environment Variables", adicione:
   ```
   PORT=3000
   DATABASE_URL=sua_connection_string_do_neon
   JWT_SECRET=mayu_delivery_super_secret_key_2026_v1_production_ready
   ```
6. Clique em "Create Web Service"

## Passo 3: Frontend na Vercel.com

1. Acesse https://vercel.com e crie uma conta
2. Clique em "Add New..." > "Project"
3. Importe seu repositório GitHub
4. Configure:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Em "Environment Variables", adicione:
   ```
   VITE_API_URL=https://seu-backend.onrender.com
   ```
6. Clique em "Deploy"

## Passo 4: Testar

Após o deploy, acesse o URL fornecido pela Vercel (ex: `https://mayu-delivery.vercel.app`)

## Importante

- O banco de dados Neon precisa ter as tabelas criadas. Use os scripts em `database/` para isso
- O backend no Render leva alguns minutos para iniciar na primeira vez
- Ambos os serviços gratuitos têm limitações de uso, mas são suficientes para testes e produção leve

## Comandos Úteis

Para subir o código para o GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/mayu-delivery.git
git push -u origin main
```