# Auditoria da Fundacao V1 Real - Sistema Comercial Ketri

## 1. O que esta bem construido

### Estrutura Next.js

- A base do projeto esta correta para uma V1 em Next.js com App Router: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts` e `postcss.config.mjs`.
- O projeto ja nasce com TypeScript estrito (`strict: true`), o que ajuda a evitar crescimento desorganizado quando entrar Supabase real.
- A tela inicial cobre as cinco areas definitivas definidas para a V1: Hoje, Clientes, Produtos, Orcamentos e Administracao.
- A aplicacao esta simples o suficiente para validar fluxo comercial antes de espalhar complexidade por varias rotas.

### TypeScript

- Existem tipos de dominio separados em `lib/types.ts`, cobrindo usuarios, clientes, produtos, orcamentos, itens de orcamento e atividades.
- A modelagem TypeScript respeita uma regra importante: lead nao e entidade separada, e sim status de `Client`.
- Os tipos ja expressam bem a logica de Admin/Vendedor, status de cliente, status de orcamento e tipos de atividade.

### Tailwind

- Tailwind esta configurado corretamente para `app`, `components` e `lib`.
- A paleta customizada e simples e suficiente para uma ferramenta comercial.
- A interface usa layout responsivo basico, com menu adaptavel e tabela de produtos com rolagem horizontal.

### Organizacao atual

- `lib/demo-data.ts` concentra dados de demonstracao.
- `lib/supabase.ts` concentra a inicializacao do cliente Supabase.
- `lib/format.ts` concentra formatacao de moeda e data.
- Essa separacao inicial e boa para a proxima etapa, porque permite trocar mock por consultas reais sem reescrever toda a tela.

### Modelagem funcional

- Cliente esta no centro do fluxo.
- Orcamentos pertencem a clientes.
- Itens de orcamento pertencem a orcamentos e apontam para produtos.
- Produtos usam base unica.
- Atividades pertencem a clientes e vendedores.
- A arquitetura suporta Admin + 2 vendedores inicialmente e tambem mais vendedores no futuro, desde que a origem passe a ser o Supabase.

## 2. O que precisa corrigir antes de continuar

### Componentizacao

- `app/page.tsx` concentra quase toda a aplicacao: estado, login, navegacao, filtros e todas as telas.
- Antes de conectar dados reais, vale separar em componentes menores:
  - `components/AppShell.tsx`
  - `components/TodayView.tsx`
  - `components/ClientsView.tsx`
  - `components/ProductsView.tsx`
  - `components/QuotesView.tsx`
  - `components/AdminView.tsx`
- Isso reduz risco quando entra Supabase, formularios, estados de carregamento e erros.

### Login Admin/Vendedor

- O login atual autentica com Supabase se houver variaveis, mas o perfil visual Admin/Vendedor ainda e controlado por botoes locais.
- Isso e bom para demonstracao, mas nao pode seguir para producao assim.
- A funcao real precisa buscar `profiles.role` apos login e bloquear a troca manual de papel.
- O seletor de vendedor deve existir apenas para Admin; vendedor autenticado deve ficar preso ao proprio `auth.uid()`.

### Separacao entre mock e real

- A tela importa diretamente `clients`, `products`, `quotes`, `activities` e `users` de `lib/demo-data.ts`.
- Para a proxima etapa, crie uma camada intermediaria, por exemplo:
  - `lib/repositories/clients.ts`
  - `lib/repositories/products.ts`
  - `lib/repositories/quotes.ts`
  - `lib/repositories/activities.ts`
- Assim, a UI nao precisa saber se os dados vem de mock ou Supabase.

### Compatibilidade entre TypeScript e Supabase

- Os tipos da aplicacao usam camelCase (`contactName`, `sellerId`, `createdAt`).
- O schema Supabase usa snake_case (`contact_name`, `seller_id`, `created_at`).
- Antes da conexao real, e preciso decidir entre:
  - criar mapeadores de snake_case para camelCase; ou
  - gerar tipos Supabase e usar os nomes do banco na camada de dados.
- Sem essa decisao, a conexao real tende a gerar duplicacao e bugs silenciosos.

### Validacao de ambiente

- `lib/supabase.ts` retorna `null` se faltam variaveis. Para demonstracao isso e aceitavel.
- Para producao, deve haver uma checagem explicita de configuracao e uma mensagem operacional clara.
- Tambem falta separar cliente Supabase de browser e cliente de servidor, caso a V1 passe a usar Server Components, middleware ou rotas protegidas.

## 3. O que pode ficar para depois

- Criar multiplas rotas para cada tela. A V1 pode continuar em uma tela unica por enquanto.
- Dashboard gerencial mais completo.
- Funil comercial avancado.
- Historico detalhado de alteracoes por usuario.
- Permissoes granulares alem de Admin/Vendedor.
- Automacoes de follow-up.
- Relatorios de venda, metas e conversao.
- Integracao com WhatsApp, email ou ERP.
- Edicao completa de cadastro de produtos pela interface. Na V1, importacao e manutencao simples ja bastam.

## 4. Riscos do schema Supabase

### Tipos enum podem ficar rigidos cedo demais

- `client_status`, `quote_status` e `activity_type` como enums funcionam para V1.
- O risco e precisar alterar status comerciais com frequencia. Alterar enum no Postgres e possivel, mas menos flexivel que uma tabela de configuracao.
- Para a V1, pode manter. Para evolucao comercial, considere tabelas auxiliares de status.

### `potential` e `stock_status` estao como `text`

- No TypeScript, `potential` e `stockStatus` sao valores fechados.
- No banco, `potential` e `stock_status` aceitam qualquer texto.
- Isso pode gerar dados invalidos na importacao ou em futuros formularios.

### Falta `updated_at` automatico

- Algumas tabelas tem `updated_at`, mas nao ha trigger para atualizar esse campo automaticamente.
- Isso afeta auditoria, ordenacao e sincronizacao futura.

### Relacao entre quote e client pode permitir inconsistencia

- `quotes` tem `client_id` e `seller_id`.
- Nada garante que `quotes.seller_id` seja igual ao `clients.seller_id`.
- Um vendedor poderia, dependendo das politicas e inserts, criar orcamento em cliente de outro vendedor se o `seller_id` do orcamento for o dele e o `client_id` apontar para outro cliente.

### Produtos sem campos de importacao

- A tabela `products` tem o essencial, mas a futura importacao real da Ketri pode precisar de:
  - codigo original da planilha ou sistema anterior;
  - descricao;
  - unidade;
  - custo;
  - preco promocional;
  - dimensoes/variacoes;
  - data da ultima importacao;
  - campo para inativar sem apagar.
- `active` ja existe e ajuda, mas faltam campos de rastreio.

### Ausencia de indices

- O schema nao cria indices para consultas frequentes:
  - `clients.seller_id`
  - `clients.status`
  - `quotes.client_id`
  - `quotes.seller_id`
  - `activities.seller_id`
  - `activities.due_at`
  - `quote_items.quote_id`
- Com poucos usuarios nao sera problema, mas deve ser corrigido antes de crescer.

## 5. Riscos de seguranca/RLS

### Funcao `current_user_role()` precisa endurecimento

- A funcao e `security definer`, o que e comum para consultar perfil em RLS.
- Falta declarar comportamento seguro quando nao houver perfil.
- Tambem vale garantir ownership correto da funcao no Supabase e evitar que usuarios comuns possam altera-la.

### Politicas `for all` misturam operacoes

- Algumas politicas usam `for all`.
- Para producao, e mais seguro separar `select`, `insert`, `update` e `delete`.
- Isso evita liberar delete sem perceber e facilita revisar comportamento por acao.

### Admin gerenciando profiles

- A policy `admin manages profiles` depende de `current_user_role() = 'admin'`.
- Se houver erro na criacao inicial do primeiro Admin, o sistema pode ficar sem caminho administrativo via app.
- Deve haver procedimento seguro para bootstrap do primeiro Admin pelo painel Supabase ou SQL controlado.

### Vendedor pode alterar campos sensiveis

- A policy de clientes permite `all` quando `seller_id = auth.uid()`.
- Isso permite que vendedor altere qualquer campo do cliente proprio, inclusive possivelmente `seller_id`, se o `with check` continuar verdadeiro no novo dado.
- Para V1 pode ser aceitavel, mas o ideal e limitar campos sensiveis por RPC ou formularios controlados no servidor.

### `quote_items` nao valida ownership pelo produto

- Produtos sao lidos por autenticados, e escrita e Admin.
- Isso e bom.
- Mas itens de orcamento dependem apenas do acesso ao orcamento. Esta correto para V1, desde que produtos sejam globais e ativos. Falta impedir item com produto inativo.

### UI nao e seguranca

- A troca Admin/Vendedor na interface e apenas demonstrativa.
- Em producao, toda permissao deve vir do Supabase Auth + RLS.
- A UI nao deve permitir escolher papel manualmente depois que login real for ativado.

## 6. Proxima ordem segura de implementacao

1. Separar componentes de tela sem mudar comportamento.
2. Criar uma camada de dados entre UI e origem dos dados, ainda usando mock.
3. Ajustar os tipos para conviverem com o formato do Supabase, definindo mapeadores ou tipos gerados.
4. Revisar o schema antes de executar no Supabase:
   - adicionar indices;
   - adicionar triggers de `updated_at`;
   - validar consistencia entre cliente, vendedor e orcamento;
   - restringir `potential` e `stock_status`;
   - decidir se enums continuam ou viram tabelas.
5. Reescrever RLS de forma mais explicita por operacao.
6. Criar projeto Supabase e aplicar schema revisado.
7. Implementar login real:
   - autenticar;
   - buscar perfil;
   - derivar role do banco;
   - remover troca manual de papel em modo real.
8. Conectar primeiro a tela Hoje e Clientes ao Supabase.
9. Conectar Produtos com importacao inicial controlada.
10. Conectar Orcamentos e Itens.
11. Conectar Atividades e Follow-ups.
12. Configurar Vercel somente depois de login, RLS e fluxo principal estarem verificados localmente.

## Conclusao

A fundacao esta boa para uma V1 real, principalmente por manter o cliente como centro do sistema e por ja representar produtos, orcamentos e atividades do jeito certo para a operacao comercial. O maior risco nao esta na ideia da arquitetura, mas na transicao entre demonstracao e producao: papel de usuario ainda e estado local, RLS precisa ficar mais explicita, e a camada de dados precisa ser separada antes de ligar Supabase de verdade.

Minha recomendacao e nao conectar Supabase/Vercel ainda. Primeiro, modularizar a tela, criar a camada de dados e revisar schema/RLS. Depois disso, a V1 pode seguir com bem menos risco.
