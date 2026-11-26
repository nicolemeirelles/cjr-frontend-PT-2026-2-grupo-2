# Home e categoria

A Home está em `/`, e a tela de categoria em `/categorias/ID`. As duas exibem apenas os produtos retornados pela API, respeitando os identificadores cadastrados no banco.

A categoria mantém banner, subcategorias e ordenação. Sem produtos cadastrados, a interface apresenta um estado vazio. Falhas de carregamento não são substituídas por dados fictícios.

`app/components/catalog` contém os componentes e estilos do catálogo. `CatalogPage` carrega os dados, e `Catalog` controla a pesquisa e os filtros. Os tipos estão em `lib/catalog/types.ts`.

O perfil mostra os produtos do usuário autenticado. Visitantes recebem uma orientação para entrar na conta.
