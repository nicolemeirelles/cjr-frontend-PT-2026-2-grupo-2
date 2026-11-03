# Home

## Rotas

- `/`: catálogo conectado ao backend.
- `/?demo=1`: demonstração identificada com os produtos do Figma.

Os IDs da demonstração não representam os IDs do banco. O modo real usa os IDs recebidos da API e não mistura produtos de exemplo em respostas reais.

## Organização

`app/components/catalog` contém navbar, ícones, cards, busca e estilos compartilhados. `CatalogPage` consulta a sessão e os dados no servidor; `Catalog` controla busca e agrupamento por loja no navegador.

`lib/catalog/api.ts` consulta o backend, valida as respostas e converte os valores para os tipos da interface. `demo.ts` contém apenas os dados de demonstração. As imagens de produtos e ilustrações foram extraídas dos SVGs fornecidos do Figma.

O arquivo `public/catalogo/mascote-home.svg` é a exportação individual da personagem. O CSS controla o tamanho e o recorte no banner. `logo-clara.svg` contém a logo separada do cabeçalho exportado; os links e botões da navbar são elementos HTML.

## Conexão com o backend

`API_URL` define o servidor. `CATEGORIES_API_PATH` usa `/categorias` por padrão. Esse endpoint existe em `feat/crud-categorias`, mas ainda não está na `develop` consultada. A leitura pública precisa ser liberada pelo backend, pois a Home também atende visitantes.

`PRODUCTS_API_PATH` usa `/products` como contrato provisório. Não foi encontrado um endpoint de produtos nas branches consultadas. A integração real do feed depende da entrega e confirmação desse endpoint pelo grupo; não foi implementado nem alterado código no backend.

As respostas podem ser um array ou `{ data: [...] }`. Categorias devem ter `id`, `name` e `parent_category_id`. Produtos devem ter `id`, `name`, `price`, `stock` e `category_id`; opcionalmente `createdAt`, `rating`, `images: [{ image_url, order }]` e `store: { name, logo_url, sticker_url }`. Preços em string, como os valores Decimal do Prisma, são convertidos para número.

O token existente é enviado pelo servidor quando há sessão. Não é exposto no JavaScript do navegador. Erros de conexão, acesso, endpoint ausente e formato inválido têm tratamento. Respostas vazias exibem um estado próprio, diferente de erro.

A busca e o agrupamento por loja atuam sobre a lista recebida. O contrato inicial pressupõe uma lista completa; paginação e busca no servidor precisam de ajuste conjunto quando o backend definir esses recursos. A busca encontra nomes de produtos e de lojas com produtos carregados; não consulta uma listagem independente de lojas.

Os cards são informativos: a página de detalhes de produto e a página própria da loja são entregas separadas. Não foram criados links para rotas que ainda não existem. O login e o cadastro existentes foram preservados; após login, `/conta` continua sendo a confirmação da sessão, com a Home acessível pela URL `/`.

Os links de categorias e “ver mais” apontam para `/categorias/ID`, cuja página é entregue na branch `tela-categoria`. Essa branch depende dos componentes e da integração da Home.
