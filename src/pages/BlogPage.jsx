import { useMemo, useState } from 'react';
import Footer from '../components/Footer/Footer';
import JournalCard from '../components/JournalCard/JournalCard';
import Navbar from '../components/Navbar/Navbar';
import { useNavigation } from '../context/NavigationContext';
import { useBlogPosts } from '../hooks/useBlogPosts';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { PAGE_KEYS } from '../../shared/routes.js';
import './JournalPage.css';

export default function BlogPage() {
  const { posts, loading } = useBlogPosts();
  const { navigate } = useNavigation();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchValue, setSearchValue] = useState('');

  usePageMetadata({
    title: 'Journal',
    description:
      'Read the La Norma journal for thoughtful guidance on dinner planning, cooking classes, wine tastings, and private events on Longboat Key.',
  });

  const categories = useMemo(
    () => ['All', ...new Set(posts.map((post) => post.category))],
    [posts],
  );

  const filteredPosts = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
      const matchesSearch = !search || [post.title, post.excerpt, post.category, ...post.tags]
        .join(' ')
        .toLowerCase()
        .includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, posts, searchValue]);

  const featuredPost = filteredPosts.find((post) => post.featured) || filteredPosts[0];
  const remainingPosts = filteredPosts.filter((post) => post.slug !== featuredPost?.slug);

  return (
    <div className="journal-page">
      <Navbar />

      <main id="main-content" className="journal-main">
        <section className="journal-hero">
          <div className="container">
            <div className="journal-hero__grid">
              <div className="journal-hero__copy">
                <p className="section-label">La Norma journal</p>
                <h1 className="journal-hero__heading">Useful reading that helps guests choose better evenings.</h1>
                <p className="journal-hero__subheading">
                  Articles on Italian dining, Longboat Key planning, cooking classes, wine tastings, and private event
                  hosting, written to support real decisions instead of filling space.
                </p>
                <div className="journal-hero__actions">
                  <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.home, { anchor: 'reserve' })}>
                    Reserve dinner
                  </button>
                  <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.privateEvents)}>
                    Plan a private event
                  </button>
                </div>
              </div>

              <aside className="journal-hero__panel">
                <p className="journal-hero__panel-label">Inside the journal</p>
                <ul className="journal-hero__panel-list">
                  <li>Dining and reservation guidance</li>
                  <li>Experience-led planning for classes and tastings</li>
                  <li>Private event strategy for hosts who want clarity fast</li>
                </ul>
              </aside>
            </div>
          </div>
        </section>

        <section className="journal-listing">
          <div className="container">
            <div className="journal-listing__toolbar">
              <div className="journal-listing__filters" aria-label="Filter journal posts">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`journal-filter-pill${activeCategory === category ? ' is-active' : ''}`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <label className="journal-search">
                <span className="sr-only">Search journal posts</span>
                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search by topic, intent, or experience"
                />
              </label>
            </div>

            {loading && <p className="journal-empty">Loading journal posts...</p>}

            {!loading && filteredPosts.length === 0 && (
              <div className="journal-empty">
                <h2>No articles matched that filter.</h2>
                <p>Try a broader category or clear the search to see the full journal.</p>
              </div>
            )}

            {!loading && featuredPost && (
              <>
                <div className="journal-listing__featured">
                  <JournalCard post={featuredPost} featured />
                </div>

                {remainingPosts.length > 0 && (
                  <div className="journal-listing__grid">
                    {remainingPosts.map((post) => (
                      <JournalCard key={post.slug} post={post} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <section className="journal-cta">
          <div className="container journal-cta__inner">
            <div>
              <p className="journal-cta__eyebrow">Next step</p>
              <h2 className="journal-cta__heading">Use the journal to decide faster, then book with confidence.</h2>
            </div>
            <div className="journal-cta__actions">
              <button type="button" className="btn btn--primary" onClick={() => navigate(PAGE_KEYS.cookingClasses)}>
                Cooking classes
              </button>
              <button type="button" className="btn btn--outline-light" onClick={() => navigate(PAGE_KEYS.wineTastings)}>
                Wine tastings
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
