// AMBOT 365 - TypeScript Type Definitions
// These mirror the JSON the .NET API returns (PascalCase properties serialized
// to camelCase), which in turn mirrors db/schema.sql.

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
  backgroundImageUrl?: string | null;
  mobileBackgroundImageUrl?: string | null;
  category: Category;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BotFormData {
  name: string;
  description: string;
  scriptCode: string;
  backgroundImageUrl?: string | null;
  mobileBackgroundImageUrl?: string | null;
  category: Category;
  enabled?: boolean;
}

export interface DemoWebsite {
  id: string;
  title: string;
  slug: string;
  description: string;
  url: string;
  thumbnailUrl?: string | null;
  category: Category;
  tags: string[];
  enabled: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteFormData {
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string | null;
  category: Category;
  tags?: string[];
  enabled?: boolean;
  featured?: boolean;
}
