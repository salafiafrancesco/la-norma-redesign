import { useEffect } from 'react';
import CookingClassesHero from '../components/CookingClassesHero/CookingClassesHero';
import ClassHighlights from '../components/ClassHighlights/ClassHighlights';
import BookingForm from '../components/BookingForm/BookingForm';
import FAQCooking from '../components/FAQCooking/FAQCooking';
import Footer from '../components/Footer/Footer';
import './CookingClassesPage.css';

export default function CookingClassesPage() {
  useEffect(() => {
    document.title = 'Cooking Classes — La Norma Ristorante & Pizzeria';
    return () => {
      document.title = 'La Norma Ristorante & Pizzeria | Authentic Sicilian Cuisine — Longboat Key, FL';
    };
  }, []);

  return (
    <div className="cc-page">
      <CookingClassesHero />

      <main id="main-content">
        <ClassHighlights />
        <BookingForm />
        <FAQCooking />
      </main>

      <Footer />
    </div>
  );
}
