import BookingForm from '../components/BookingForm/BookingForm';
import ClassHighlights from '../components/ClassHighlights/ClassHighlights';
import CookingClassesHero from '../components/CookingClassesHero/CookingClassesHero';
import FAQCooking from '../components/FAQCooking/FAQCooking';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';
import { usePageMetadata } from '../hooks/usePageMetadata';
import './CookingClassesPage.css';

const COOKING_CLASSES_DESCRIPTION =
  'Reserve an intimate Sicilian cooking class at La Norma with Chef Marco, house-made pasta, wine, and a shared meal on Longboat Key.';

export default function CookingClassesPage() {
  usePageMetadata({
    title: 'Cooking Classes',
    description: COOKING_CLASSES_DESCRIPTION,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: 'La Norma Sicilian Cooking Classes',
        description: COOKING_CLASSES_DESCRIPTION,
        provider: {
          '@type': 'Restaurant',
          name: 'La Norma Ristorante & Pizzeria',
        },
        offers: {
          '@type': 'Offer',
          price: '95',
          priceCurrency: 'USD',
        },
      },
    ],
  });

  return (
    <div className="cc-page">
      <Navbar />
      <CookingClassesHero />

      <main id="main-content">
        <BookingForm />
        <ClassHighlights />
        <FAQCooking />
      </main>

      <Footer />
    </div>
  );
}
