import { buildBlogArticleHref } from '../../../shared/routes.js';
import { useNavigation } from '../../context/NavigationContext';
import './JournalCard.css';

function formatPublishedDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function JournalCard({ post, featured = false, compact = false }) {
  const { navigatePath } = useNavigation();
  const href = buildBlogArticleHref(post.slug);

  const handleNavigate = (event) => {
    event.preventDefault();
    navigatePath(href);
  };

  return (
    <article className={`journal-card${featured ? ' journal-card--featured' : ''}${compact ? ' journal-card--compact' : ''}`}>
      <a href={href} className="journal-card__media" onClick={handleNavigate}>
        <img src={post.coverImage} alt={post.coverImageAlt} loading="lazy" />
      </a>

      <div className="journal-card__body">
        <div className="journal-card__meta">
          <span className="journal-card__category">{post.category}</span>
          <span>{formatPublishedDate(post.publishedAt)}</span>
          <span>{post.readTime} min read</span>
        </div>

        <a href={href} className="journal-card__title-link" onClick={handleNavigate}>
          <h3 className="journal-card__title">{post.title}</h3>
        </a>

        <p className="journal-card__excerpt">{post.excerpt}</p>

        {!compact && post.tags?.length > 0 && (
          <div className="journal-card__tags" aria-label="Post topics">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}

        <a href={href} className="journal-card__cta" onClick={handleNavigate}>
          {compact ? 'Read' : 'Read the article'}
        </a>
      </div>
    </article>
  );
}
