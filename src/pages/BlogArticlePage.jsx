import { useMemo } from 'react';
import Footer from '../components/Footer/Footer';
import JournalCard from '../components/JournalCard/JournalCard';
import Navbar from '../components/Navbar/Navbar';
import { useNavigation } from '../context/NavigationContext';
import { useBlogPost } from '../hooks/useBlogPost';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { getArticleToc, parseBlogContent } from '../utils/blogContent';
import { PAGE_KEYS, getBlogSlugFromPathname } from '../../shared/routes.js';
import './JournalPage.css';

function formatPublishedDate(value) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function renderBlock(block) {
  if (block.type === 'heading' && block.level === 2) {
    return <h2 id={block.id}>{block.text}</h2>;
  }

  if (block.type === 'heading' && block.level === 3) {
    return <h3 id={block.id}>{block.text}</h3>;
  }

  if (block.type === 'list') {
    return (
      <ul>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return <p>{block.text}</p>;
}

export default function BlogArticlePage() {
  const slug = getBlogSlugFromPathname(window.location.pathname);
  const { post, loading } = useBlogPost(slug);
  const { posts } = useBlogPosts();
  const { navigate } = useNavigation();

  const blocks = useMemo(() => parseBlogContent(post?.body || ''), [post?.body]);
  const toc = useMemo(() => getArticleToc(blocks), [blocks]);
  const relatedPosts = useMemo(
    () => posts.filter((entry) => entry.slug !== post?.slug).slice(0, 3),
    [post?.slug, posts],
  );

  usePageMetadata({
    title: post?.seoTitle || 'Journal',
    description: post?.seoDescription || 'Read the La Norma journal.',
    image: post?.coverImage,
    imageAlt: post?.coverImageAlt,
    robots: post ? 'index,follow' : 'noindex,follow',
    type: 'article',
    structuredData: post
      ? [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.seoDescription,
          image: post.coverImage,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          author: {
            '@type': 'Person',
            name: post.authorName,
          },
          publisher: {
            '@type': 'Restaurant',
            name: 'La Norma',
          },
          mainEntityOfPage: `${window.location.origin}${window.location.pathname}`,
        },
      ]
      : [],
  });

  if (!loading && !post) {
    return (
      <div className="journal-page">
        <Navbar />
        <main id="main-content" className="journal-main">
          <div className="container">
            <div className="journal-empty journal-empty--article">
              <h1>This journal entry is not available.</h1>
              <p>The article may have moved, been unpublished, or the link may no longer be current.</p>
              <div className="journal-hero__actions">
                <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.blog)}>
                  Back to the journal
                </button>
                <button type="button" className="btn btn--outline-dark" onClick={() => navigate(PAGE_KEYS.home)}>
                  Back to La Norma
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="journal-page">
      <Navbar />

      <main id="main-content" className="journal-main">
        {loading && !post && (
          <div className="container">
            <div className="journal-empty journal-empty--article">
              <h1>Loading article...</h1>
              <p>We are pulling in the journal entry now.</p>
            </div>
          </div>
        )}

        {post && (
          <>
            <article className="article-hero">
              <div className="container">
                <div className="article-hero__content">
                  <p className="article-hero__eyebrow">{post.category}</p>
                  <h1 className="article-hero__heading">{post.title}</h1>
                  <p className="article-hero__subheading">{post.excerpt}</p>
                  <div className="article-hero__meta">
                    <span>{formatPublishedDate(post.publishedAt)}</span>
                    <span>{post.readTime} min read</span>
                    <span>{post.authorName}</span>
                  </div>
                </div>

                <div className="article-hero__image-wrap">
                  <img src={post.coverImage} alt={post.coverImageAlt} className="article-hero__image" />
                </div>
              </div>
            </article>

            <section className="article-body">
              <div className="container article-body__grid">
                <article className="article-content">
                  {blocks.map((block, index) => (
                    <div key={`${block.type}-${block.id || index}`} className="article-content__block">
                      {renderBlock(block)}
                    </div>
                  ))}
                </article>

                <aside className="article-sidebar">
                  {toc.length > 0 && (
                    <div className="article-sidebar__card">
                      <p className="article-sidebar__label">On this page</p>
                      <ul className="article-sidebar__toc">
                        {toc.map((item) => (
                          <li key={item.id}>
                            <a href={`#${item.id}`}>{item.text}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="article-sidebar__card article-sidebar__card--dark">
                    <p className="article-sidebar__label">Turn reading into a plan</p>
                    <p className="article-sidebar__body">
                      If the article helped you decide, the next step is choosing the right booking path.
                    </p>
                    <div className="article-sidebar__actions">
                      <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.home, { anchor: 'reserve' })}>
                        Reserve dinner
                      </button>
                      <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.privateEvents)}>
                        Private events
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            </section>

            {relatedPosts.length > 0 && (
              <section className="article-related">
                <div className="container">
                  <div className="article-related__header">
                    <p className="section-label">Keep reading</p>
                    <h2 className="article-related__heading">Related journal entries</h2>
                  </div>

                  <div className="article-related__grid">
                    {relatedPosts.map((entry) => (
                      <JournalCard key={entry.slug} post={entry} />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
