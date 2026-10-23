# Entendendo e revisando o login

## Integração com o backend

O backend da autenticação recebe `POST /login` com `{ email, password }`, devolve `{ access_token }` e usa `GET /me` com `Authorization: Bearer TOKEN` para consultar a conta. Credenciais inválidas retornam 401.

## Como a implementação funciona

1. `app/login/page.tsx` desenha a página usando JSX, que permite descrever HTML dentro de um componente React. As classes Tailwind definem os estilos básicos. `app/login/login.css` ajusta medidas, cores e espaçamentos específicos do Figma; suas classes começam com `login-` para não alterar outras telas. A fonte League Spartan é carregada apenas no login.
2. `useState` mantém os valores digitados, a visibilidade da senha, o carregamento e as mensagens. Alterar um estado atualiza a tela.
3. `handleSubmit` impede que o formulário recarregue a página, valida os campos e faz uma requisição `fetch` para `/api/auth/login`. `await` espera a resposta sem bloquear a interface.
4. `app/api/auth/login/route.ts` roda no servidor Next.js. Ele envia apenas e-mail e senha para `/login` no NestJS. É o backend que confere a senha e emite o token.
5. Se o login for aceito, a rota grava o token em um cookie HttpOnly. O token não é devolvido ao JavaScript do formulário. O cookie tem SameSite=Lax e Secure em produção. Não guardamos a senha nem usamos localStorage para o token.
6. O formulário navega para `/conta`. `lib/auth.ts` lê o cookie no servidor e consulta `/me`. Só mostra nome e e-mail quando a API valida a sessão. Sem sessão ou com token inválido/expirado, redireciona para `/login`.
7. O botão Sair envia POST para `/api/auth/logout`, que apaga o cookie. O JWT continua sujeito ao prazo de expiração definido pelo backend; não existe revogação de tokens no backend atual.

As rotas de login e logout conferem a origem da requisição. As consultas autenticadas não são armazenadas em cache. As senhas não são registradas em logs.

`/conta` é apenas uma confirmação para esta entrega, não a home definitiva. Quando a home autenticada existir, o destino em `router.replace('/conta')` poderá ser alterado junto com a proteção da nova página.

## Configuração

`API_URL` é lida no servidor Next.js para login e consulta da conta, apontando por padrão para `http://localhost:3001`. Reinicie o frontend depois de mudar o arquivo `.env.local`.

Para executar o backend real do grupo, use a branch `develop`, instale as dependências e configure `.env` com um PostgreSQL acessível e um `JWT_SECRET` próprio. Na pasta do backend:

```sh
npm ci
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

O login passa pelo servidor Next.js. O exemplo de configuração do backend usa a porta 3001 e o frontend usa a 3000.

Para testar o login com o banco real, utilize uma conta de teste previamente cadastrada na API. Não utilize dados pessoais nem senhas reais de outros serviços. A tela de cadastro será integrada separadamente.

## Estrutura do projeto

- Layout: idioma pt-BR, título e descrição do Stock.io.
- Rota inicial: redirecionamento para `/login`.
- Next.js e eslint-config-next: versão 16.4.2, com a correção de segurança que motivou a atualização da versão inicial 16.4.0.

O login usa a logo Stock.io e o mascote exportado do Figma, enviado em SVG. A ilustração fica em `public/mascote-login.svg`.

O frame de referência mede 1440 × 1024. Nesse tamanho, o painel começa em x=701, y=111; os campos medem 504 × 48 e o botão mede 504 × 52. A variável CSS `--unit` reduz proporcionalmente as medidas em desktop menor que 1440 px. Abaixo de 1024 px, a tela usa uma coluna e oculta a ilustração para priorizar o formulário. Essa adaptação mobile não foi fornecida no protótipo.

## O que foi verificado

- Compilação de produção e verificação de TypeScript.
- ESLint em todo o frontend.
- Navegador: campos vazios, credenciais incorretas, mostrar/ocultar senha, login válido, confirmação da conta, logout e bloqueio de acesso sem sessão.
- Layout em desktop e celular de 390 px.
- Requisições HTTP: origem inválida, dados incompletos, ausência de cookie em login recusado, cookie HttpOnly/SameSite/Secure, ausência do token no JSON público, token inválido e exclusão da sessão.

Os testes funcionais locais usaram os controllers, services, bcrypt e JWT reais do backend com persistência substituída por dados em memória. Não havia PostgreSQL/Docker disponível neste computador. Portanto ainda é necessário repetir cadastro e login com o PostgreSQL do grupo; a persistência e as migrações não foram validadas aqui.

## Revisão antes da entrega

Abra o formulário e identifique o estado de cada campo, `onChange`, `onSubmit`, `try/catch/finally` e os estados de erro/carregamento. Depois siga a chamada do navegador até a rota Next.js e até o backend.

Você deve conseguir explicar por que a senha é validada no backend, o que o status 401 significa, para que serve o token, onde ele fica guardado e como o logout remove a sessão do navegador.

No teste com o banco do grupo, confira: campos vazios, e-mail inválido, senha incorreta, cadastro seguido de login, atualizar `/conta`, sair e tentar acessar `/conta` novamente. Repita com o backend desligado para conferir a mensagem de indisponibilidade.
