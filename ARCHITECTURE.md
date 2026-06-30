# Arquitetura do Sistema Comercial Ketri / Pets e tal

## 1. Visao geral do sistema

O Sistema Comercial Ketri / Pets e tal e uma aplicacao comercial para operacao de carteira de clientes, produtos, orcamentos, atividades e follow-ups. A aplicacao foi evoluida de dados demonstrativos para uma camada preparada para dados reais no Supabase, mantendo o modo demonstracao para desenvolvimento local sem configuracao externa.

Stack principal:

- Next.js com App Router.
- TypeScript.
- Tailwind CSS.
- Supabase Auth e Supabase Postgres.
- Supabase JS no frontend, usando variaveis publicas `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Existem dois modos de operacao:

- Modo demo: usado quando Supabase nao esta configurado ou quando nao ha sessao real. Os dados vem de `lib/demo-data.ts`. Operacoes de gravacao sao bloqueadas com mensagem clara.
- Modo real: usado quando Supabase esta configurado e existe usuario autenticado com perfil valido em `profiles`. Leituras e gravacoes usam Supabase. Erros reais nao caem silenciosamente para mocks.

## 2. Estrutura de pastas

### `app/`

Contem a entrada principal da UI.

- `app/page.tsx`: componente cliente central. Mantem estados globais da tela, carrega dados, aplica filtros por papel/carteira, controla login/logout e conecta handlers de CRUD aos componentes.
- `app/layout.tsx`: estrutura base da aplicacao.
- `app/globals.css`: estilos globais e base Tailwind.

### `components/`

Contem as telas e componentes visuais da aplicacao.

- `app-header.tsx`: topo com login, logout, status de sessao e seletores de papel/vendedor no modo demo.
- `navigation.tsx`: navegacao lateral por abas.
- `workspace-header.tsx`: cabecalho da area de trabalho e busca.
- `today-view.tsx`: atividades e follow-ups.
- `clients-view.tsx`: CRUD de clientes.
- `products-view.tsx`: CRUD de produtos para Admin e visualizacao para Vendedor.
- `quotes-view.tsx`: CRUD de orcamentos e itens.
- `admin-view.tsx`: area administrativa atual.
- `metric.tsx` e `status.ts`: auxiliares visuais.

Os componentes recebem dados e callbacks por props. Eles nao importam `lib/demo-data.ts` diretamente.

### `lib/`

Contem tipos, formatadores, Supabase, dados demo, mapeadores e camada de dados.

- `types.ts`: contratos usados pela UI em camelCase.
- `data.ts`: unica camada responsavel por ler/gravar dados em Supabase ou retornar dados demo quando apropriado.
- `mappers.ts`: conversao das linhas do banco em snake_case para os tipos da UI em camelCase.
- `supabase.ts`: cria o cliente Supabase quando as variaveis de ambiente existem; retorna `null` quando nao configurado.
- `demo-data.ts`: dados demonstrativos usados somente pela camada `lib/data.ts`.
- `format.ts`: formatadores como moeda/data.

### `supabase/`

Contem o schema SQL de referencia do banco.

- `schema.sql`: tipos, tabelas, indices, triggers, RLS e policies para `profiles`, `clients`, `products`, `quotes`, `quote_items`, `activities`, `follow_ups` e `settings`.

### Documentos `.md`

- `README.md`: documentacao principal do projeto.
- `AUDITORIA_FUNDACAO_V1_REAL.md`: auditoria/fundacao anterior.
- `CHECKLIST_PRE_DEPLOY.md`: checklist operacional antes de publicar.
- `ARCHITECTURE.md`: este documento.

## 3. Fluxo de dados

O fluxo atual e centralizado:

1. A UI renderiza `app/page.tsx`.
2. `app/page.tsx` chama funcoes de `lib/data.ts`.
3. `lib/data.ts` decide entre modo demo e modo real.
4. No modo real, `lib/data.ts` consulta Supabase.
5. No modo demo, `lib/data.ts` retorna `lib/demo-data.ts`.
6. `lib/mappers.ts` converte linhas Supabase em snake_case para objetos camelCase usados pela UI.
7. `app/page.tsx` passa dados ja normalizados para os componentes por props.

Exemplo de responsabilidades:

- `app/page.tsx`: estado da tela, filtros, autorizacao de UI, handlers e recarregamento.
- `lib/data.ts`: leitura/gravação, fallback demo, logs de erro real e payloads para Supabase.
- `lib/mappers.ts`: `profiles -> User`, `clients -> Client`, `products -> Product`, `quotes + quote_items -> Quote`, `activities -> Activity`, `follow_ups -> FollowUp`.
- Componentes: formularios, tabelas, botoes e exibicao.

## 4. Autenticacao e perfis

A autenticacao usa Supabase Auth.

O fluxo e:

1. Usuario informa email e senha no `AppHeader`.
2. `app/page.tsx` chama `supabase.auth.signInWithPassword`.
3. `loadData()` chama `getCurrentUser()` em `lib/data.ts`.
4. `getCurrentUser()` usa `supabase.auth.getUser()`.
5. Com o `auth.uid()`, busca `profiles.id` correspondente.
6. O perfil real define `currentUser`, `role` e `sellerId`.

Papeis:

- `admin`: pode ver e gerenciar todos os dados permitidos pelo banco.
- `vendedor`: ve e gerencia somente a propria carteira.

Quando ha sessao real, a troca manual de Admin/Vendedor fica bloqueada. No modo demo, os controles manuais continuam disponiveis para testar os fluxos sem Supabase.

## 5. Regras de permissao

As regras aparecem em duas camadas:

- UI/app: filtros e bloqueios em `app/page.tsx` e componentes.
- Banco: RLS em `supabase/schema.sql`.

Regras principais:

- Admin ve e gerencia tudo que as policies permitirem.
- Vendedor ve somente clientes, orcamentos, atividades e follow-ups com `sellerId`/`seller_id` do proprio perfil.
- Vendedor nao deve criar, editar ou excluir produtos.
- Produtos ativos aparecem para usuarios autenticados; Admin tambem pode ver inativos.
- `sellerId` de cliente criado por vendedor e sempre o `currentUser.id` real.
- `sellerId` de orcamento, atividade e follow-up e derivado do cliente selecionado ou do perfil real, nunca confiado livremente ao formulario.
- Orçamentos usam a regra de banco `quotes_client_seller_match` para manter `client_id` e `seller_id` coerentes.

A UI melhora a experiencia e evita operacoes indevidas, mas a seguranca final depende de RLS testado no Supabase real.

## 6. Entidades principais

### `profiles`

Perfil de usuario ligado ao Supabase Auth.

Campos centrais: `id`, `name`, `email`, `role`.

Na UI vira `User` com `id`, `name`, `email`, `role`.

### `clients`

Clientes da carteira comercial.

Campos centrais: `name`, `contact_name`, `phone`, `city`, `status`, `potential`, `seller_id`, `last_activity`.

Na UI vira `Client` com `contactName`, `sellerId`, `lastActivity`, `nextFollowUp`.

### `products`

Catalogo de produtos.

Campos centrais: `sku`, `name`, `category`, `price`, `stock_status`, `active`.

Na UI vira `Product` com `stockStatus` e `active`.

Produtos inativos nao devem aparecer para novos itens de orcamento, mas precisam continuar preservados em orcamentos antigos.

### `quotes`

Cabecalho do orcamento.

Campos centrais: `client_id`, `seller_id`, `status`, `created_at`.

Na UI vira `Quote` com `clientId`, `sellerId`, `status`, `createdAt` e `items`.

### `quote_items`

Itens de orcamento.

Campos centrais: `quote_id`, `product_id`, `quantity`, `unit_price`.

Na UI vira `QuoteItem` com `productId`, `quantity`, `unitPrice`.

### `activities`

Atividades comerciais pendentes ou concluidas.

Campos centrais: `client_id`, `seller_id`, `type`, `note`, `due_at`, `done`.

Na UI vira `Activity` com `clientId`, `sellerId`, `dueAt` e `done`.

### `follow_ups`

Follow-ups comerciais.

Campos centrais: `client_id`, `seller_id`, `activity_id`, `title`, `due_at`, `done`.

Na UI vira `FollowUp` com `clientId`, `sellerId`, `activityId`, `dueAt` e `done`.

### `settings`

Tabela generica para configuracoes do sistema.

Atualmente existe no schema, mas ainda nao e usada como modulo principal da UI.

## 7. CRUDs implementados

### Clientes

Implementado em `ClientsView` + handlers em `app/page.tsx` + funcoes em `lib/data.ts`.

Acoes:

- Criar cliente.
- Editar cliente.
- Excluir cliente.
- Admin pode escolher vendedor.
- Vendedor grava sempre com `sellerId` proprio.

### Produtos

Implementado em `ProductsView` + handlers em `app/page.tsx` + funcoes em `lib/data.ts`.

Acoes:

- Criar produto.
- Editar produto.
- Ativar/desativar produto.
- Excluir produto quando seguro.
- Se o produto estiver em `quote_items`, a exclusao vira desativacao.
- Vendedor apenas visualiza produtos ativos.

### Atividades

Implementado em `TodayView` + handlers em `app/page.tsx` + funcoes em `lib/data.ts`.

Acoes:

- Criar atividade.
- Editar atividade.
- Concluir atividade.
- Excluir atividade.

### Follow-ups

Implementado em `TodayView` + handlers em `app/page.tsx` + funcoes em `lib/data.ts`.

Acoes:

- Criar follow-up.
- Concluir follow-up.
- Excluir follow-up.

### Orcamentos e itens

Implementado em `QuotesView` + handlers em `app/page.tsx` + funcoes em `lib/data.ts`.

Acoes:

- Criar orcamento com um ou varios itens.
- Editar cliente/status/itens.
- Alterar status diretamente na listagem.
- Excluir orcamento.
- Adicionar, remover e editar itens.
- Calcular total por `quantity * unitPrice`.
- Bloquear salvamento sem item ou com quantidade invalida.

## 8. Convencoes importantes

- A UI sempre usa camelCase.
- O banco usa snake_case.
- `snake_case` deve ficar restrito a `lib/data.ts` e `lib/mappers.ts`.
- Componentes nao devem importar `lib/demo-data.ts`.
- `lib/data.ts` e a unica camada que conhece `demo-data.ts`.
- Modo real nunca deve cair silenciosamente para mocks.
- Modo demo nao grava dados reais.
- Mutacoes devem chamar `ensureRealMode` em `lib/data.ts`.
- Depois de salvar, excluir ou alterar status, os dados devem ser recarregados do Supabase com `loadData()`.
- Dados devem ser passados para componentes por props.
- Regras visuais e layout devem ser alterados apenas quando necessario para a funcionalidade.

## 9. Riscos tecnicos conhecidos

- Orcamentos com itens ainda nao sao transacionais por RPC. A implementacao atual cria/edita com tratamento de erro, limpeza e tentativa de restauracao, mas uma funcao no banco seria mais robusta para producao.
- RLS precisa ser testado em ambiente real para Admin e Vendedor, inclusive por acesso direto a API.
- Usuarios precisam existir em Supabase Auth e tambem em `profiles` com o mesmo `id`.
- Produtos inativos devem continuar preservados em orcamentos antigos.
- Produto inativo nao deve aparecer para novo item de orcamento.
- `auth.role()` aparece no schema atual em policy de produtos; antes de producao, revisar conforme recomendacoes atuais do Supabase.
- Excluir entidades com vinculos pode falhar por constraints ou RLS. A UI mostra erro, mas as regras finais de negocio devem ser confirmadas.
- O modo demo ajuda desenvolvimento, mas nao deve mascarar erro quando existe sessao real.

## 10. Como adicionar novos modulos

Fluxo recomendado:

1. Criar ou expandir tipos em `lib/types.ts` usando nomes camelCase esperados pela UI.
2. Criar tipos de linha e mappers em `lib/mappers.ts` para converter snake_case do banco para camelCase.
3. Criar funcoes de leitura/gravação em `lib/data.ts`.
4. Manter mocks conhecidos somente por `lib/data.ts`, se houver fallback demo.
5. Criar componente em `components/` recebendo dados e callbacks por props.
6. Conectar estado, filtros e handlers em `app/page.tsx`.
7. Garantir que vendedor nao consiga enviar ou operar `sellerId` de outro perfil.
8. Garantir que modo real nao caia para mocks em erro de Supabase.
9. Procurar vazamentos de snake_case fora de `lib/data.ts` e `lib/mappers.ts`.
10. Rodar `pnpm run build` e `pnpm run lint`.

Checklist minimo para novo modulo:

- [ ] Tipos em `lib/types.ts`.
- [ ] Mapper em `lib/mappers.ts`.
- [ ] Funcoes async em `lib/data.ts`.
- [ ] UI recebendo dados por props.
- [ ] Bloqueio de gravacao em modo demo.
- [ ] Regras Admin/Vendedor aplicadas na UI.
- [ ] RLS revisado/testado no Supabase.
- [ ] Build e lint passando.