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
  botFlowUrl: string;
  backgroundImageUrl?: string;
  themeColor?: string;
  bubbleIconUrl?: string;
  category: Category;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BotFormData {
  name: string;
  description: string;
  botFlowUrl: string;
  backgroundImageUrl?: string;
  themeColor?: string;
  bubbleIconUrl?: string;
  category: Category;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
