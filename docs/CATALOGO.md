# Home e categoria

A Home está em `/`, e a tela de categoria em `/categorias/ID`. Esta entrega visual usa os dados do protótipo, identificados na tela como demonstração.

A categoria adiciona banner, subcategorias e ordenação. A integração com o backend desta entrega pertence somente ao feed. A página de categoria continua como demonstração visual.

`app/components/catalog` contém o cabeçalho, os cards, a busca, o agrupamento por loja e os estilos responsivos. `CatalogPage` recebe os dados da página; `Catalog` controla as interações no navegador. Os tipos estão em `lib/catalog/types.ts`, e os dados do protótipo em `demo.ts`.

As imagens ficam em `public/catalogo`. O arquivo `mascote-home.svg` é a exportação individual da personagem do Figma.

A página de categoria é entregue no PR da branch `tela-categoria`. A conexão da Home com o backend é entregue separadamente na branch `integracao-feed`.

O login e o cadastro existentes foram preservados. `API_URL` continua definindo o servidor utilizado pela autenticação.
