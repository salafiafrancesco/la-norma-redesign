import { PAGE_KEYS } from '../../shared/routes.js';
import Navbar from '../components/Navbar/Navbar';
import { useNavigation } from '../context/NavigationContext';
import { usePageMetadata } from '../hooks/usePageMetadata';
import './NotFound.css';

export default function NotFound() {
  const { navigate } = useNavigation();

  usePageMetadata({
    title: 'Page Not Found',
    description: 'The page you were looking for is not available. Explore La Norma dining, classes, tastings, and private events instead.',
    robots: 'noindex,follow',
  });

  return (
    <div className="not-found-page">
      <Navbar />
      <main id="main-content" className="not-found">
        <div className="not-found__inner">
          <p className="not-found__label">404</p>
          <h1 className="not-found__heading">This page is no longer on the table.</h1>
          <p className="not-found__sub">
            The link may have changed, but the rest of La Norma is still here for dinner, experiences, and private hospitality.
          </p>
          <div className="not-found__actions">
            <button className="btn btn--primary" type="button" onClick={() => navigate(PAGE_KEYS.home)}>
              Back to La Norma
            </button>
            <button className="btn btn--outline-dark" type="button" onClick={() => navigate(PAGE_KEYS.cookingClasses)}>
              Cooking Classes
            </button>
            <button className="btn btn--outline-dark" type="button" onClick={() => navigate(PAGE_KEYS.blog)}>
              Journal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
