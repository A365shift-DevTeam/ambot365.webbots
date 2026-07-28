// AMBOT 365 - TypeScript Type Definitions

export type Category =
  | 'education'
  | 'real-estate'
  | 'healthcare'
  | 'customer-support'
  | 'e-commerce'
  | 'hospitality'
  | 'finance'
  | 'other';

export interface Bot {
  id: string;
  name: string;
  slug: string;
  description: string;
  scriptCode: string;
  backgroundImageUrl?: string;
  mobileBackgroundImageUrl?: string;
  category: Category;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BotFormData {
  name: string;
  description: string;
  scriptCode: string;
  backgroundImageUrl?: string;
  mobileBackgroundImageUrl?: string;
  category: Category;
}

export interface DemoWebsite {
  id: string;
  title: string;
  slug: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  category: Category;
  tags?: string[];
  enabled: boolean;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteFormData {
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  category: Category;
  tags?: string[];
  enabled?: boolean;
  featured?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

