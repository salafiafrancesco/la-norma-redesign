import { PAGE_KEYS } from '../../../shared/routes.js';
import { useNavigation } from '../../context/NavigationContext';
import { useBlogPosts } from '../../hooks/useBlogPosts';
import JournalCard from '../JournalCard/JournalCard';
import './JournalPreview.css';

export default function JournalPreview() {
  const { posts } = useBlogPosts({ limit: 3 });
  const { navigate } = useNavigation();

  if (!posts.length) {
    return null;
  }

  return (
    <section className="journal-preview" aria-labelledby="journal-preview-heading">
      <div className="container">
        <div className="journal-preview__header">
          <div>
            <p className="section-label">From the journal</p>
            <h2 id="journal-preview-heading" className="journal-preview__heading">
              Helpful reading for dinner planning, private hosting, and La Norma experiences.
            </h2>
            <p className="journal-preview__subheading">
              Clear, useful guidance that supports how guests choose a dinner, class, tasting, or private event.
            </p>
          </div>

          <button type="button" className="btn btn--outline-dark" onClick={() => navigate(PAGE_KEYS.blog)}>
            Visit the journal
          </button>
        </div>

        <div className="journal-preview__grid">
          {posts.map((post) => (
            <JournalCard key={post.slug} post={post} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
