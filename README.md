# Sistema Comercial Ketri

Aplicacao web real para a operacao comercial da Ketri Criativa, com foco na linha pet **Pets e tal**.

## V1

- Login para Admin e Vendedor via Supabase Auth.
- Cliente como centro do sistema.
- Lead como status do cliente, nao como entidade separada.
- Produtos em base unica.
- Orcamentos vinculados aos clientes.
- Atividades e follow-ups para conduzir venda e pos-venda.
- Tela Hoje para mostrar o que precisa ser feito.
- Visao Admin para toda a operacao e visao Vendedor para carteira propria.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Vercel
- GitHub

## Rodar localmente

1. Instale Node.js LTS.
2. Instale as dependencias:

```bash
npm install
```

3. Copie `.env.example` para `.env.local` e preencha as chaves do Supabase.
4. Inicie a aplicacao:

```bash
npm run dev
```

## Supabase

O arquivo `supabase/schema.sql` cria as tabelas, tipos e politicas de acesso da V1.

Ordem sugerida:

1. Criar um projeto no Supabase.
2. Executar `supabase/schema.sql` no SQL Editor.
3. Criar usuarios no Supabase Auth.
4. Inserir cada usuario tambem em `public.profiles`, usando o mesmo `id` do Auth.
5. Importar produtos da base atual em `public.products`.

## Deploy

1. Suba o projeto para o GitHub.
2. Importe o repositorio na Vercel.
3. Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Publique.

## Proximo passo tecnico

A tela atual usa dados de demonstracao para validar fluxo e interface. O proximo passo e trocar `lib/demo-data.ts` por consultas reais no Supabase e ativar o login.
