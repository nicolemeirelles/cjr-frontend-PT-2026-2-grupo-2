import type { Category } from './types';

const categories = [
  { name: 'Mercado', slug: 'mercado' },
  { name: 'Farmácia', slug: 'farmacia' },
  { name: 'Beleza', slug: 'beleza' },
  { name: 'Moda', slug: 'moda' },
  { name: 'Eletrônicos', slug: 'eletronicos' },
  { name: 'Jogos', slug: 'jogos' },
  { name: 'Brinquedos', slug: 'brinquedos' },
  { name: 'Casa', slug: 'casa' },
];

export function categorySlug(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function categoryName(slug: string) {
  return categories.find((category) => category.slug === slug)?.name;
}

export function categoryNavigation(available: Category[]) {
  const roots = available.filter((category) => category.parentId === null);
  const defaults = categories.map((category) => {
    const registered = roots.find((item) => categorySlug(item.name) === category.slug);
    return {
      name: category.name,
      href: `/categorias/${registered?.id ?? category.slug}`,
    };
  });
  const additional = roots.filter((item) => !categories.some((category) => category.slug === categorySlug(item.name)))
    .map((category) => ({ name: category.name, href: `/categorias/${category.id}` }));
  return [...defaults, ...additional];
}
