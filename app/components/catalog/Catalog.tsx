'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { CatalogData, Category, Product } from '@/lib/catalog/types';
import Icon from './Icon';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import { categoryNavigation } from '@/lib/catalog/category-navigation';
type Props = {
  data: CatalogData;
  categoryId?: number | null;
  categoryName?: string;
  initialQuery?: string;
  initialView?: string;
};
function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}
export default function Catalog({
  data,
  categoryId,
  categoryName,
  initialQuery = '',
  initialView = 'produtos',
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [subcategory, setSubcategory] = useState<number | null>(null);
  const [sort, setSort] = useState('default');
  const [view, setView] = useState(
    initialView === 'lojas' ? 'lojas' : 'produtos',
  );

  const roots = data.categories.filter(
    (category) => category.parentId === null,
  );
  const current = data.categories.find(
    (category) => category.id === categoryId,
  );
  const children = data.categories.filter(
    (category) => typeof categoryId === 'number' && category.parentId === categoryId,
  );
  const term = normalize(query.trim());
  function belongsTo(product: Product, target: number): boolean {
    let id: number | null = product.categoryId;
    const visited = new Set<number>();
    while (id !== null && !visited.has(id)) {
      if (id === target) return true;
      visited.add(id);
      id =
        data.categories.find((category) => category.id === id)?.parentId ??
        null;
    }
    return false;
  }
  function matches(product: Product): boolean {
    if (categoryId === null) return false;
    if (subcategory !== null && product.categoryId !== subcategory)
      return false;
    if (categoryId !== undefined && !belongsTo(product, categoryId))
      return false;
    return (
      !term || normalize(`${product.name} ${product.storeName}`).includes(term)
    );
  }
  const products = data.products.filter(matches).sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'newest')
      return (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0);
    if (sort === 'rating') return (b.rating ?? -1) - (a.rating ?? -1);
    return 0;
  });
  const sections: {
    category: Category;
    products: Product[];
  }[] = roots
    .map((category) => ({
      category,
      products: products.filter((product) => belongsTo(product, category.id)),
    }))
    .filter((section) => section.products.length);
  const showAll =
    categoryId !== undefined ||
    Boolean(term) ||
    view === 'lojas' ||
    roots.length === 0;
  return (
    <div className="catalog-content">
      <SearchBar query={query} onChange={setQuery} />
      {categoryId === undefined ? (
        <section
          id="categorias"
          className="catalog-categories"
          aria-labelledby="categories-title"
        >
          <h2 id="categories-title">Categoria</h2>
          <div className="catalog-category-list">
            {categoryNavigation(data.categories).map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="catalog-category-item"
              >
                <Icon name={category.name} size={37} />
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="catalog-category-heading" id="categorias">
          <div className="catalog-breadcrumb">
            <Link href="/">Início</Link>
            <span aria-hidden="true">/</span>
            <h2>{current?.name ?? categoryName ?? 'Categoria'}</h2>
          </div>
          <div className="catalog-category-tools">
            <div className="catalog-subcategories" aria-label="Subcategorias">
              <button
                type="button"
                aria-pressed={subcategory === null}
                onClick={() => setSubcategory(null)}
              >
                Todos
              </button>
              {children.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={subcategory === category.id}
                  onClick={() => setSubcategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <label className="catalog-sort">
              <span className="catalog-sr-only">Ordenar produtos</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="default">ordenar por</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="newest">Recém-adicionados</option>
                <option value="rating">Melhor avaliados</option>
              </select>
              <Icon name="chevron" size={20} />
            </label>
          </div>
        </div>
      )}
      <section id="produtos" aria-label="Catálogo de produtos">
        <div className="catalog-results-controls">
          {(term || view === 'lojas') && (
            <p aria-live="polite">
              {products.length}{' '}
              {products.length === 1
                ? 'produto encontrado'
                : 'produtos encontrados'}
              {term ? ` para “${query.trim()}”` : ''}
            </p>
          )}
          {(term || view === 'lojas') && (
            <div className="catalog-view-switch">
              <button
                aria-pressed={view === 'produtos'}
                onClick={() => setView('produtos')}
              >
                Produtos
              </button>
              <button
                aria-pressed={view === 'lojas'}
                onClick={() => setView('lojas')}
              >
                Por loja
              </button>
            </div>
          )}
        </div>
        {data.error && (
          <div className="catalog-message" role="status">
            <h2>Não foi possível carregar todo o catálogo</h2>
            <p>{data.error}</p>
            <div>
              <button onClick={() => window.location.reload()}>
                Tentar novamente
              </button>
            </div>
          </div>
        )}
        {!data.error && categoryId !== undefined && !current && !categoryName && (
          <div className="catalog-message">
            <h2>Categoria não encontrada</h2>
            <Link href="/">Voltar ao início</Link>
          </div>
        )}
        {!data.error &&
          products.length === 0 &&
          (categoryId === undefined || current || categoryName) && (
            <div className="catalog-message" role="status">
              <h2>
                {term
                  ? 'Nenhum resultado encontrado'
                  : 'Nenhum produto por aqui ainda'}
              </h2>
              <p>
                {term
                  ? 'Tente outro nome de produto ou loja.'
                  : 'Os produtos aparecerão aqui quando forem cadastrados.'}
              </p>
              {(term || subcategory !== null) && (
                <button
                  onClick={() => {
                    setQuery('');
                    setSubcategory(null);
                  }}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        {showAll ? (
          view === 'lojas' ? (
            Array.from(
              new Set(
                products.map(
                  (product) => product.storeName || 'Loja não informada',
                ),
              ),
            ).map((storeName) => (
              <section className="catalog-product-section" key={storeName}>
                <h2>{storeName}</h2>
                <div className="catalog-grid">
                  {products
                    .filter(
                      (product) =>
                        (product.storeName || 'Loja não informada') ===
                        storeName,
                    )
                    .map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                </div>
              </section>
            ))
          ) : (
            <div className="catalog-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )
        ) : (
          sections.map(({ category, products: items }) => (
            <section className="catalog-product-section" key={category.id}>
              <div className="catalog-section-title">
                <h2>
                  Produtos
                  <span>
                    em{' '}
                    <Link href={`/categorias/${category.id}`}>
                      {category.name}
                    </Link>
                  </span>
                </h2>
                <Link href={`/categorias/${category.id}`}>
                  ver mais
                </Link>
              </div>
              <div className="catalog-product-row">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))
        )}
      </section>
    </div>
  );
}
