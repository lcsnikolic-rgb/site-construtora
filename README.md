# Construtora Forma Espaco

Site institucional em Next.js com painel administrativo seguro, autenticao por perfil e banco com Prisma.

## Setup do projeto

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

No Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

2. Rode o setup completo:

```bash
npm run setup
```

Esse comando executa:

- `npm install`
- `npx prisma migrate deploy`
- `npx prisma db seed`

3. Inicie em desenvolvimento:

```bash
npm run dev
```

## Producao

- As migracoes usam `prisma migrate deploy` (compativel com producao).
- O seed e idempotente:
  - nao duplica registros
  - cria dados padrao apenas quando faltam
  - nao sobrescreve edicoes existentes desnecessariamente

## Docker

1. Copie e ajuste as variaveis:

```bash
cp .env.example .env
```

Para SQLite no Docker, mantenha:

```bash
DOCKER_DATABASE_URL="file:/app/prisma/data/prod.db"
```

2. Construa e suba a aplicacao:

```bash
docker compose build
docker compose up -d
```

3. Execute as migracoes e o seed dentro do container:

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

Com a configuracao de Tailscale deste projeto, o site local ficara em `http://localhost:3000/site`.

## Acesso via Tailscale

Endereco publico no tailnet:

```text
http://server-construtora.tailcb40f0.ts.net/site
```

Configure o `.env` do Docker com:

```bash
NEXTAUTH_URL="http://server-construtora.tailcb40f0.ts.net/site"
BASE_URL="http://server-construtora.tailcb40f0.ts.net/site"
NEXT_PUBLIC_SITE_URL="http://server-construtora.tailcb40f0.ts.net/site"
```

Rotas publicas:

- `http://server-construtora.tailcb40f0.ts.net/site`
- `http://server-construtora.tailcb40f0.ts.net/site/empreendimentos`
- `http://server-construtora.tailcb40f0.ts.net/site/empreendimentos/<slug>`

Admin:

```text
http://server-construtora.tailcb40f0.ts.net/site/admin/login
```

Somente dispositivos conectados ao Tailscale devem acessar o admin. O middleware bloqueia `/admin`, `/api/admin` e `/api/auth` quando a requisicao nao vem pelo host Tailscale derivado de `BASE_URL` ou pelos headers de identidade do Tailscale Serve. Login e RBAC continuam obrigatorios.

Mantenha o Tailscale direcionando `/site` para a porta `3000` do container. O container continua escutando `0.0.0.0:3000`; para maior isolamento, mantenha firewall/VPN restringindo acesso direto a essa porta fora do Tailscale.

## Tunel publico com basePath `/site`

O build do Next.js usa `basePath` em tempo de build. Se `BASE_URL`/`NEXT_PUBLIC_SITE_URL` apontam para uma URL com `/site`, o tunel ou proxy publico precisa encaminhar as requisicoes mantendo esse prefixo.

Rotas que precisam passar intactas para o app:

- `/site`
- `/site/_next/static/...`
- `/site/_next/image?...`
- `/site/uploads/...`
- `/site/brand/...`

Exemplo NGINX mantendo o caminho original:

```nginx
location = /site {
  proxy_pass http://127.0.0.1:3000;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location /site/ {
  proxy_pass http://127.0.0.1:3000;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

Se o HTML abrir no dominio publico mas componentes client-side nao hidratarem, verifique no Network se os chunks em `/site/_next/static/...` retornam JavaScript com status `200`. Um chunk retornando HTML, `404`, `403` ou caminho sem `/site` impede o carrossel da home de iniciar.

### Volumes persistentes

- `./public/uploads:/app/public/uploads` guarda imagens, logos e PDFs enviados pelo admin.
- `./prisma-data:/app/prisma/data` guarda o banco SQLite usado pelo Docker.
- `./postgres-data:/var/lib/postgresql/data` guarda os dados do Postgres quando o perfil `postgres` for usado.

### Postgres opcional

O `docker-compose.yml` inclui um servico Postgres opcional:

```bash
docker compose --profile postgres up -d db app
```

Configure `DOCKER_DATABASE_URL="postgresql://user:pass@db:5432/formaespaco"` para usar esse servico. Atencao: o schema Prisma atual esta com `provider = "sqlite"`; antes de usar Postgres em producao, gere/aplique migrations compativeis com Postgres.

### Seguranca do admin

Nao exponha `/admin` publicamente sem uma camada de protecao adicional. Para testes e homologacao, prefira firewall, VPN ou liberacao por IP.

## Variaveis de ambiente

Veja `.env.example`:

- `DATABASE_URL`
- `DOCKER_DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_TAILSCALE_HOSTS` (opcional para hosts Tailscale adicionais)
- `INITIAL_ADMIN_EMAIL`
- `INITIAL_ADMIN_PASSWORD`
