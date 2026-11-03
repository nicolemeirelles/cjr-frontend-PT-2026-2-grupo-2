'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { CatalogData, Category, Product } from '@/lib/catalog/types';
import Icon from './Icon';
import ProductCard from './ProductCard';
type Props = {
  data: CatalogData;
  categoryId?: number;
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
  initialQuery = '',
  initialView = 'produtos',
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [subcategory, setSubcategory] = useState<number | null>(null);
  const [sort, setSort] = useState('default');
  const [view, setView] = useState(
    initialView === 'lojas' ? 'lojas' : 'produtos',
  );
  const demo = data.source === 'demo';
  const suffix = demo ? '?demo=1' : '';
  const roots = data.categories.filter(
    (category) => category.parentId === null,
  );
  const current = data.categories.find(
    (category) => category.id === categoryId,
  );
  const children = data.categories.filter(
    (category) => category.parentId === categoryId,
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
      {demo && (
        <div className="catalog-demo-note">
          Demonstração com dados do protótipo.{' '}
          <Link href={categoryId ? `/categorias/${categoryId}` : '/'}>
            Usar dados da API
          </Link>
        </div>
      )}
      <form
        className="catalog-search"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <label htmlFor="catalog-search" className="catalog-sr-only">
          Buscar produtos e lojas
        </label>
        <input
          id="catalog-search"
          type="search"
          placeholder="Procurar por…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit" aria-label="Buscar">
          <Icon name="search" size={21} />
        </button>
      </form>
      {categoryId === undefined ? (
        <section
          id="categorias"
          className="catalog-categories"
          aria-labelledby="categories-title"
        >
          <h2 id="categories-title">Categoria</h2>
          <div className="catalog-category-list">
            {roots.map((category) => (
              <Link
                key={category.id}
                href={`/categorias/${category.id}${suffix}`}
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
            <Link href={`/${suffix}`}>Início</Link>
            <span aria-hidden="true">/</span>
            <h2>{current?.name ?? 'Categoria'}</h2>
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
              <Link
                href={
                  categoryId ? `/categorias/${categoryId}?demo=1` : '/?demo=1'
                }
              >
                Ver demonstração do protótipo
              </Link>
            </div>
          </div>
        )}
        {!data.error && categoryId !== undefined && !current && (
          <div className="catalog-message">
            <h2>Categoria não encontrada</h2>
            <Link href={`/${suffix}`}>Voltar ao início</Link>
          </div>
        )}
        {!data.error &&
          products.length === 0 &&
          (categoryId === undefined || current) && (
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
                    <Link href={`/categorias/${category.id}${suffix}`}>
                      {category.name}
                    </Link>
                  </span>
                </h2>
                <Link href={`/categorias/${category.id}${suffix}`}>
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
