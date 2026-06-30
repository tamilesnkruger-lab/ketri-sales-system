# Checklist Pre-Deploy

## Status atual do sistema

- Aplicacao Next.js funcionando com modo demonstracao e modo real via Supabase.
- Modo demonstracao continua disponivel quando Supabase nao esta configurado ou nao ha sessao real.
- Modo real usa Auth Supabase e carrega perfil em `profiles` pelo usuario autenticado.
- Usuario real nao deve receber dados mockados como fallback silencioso.
- Interface trabalha com dados em camelCase; `snake_case` fica restrito a `lib/data.ts` e `lib/mappers.ts`.
- Ultimas validacoes executadas durante as etapas: `pnpm run build` e `pnpm run lint` passando.

## Funcionalidades prontas

- Login/logout com Supabase Auth.
- Perfil real carregado via `profiles`.
- Controle de papel: Admin e Vendedor.
- Bloqueio da troca manual de papel quando ha sessao real.
- Clientes: criar, editar e excluir.
- Produtos: criar, editar, ativar/desativar e excluir quando seguro.
- Produtos vinculados a orcamentos sao desativados em vez de removidos.
- Atividades: criar, editar, concluir e excluir.
- Follow-ups: criar, concluir e excluir.
- Orcamentos: criar, editar, alterar status e excluir.
- Itens do orcamento: adicionar, editar e remover.
- Total do orcamento calculado por quantidade x preco unitario.
- Vendedor ve e gerencia somente dados da propria carteira pela logica da UI, com RLS esperado no Supabase.
- Admin ve e gerencia todos os dados permitidos por RLS.

## Funcionalidades pendentes

- Confirmar validacao completa em ambiente Supabase real com dados de producao.
- Melhorar mensagens de estado vazio por aba, se necessario.
- Criar fluxo de cadastro/convite de usuarios, se for operar sem criar Auth/Profile manualmente.
- Relatorios e dashboards avancados.
- Exportacao/impressao de orcamentos.
- Auditoria historica de alteracoes.
- Testes automatizados end-to-end.
- Opcional: RPC transacional para criar/editar orcamento + itens de forma atomica no banco.

## Variaveis `.env.local` necessarias

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Observacoes:

- Nao usar `service_role` ou chaves secretas no frontend.
- As variaveis `NEXT_PUBLIC_*` ficam expostas ao navegador; devem ser apenas URL e chave publica/anon apropriada.
- Repetir as mesmas variaveis no ambiente da Vercel.

## Checklist Supabase

### Auth

- [ ] Auth habilitado no projeto Supabase.
- [ ] Usuarios Admin e Vendedor criados.
- [ ] Login com email/senha testado.
- [ ] Logout testado.
- [ ] Tokens antigos invalidados quando necessario.

### profiles

- [ ] Cada usuario Auth tem registro correspondente em `profiles`.
- [ ] `profiles.id` corresponde ao `auth.users.id`.
- [ ] Campos obrigatorios preenchidos: `id`, `name`, `email`, `role`.
- [ ] Roles conferidos: `admin` e `vendedor`.
- [ ] Admin real carrega como Admin.
- [ ] Vendedor real carrega como Vendedor.

### RLS

- [ ] RLS habilitado em todas as tabelas publicas expostas.
- [ ] Politicas de SELECT testadas para Admin e Vendedor.
- [ ] Politicas de INSERT testadas para Admin e Vendedor.
- [ ] Politicas de UPDATE testadas para Admin e Vendedor.
- [ ] Politicas de DELETE testadas para Admin e Vendedor.
- [ ] Vendedor nao consegue acessar dados de outro vendedor por API direta.
- [ ] Admin consegue acessar os dados esperados.
- [ ] Revisar uso de `auth.role()` no schema antes de producao; preferir politicas modernas com `TO authenticated` e predicados de propriedade quando ajustar schema.

### products

- [ ] Produtos ativos aparecem para Admin e Vendedor.
- [ ] Produtos inativos nao aparecem para Vendedor.
- [ ] Admin ve produtos ativos e inativos.
- [ ] Criar produto como Admin.
- [ ] Editar produto como Admin.
- [ ] Desativar/ativar produto como Admin.
- [ ] Excluir produto sem vinculo, se permitido.
- [ ] Produto com item de orcamento e desativado, nao removido.

### clients

- [ ] Admin ve todos os clientes.
- [ ] Vendedor ve somente clientes com `seller_id` proprio.
- [ ] Criar cliente como Admin.
- [ ] Criar cliente como Vendedor com `seller_id` do proprio perfil.
- [ ] Editar cliente respeitando carteira.
- [ ] Excluir cliente quando permitido por RLS e vinculos.

