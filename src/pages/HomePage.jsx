import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import CateringPromo from '../components/CateringPromo/CateringPromo';
import JournalPreview from '../components/JournalPreview/JournalPreview';
import MenuHighlights from '../components/MenuHighlights/MenuHighlights';
import ReservationBanner from '../components/ReservationBanner/ReservationBanner';
import Story from '../components/Story/Story';
import Experiences from '../components/Experiences/Experiences';
import Testimonials from '../components/Testimonials/Testimonials';
import VisitUs from '../components/VisitUs/VisitUs';
import Footer from '../components/Footer/Footer';
import { usePageMetadata } from '../hooks/usePageMetadata';

const HOME_DESCRIPTION =
  'A refined Sicilian restaurant on Longboat Key offering handmade pasta, wood-fired pizza, curated wine tastings, cooking classes, and private dining.';

export default function HomePage() {
  usePageMetadata({
    title: 'Sicilian dining on Longboat Key',
    description: HOME_DESCRIPTION,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'Restaurant',
        name: 'La Norma Ristorante & Pizzeria',
        description: HOME_DESCRIPTION,
        url: window.location.origin,
        telephone: '+19415550192',
        servesCuisine: ['Italian', 'Sicilian', 'Mediterranean'],
        priceRange: '$$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '5370 Gulf of Mexico Drive',
          addressLocality: 'Longboat Key',
          addressRegion: 'FL',
          postalCode: '34228',
          addressCountry: 'US',
        },
      },
    ],
  });

  return (
    <div className="app">
      <Navbar />
      <main id="main-content">
        <Hero />
        <ReservationBanner />
        <Experiences />
        <CateringPromo />
        <MenuHighlights limitPerCategory={3} showHeaderActions showFooterNote={false} />
        <Story />
        <Testimonials />
        <JournalPreview />
        <VisitUs />
      </main>
      <Footer />
    </div>
  );
}
