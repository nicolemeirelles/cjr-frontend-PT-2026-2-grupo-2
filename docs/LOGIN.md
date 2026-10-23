# Entendendo e revisando o login

## O que já existia no grupo

Revisão iniciada em 22/10/2026 e atualizada em 23/10/2026. Base do frontend: `tela-de-cadastro`, commit `9195827`. Base do backend: `develop`, commit `d41fccf`.

O frontend tinha o formulário de cadastro, os assets SVG, configuração do Next.js/Tailwind e um cliente Axios. A `main` ainda continha principalmente a estrutura inicial. A branch `dev` tinha removido o conteúdo; por isso a base utilizada foi `tela-de-cadastro`.

O backend tinha modelos e migração PostgreSQL para usuários, lojas, categorias, produtos, imagens, recuperação de senha, avaliações e comentários. Isso não significa que todos esses recursos já tenham endpoints: os controllers existentes implementam usuários e autenticação. Também já havia hash de senha com bcrypt, DTOs, validação global, JWT e verificação de permissões para editar ou remover o próprio usuário.

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

`API_URL` é lida no servidor Next.js para login e consulta da conta, apontando por padrão para `http://localhost:3001`. O cliente Axios original do cadastro foi preservado com seu endereço fixo `http://localhost:3001`. Reinicie o frontend depois de mudar o arquivo `.env.local`.

Para executar o backend real do grupo, use a branch `develop`, instale as dependências e configure `.env` com um PostgreSQL acessível e um `JWT_SECRET` próprio. Na pasta do backend:

```sh
npm ci
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

O `FRONTEND_URL` do backend deve permitir `http://localhost:3000` para o cadastro, que chama a API diretamente. O login passa pelo servidor Next.js.

Para testar o login com o banco real, utilize uma conta de teste cadastrada na API. Antes de testar o fluxo pelo formulário de cadastro, a responsável por essa tela precisa incluir `confirmPassword` na requisição, pois o backend exige esse campo. Não utilize dados pessoais nem senhas reais de outros serviços.

## Alterações pequenas fora do login

- Formulário de cadastro e cliente Axios: preservados exatamente como estavam na versão da Nicole. Os ajustes sugeridos para enviar `confirmPassword` e restaurar `loading` após uma falha foram separados para ela revisar e implementar.
- Layout: idioma pt-BR, título e descrição do Stock.io.
- Next.js e eslint-config-next: atualização de 16.4.0 para 16.4.2 após alerta de segurança no build. `package-lock.json` atualizado.

O layout e os demais comportamentos do cadastro foram preservados. O login usa a logo Stock.io e o mascote exportado do Figma, enviado em SVG. A ilustração fica em `public/mascote-login.svg`, separada da imagem utilizada pelo cadastro.

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