### quotes

- [ ] Admin ve todos os orcamentos.
- [ ] Vendedor ve somente orcamentos da propria carteira.
- [ ] Criar orcamento com 1 item.
- [ ] Criar orcamento com varios itens.
- [ ] Editar cliente do orcamento.
- [ ] `seller_id` do orcamento acompanha o `seller_id` do cliente.
- [ ] Alterar status: `rascunho`, `enviado`, `aprovado`, `perdido`.
- [ ] Excluir orcamento.
- [ ] Tentar salvar sem itens e confirmar bloqueio.

### quote_items

- [ ] Adicionar item com produto ativo.
- [ ] Editar quantidade.
- [ ] Editar preco unitario.
- [ ] Remover item.
- [ ] Produto inativo nao aparece para novo item.
- [ ] Orcamento antigo com produto inativo continua exibindo o item.
- [ ] Se criacao de itens falhar, orcamento recem-criado nao fica orfao.

### activities

- [ ] Admin ve atividades de todos.
- [ ] Vendedor ve somente atividades da propria carteira.
- [ ] Criar atividade vinculada a cliente.
- [ ] Editar atividade mantendo cliente/vendedor corretos.
- [ ] Concluir atividade remove da lista de pendentes.
- [ ] Excluir atividade sem quebrar a tela.

### follow_ups

- [ ] Admin ve follow-ups de todos.
- [ ] Vendedor ve somente follow-ups da propria carteira.
- [ ] Criar follow-up vinculado a cliente.
- [ ] Concluir follow-up remove da lista de abertos.
- [ ] Excluir follow-up sem quebrar a tela.

## Checklist Vercel

- [ ] Projeto conectado ao repositorio correto.
- [ ] Framework detectado como Next.js.
- [ ] Comando de install usa `pnpm install`.
- [ ] Comando de build usa `pnpm run build`.
- [ ] Variaveis de ambiente configuradas em Production e Preview.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada.
- [ ] Deploy Preview testado antes de Production.
- [ ] Production deploy validado com usuario Admin.
- [ ] Production deploy validado com usuario Vendedor.
- [ ] Dominio final configurado, se aplicavel.
- [ ] Logs da Vercel revisados apos primeiro acesso real.

## Testes obrigatorios com Admin

- [ ] Login Admin.
- [ ] Confirmar que controle manual de papel esta bloqueado.
- [ ] Ver todos os clientes.
- [ ] Criar, editar e excluir cliente.
- [ ] Criar, editar, desativar/ativar produto.
- [ ] Criar orcamento para cliente de qualquer vendedor.
- [ ] Adicionar varios itens ao orcamento.
- [ ] Alterar status do orcamento.
- [ ] Editar e excluir orcamento.
- [ ] Criar, editar, concluir e excluir atividade.
- [ ] Criar, concluir e excluir follow-up.
- [ ] Confirmar que tabelas vazias mostram estado vazio, nao mocks.

## Testes obrigatorios com Vendedor

- [ ] Login Vendedor.
- [ ] Confirmar que controle manual de papel esta bloqueado.
- [ ] Ver somente clientes da propria carteira.
- [ ] Criar cliente e confirmar `seller_id` do proprio perfil.
- [ ] Nao conseguir operar cliente de outro vendedor.
- [ ] Ver apenas produtos ativos.
- [ ] Nao ver botoes de criar/editar/excluir produtos.
- [ ] Criar orcamento para cliente proprio.
- [ ] Nao conseguir criar/editar orcamento para cliente de outro vendedor.
- [ ] Alterar status apenas de orcamento proprio.
- [ ] Criar e concluir atividade propria.
- [ ] Criar e concluir follow-up proprio.

## Riscos conhecidos antes de publicar

- As protecoes da UI nao substituem RLS: publicar somente depois de testar acesso direto por usuario Admin e Vendedor.
- O fluxo de orcamento + itens nao usa RPC transacional; ha tratamento de limpeza/restauracao, mas uma funcao transacional no banco seria mais robusta para producao.
- Politicas RLS do schema devem ser revisadas contra recomendacoes atuais do Supabase antes de ambiente final.
- Excluir cliente/orcamento pode falhar por vinculos e RLS; a UI mostra erro, mas regras de negocio finais devem ser confirmadas.
- Produtos inativos precisam continuar acessiveis para Admin se forem usados em orcamentos antigos.
- Sem dados reais suficientes, alguns estados vazios podem parecer tela incompleta; validar com base minima de producao.
- Nao ha testes automatizados cobrindo todos os fluxos criticos.
- Chaves Supabase devem ser conferidas na Vercel para evitar deploy em projeto errado.