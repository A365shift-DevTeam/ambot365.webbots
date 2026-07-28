import Hero from '@/components/home/Hero';
import WebsitesSection from '@/components/home/WebsitesSection';
import Features from '@/components/home/Features';
import CTA from '@/components/home/CTA';
import { usePageTitle } from '@/lib/usePageTitle';

export default function HomePage() {
  usePageTitle();

  return (
    <>
      <Hero />
      <WebsitesSection />
      <Features />
      <CTA />
    </>
  );
}
