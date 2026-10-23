# Stock.io — frontend

## Executar

Use Node.js 20.9 ou superior. Na pasta deste projeto:

```sh
npm ci
```

Copie `.env.example` para `.env.local`. Os endereços padrão apontam para o backend na porta 3001.

```sh
npm run dev
```

Abra http://localhost:3000/login. O backend precisa estar rodando para entrar ou cadastrar uma conta.

## Login

- `/login`: formulário, validação, visualização de senha e mensagens de erro.
- `/cadastro`: página de cadastro desenvolvida pelo grupo.
- `/conta`: confirmação provisória do login, com nome e e-mail validados pelo backend.
- `POST /api/auth/login`: encaminha credenciais ao NestJS e grava a sessão em cookie HttpOnly.
- `POST /api/auth/logout`: remove o cookie e volta ao login.

A recuperação de senha ainda não está implementada. O botão apenas informa essa indisponibilidade. A home original do projeto não foi substituída.

Veja [o guia do login](docs/LOGIN.md) para entender os arquivos, configurar o backend e conferir os testes.

## Verificações

```sh
npm run lint
npm run build
```

O build baixa as fontes já utilizadas pelo projeto, portanto requer acesso à internet na primeira execução.
