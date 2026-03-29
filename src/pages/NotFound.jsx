import { useNavigation } from '../context/NavigationContext';
import './NotFound.css';

export default function NotFound() {
  const { navigate } = useNavigation();
  return (
    <div className="not-found">
      <div className="not-found__inner">
        <p className="not-found__label">404</p>
        <h1 className="not-found__heading">
          Lost in&nbsp;Sicily.
        </h1>
        <p className="not-found__sub">
          The page you were looking for has wandered off — perhaps to find better pasta.
        </p>
        <div className="not-found__actions">
          <button className="btn btn--primary" onClick={() => navigate('home')}>
            Back to La Norma
          </button>
          <button className="btn btn--outline-dark" onClick={() => navigate('cooking-classes')}>
            Cooking Classes
          </button>
        </div>
      </div>
    </div>
  );
}
