// AMBOT 365 - Brand Constants & Configuration

import { Category } from './types';

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
  { href: '/bots', label: 'Bots' },
  { href: '/contact', label: 'Contact' },
];

export const ADMIN_NAV_LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/add', label: 'Add Bot' },
];
