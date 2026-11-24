MAYU PUSH SUSHI — PACOTE DE CONTINUIDADE v6.9
Data de referência: 23/11/2026

CONTEÚDO DO ZIP
- Dossie_Tecnico_Mayu_Push_Sushi_v6.9.docx: dossiê editável.
- Dossie_Tecnico_Mayu_Push_Sushi_v6.9.pdf: versão para leitura/compartilhamento.
- mayu_schema_snapshot.sql: snapshot técnico das tabelas específicas do Mayu.
- catalogo_seed_resumo.csv: resumo das 182 entradas do catálogo por categoria.
- CODIGO_FONTE_PRODUCAO.txt: links oficiais para os arquivos de código publicados.
- vercel.json: configuração de headers identificada no deployment.

CÓDIGO-FONTE EM PRODUÇÃO
- HTML principal: https://mayu-push-sushi.vercel.app/index.html
- Patch 6.6/6.7/6.8: https://mayu-push-sushi.vercel.app/mayu-patch.js?v=6.8
- Patch 6.9: https://mayu-push-sushi.vercel.app/mayu-patch-69.js?v=6.9
- Service Worker: https://mayu-push-sushi.vercel.app/sw.js
- Manifest: https://mayu-push-sushi.vercel.app/manifest.webmanifest
- Edge Function: https://supabase.com/dashboard/project/vryocmtrksrmhpvulrcm/functions/mayu-admin

IMPORTANTE
1. O ZIP contém todos os documentos técnicos gerados e as referências aos arquivos de produção. Os arquivos HTML/JS de produção não foram copiados fisicamente para este ZIP; os links acima apontam para o deployment atual.
2. Não migrar somente index.html: incluir os dois patches, sw.js e manifest.webmanifest.
3. O app usa Supabase project ref vryocmtrksrmhpvulrcm. A tabela central do inventário é public.mayu_cloud_data, com payload JSONB.
4. Nunca colocar SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SECRET_KEYS no frontend. A chave secreta é usada apenas pela Edge Function.
5. O SQL incluído é um snapshot técnico. Comparar com migrations e ambiente de destino antes de executar.
6. Estado cloud observado: versão 8; 175 produtos, 182 movimentações, 142 fichas Orion, 10 vendas pendentes. Não há fornecedores, pedidos de compra, lotes, vendas importadas ou fichas customizadas no payload consultado.
7. Catálogo inicial embutido no HTML: 182 entradas; payload cloud: 175 produtos. Reconciliar a diferença antes de mesclar.
8. A versão 6.9 introduz deliveryActive, mas a normalização de load() não preserva o campo; corrigir antes de confiar na persistência do arquivamento.
9. A seleção independente de unidade para estoque e quantidade a pedir ainda não está implementada.
10. Fazer backup manual e confirmar sincronização antes de qualquer migração.
