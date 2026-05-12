export interface BodyInfo {
  height: number;
  weight: number;
  topSize: string;
  bottomSize: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  bodyInfo: BodyInfo;
  tier: 'Starter' | 'Mate' | 'Muse';
  points: number;
}

export interface FitScore {
  shoulder: number;  // 1~5 (좁음~넓음)
  length: number;    // 1~5 (짧음~긺)
  waist: number;     // 1~5 (슬림~넉넉)
  thickness: number; // 1~5 (얇음~두꺼움)
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  thumbnail: string;
  externalUrl: string;
  category: string;
}

export interface Review {
  id: string;
  user: User;
  product: Product;
  images: string[];
  text: string;
  fitScore: FitScore;
  isVerified: boolean;
  purchaseDate: string;
  likes: number;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  image?: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  reviewId: string;
  reviewer: User;
  requester: User;
  messages: Message[];
}

export type BodyFilter = {
  type: 'mine' | 'height_160' | 'height_170' | 'height_180' | 'size_slim' | 'size_normal' | 'size_large';
  label: string;
};

export type CategoryFilter = '전체' | '아우터' | '상의' | '하의' | '원피스' | '신발' | '악세서리';
