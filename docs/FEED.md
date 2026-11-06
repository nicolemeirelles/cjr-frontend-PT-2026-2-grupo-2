# Integração do feed

A Home em `/` consulta o backend. `/?demo=1` continua sendo a demonstração identificada do Figma. A integração desta entrega se limita ao feed; a página de categoria pertence ao PR visual separado.

`API_URL` define o servidor. As rotas padrão são `GET /categorias`, `GET /produtos`, `GET /lojas` e `GET /imagens`. Os nomes podem ser configurados pelas variáveis do `.env.example`.

As quatro consultas são feitas em paralelo no servidor. Como a listagem de produtos não inclui as relações, `lib/catalog/normalize.ts` combina os registros por `store_id` e `product_id`, seleciona a primeira imagem por `order` e converte o preço Decimal para número. Não há uma requisição adicional por produto.

Produtos sem imagem mantêm o card com uma indicação própria. Falhas de serviço exibem uma mensagem e preservam os dados que estiverem disponíveis. A resposta vazia tem um estado próprio e não é substituída por exemplos. A sessão existente é encaminhada ao backend pelo servidor, sem incluir o token nos dados enviados à interface.

A busca atua sobre nomes de produtos e das lojas recebidas. O agrupamento usa a hierarquia de categorias. A implementação atual pressupõe listas completas; paginação e consulta independente de lojas não fazem parte desta integração.

Os testes podem ser executados com `npm run test:catalog` em Node.js 24. Eles verificam a combinação dos dados, imagens ordenadas, preços, estoque, respostas vazias, URLs inválidas, sessão e falhas parciais.

O fluxo foi conferido com o backend do grupo e PostgreSQL local em uma base de teste separada, incluindo acesso público, sessão autenticada, busca, versão de celular e atualização de preço e estoque pela API. Foi necessário registrar `CategoriasModule` no backend para disponibilizar `/categorias`; essa correção está em um PR separado.
