import type { Category } from '@/lib/catalog/types';

export type CategoryOption = { id: number; name: string; group?: string };

export function buildCategoryOptions(categories: Category[], currentId: number | null): CategoryOption[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const subcategories = categories.filter((category) => category.parentId !== null);
  const current = currentId === null ? undefined : byId.get(currentId);
  const familyId = current ? (current.parentId ?? current.id) : null;

  const family = subcategories.filter((category) => category.parentId === familyId);
  if (family.length > 0) return family.map(({ id, name }) => ({ id, name }));

  return subcategories.map(({ id, name, parentId }) => ({
    id,
    name,
    group: byId.get(parentId ?? -1)?.name,
  }));
}