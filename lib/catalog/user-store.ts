import { api } from '@/lib/axios-server';

export type UserStore = {
  id: number;
  name: string;
  categoryId: number | null; 
};

const STORES_PATH = process.env.STORES_API_PATH ?? '/lojas';
export async function getUserStore(userId: number): Promise<UserStore | null> {
  try {
    const { data } = await api.get(STORES_PATH);
    const list: unknown = Array.isArray(data) ? data : data?.data;
    if (!Array.isArray(list)) return null;

    const store = list.find((item) => Number(item?.user_id ?? item?.userId) === userId);
    const id = Number(store?.id);
    if (!store || !Number.isInteger(id)) return null;

    const categoryId = Number(store.category_id ?? store.categoryId);

    return {
      id,
      name: typeof store.name === 'string' ? store.name : '',
      categoryId: Number.isInteger(categoryId) ? categoryId : null,
    };
  } catch {
    return null;
  }
}