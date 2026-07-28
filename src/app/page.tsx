import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import WebsitesSection from '@/components/home/WebsitesSection';
import Features from '@/components/home/Features';
import CTA from '@/components/home/CTA';

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <WebsitesSection />
        <Features />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

