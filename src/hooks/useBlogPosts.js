import { useEffect, useMemo, useState } from 'react';
import { fallbackBlogPosts, fetchBlogPosts } from '../data/blog';

function applyClientFilters(posts, { featured = null, category = '', tag = '', limit = 0 } = {}) {
  let nextPosts = [...posts];

  if (featured !== null) {
    nextPosts = nextPosts.filter((post) => post.featured === featured);
  }

  if (category) {
    nextPosts = nextPosts.filter((post) => post.category === category);
  }

  if (tag) {
    nextPosts = nextPosts.filter((post) => post.tags.includes(tag));
  }

  nextPosts.sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt));

  if (limit > 0) {
    nextPosts = nextPosts.slice(0, limit);
  }

  return nextPosts;
}

function buildFilterKey(filters = {}) {
  return JSON.stringify({
    featured: filters.featured ?? null,
    category: filters.category ?? '',
    tag: filters.tag ?? '',
    limit: filters.limit ?? 0,
  });
}

export function useBlogPosts(filters = {}) {
  const normalizedFilters = useMemo(() => ({
    featured: filters.featured ?? null,
    category: filters.category ?? '',
    tag: filters.tag ?? '',
    limit: filters.limit ?? 0,
  }), [filters.category, filters.featured, filters.limit, filters.tag]);
  const filterKey = buildFilterKey(normalizedFilters);
  const fallbackPosts = useMemo(
    () => applyClientFilters(fallbackBlogPosts, normalizedFilters),
    [normalizedFilters],
  );
  const [resolvedKey, setResolvedKey] = useState('');
  const [resolvedPosts, setResolvedPosts] = useState(fallbackPosts);

  useEffect(() => {
    let cancelled = false;

    fetchBlogPosts({
      ...(normalizedFilters.featured !== null ? { featured: normalizedFilters.featured } : {}),
      ...(normalizedFilters.category ? { category: normalizedFilters.category } : {}),
      ...(normalizedFilters.tag ? { tag: normalizedFilters.tag } : {}),
      ...(normalizedFilters.limit ? { limit: normalizedFilters.limit } : {}),
    })
      .then((data) => {
        if (!cancelled) {
          setResolvedPosts(applyClientFilters(data, normalizedFilters));
          setResolvedKey(filterKey);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResolvedPosts(fallbackPosts);
          setResolvedKey(filterKey);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fallbackPosts, filterKey, normalizedFilters]);

  return {
    posts: resolvedKey === filterKey ? resolvedPosts : fallbackPosts,
    loading: resolvedKey !== filterKey,
  };
}
