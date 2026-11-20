export type CommentTarget = { kind: 'product' | 'store'; id: number };

export type RatingComment = {
  id: number;
  user_id: number;
  content: string;
  user: { id: number; name: string };
};

export function isPositiveId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= 2147483647;
}

export function isRatingComment(value: unknown): value is RatingComment {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<RatingComment>;
  return isPositiveId(item.id) && isPositiveId(item.user_id) && typeof item.content === 'string'
    && !!item.user && item.user.id === item.user_id && typeof item.user.name === 'string';
}

export function targetQuery(target: CommentTarget) {
  return `${target.kind === 'product' ? 'product_rating_id' : 'store_rating_id'}=${target.id}`;
}
