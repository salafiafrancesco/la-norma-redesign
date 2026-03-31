import { useEffect, useMemo, useState } from 'react';
import { fallbackBlogPosts, fetchBlogPost } from '../data/blog';

export function useBlogPost(slug = '') {
  const fallbackPost = useMemo(
    () => fallbackBlogPosts.find((entry) => entry.slug === slug) ?? null,
    [slug],
  );
  const [resolvedSlug, setResolvedSlug] = useState('');
  const [resolvedPost, setResolvedPost] = useState(fallbackPost);

  useEffect(() => {
    let cancelled = false;

    if (!slug) {
      return () => {
        cancelled = true;
      };
    }

    fetchBlogPost(slug)
      .then((data) => {
        if (!cancelled) {
          setResolvedPost(data);
          setResolvedSlug(slug);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResolvedPost(fallbackPost);
          setResolvedSlug(slug);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fallbackPost, slug]);

  return {
    post: resolvedSlug === slug ? resolvedPost : fallbackPost,
    loading: Boolean(slug) && resolvedSlug !== slug,
  };
}
