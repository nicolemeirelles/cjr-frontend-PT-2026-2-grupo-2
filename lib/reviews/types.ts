export type ReviewAuthor = {
  id: number;
  name: string;
  profile_picture_url?: string | null;
};

export type ReviewComment = {
  id: number;
  content: string;
  createdAt: string;
  user: ReviewAuthor;
};

export type ReviewDetails = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: ReviewAuthor;
  store: { id: number };
  ratingComments: ReviewComment[];
};

export type ReviewStore = { id: number; name: string; user: { id: number } };
