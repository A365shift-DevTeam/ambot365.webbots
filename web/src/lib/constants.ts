// AMBOT 365 - Brand Constants & Configuration

import type { Category } from './types';

export const BRAND = {
  name: 'AMBOT 365',
  domain: 'ambot365.com',
  supportEmail: 'connect@ambot365.in',
  tagline: 'AMBOT 365 Provides Premium AI Chatbot Services',
  description:
    'AMBOT 365 offers professional white-label chatbot services and branded landing pages tailored to your business needs.',
} as const;

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'real-estate', label: 'Real Estate', icon: '🏠' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'customer-support', label: 'Customer Support', icon: '💬' },
  { value: 'e-commerce', label: 'E-Commerce', icon: '🛒' },
  { value: 'hospitality', label: 'Hospitality', icon: '🏨' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/websites', label: 'Demo Sites' },
  { href: '/bots', label: 'AI Bots' },
  { href: '/contact', label: 'Contact' },
];

export const ADMIN_NAV_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/add', label: 'Add Bot' },
  { href: '/admin/websites/add', label: 'Add Website' },
];

export function categoryLabel(value: Category): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function categoryIcon(value: Category): string {
  return CATEGORIES.find((c) => c.value === value)?.icon ?? '📦';
}
