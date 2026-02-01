/**
 * Custom React Hooks for Blog Platform
 * Reusable hooks for common functionality
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type {
  BlogPost,
  PostStatus,
  FilterState,
  UIState,
  ViewType,
  ValidationErrors,
  ValidationRule
} from '../types';

// ============================================================================
// Local Storage Hook
// ============================================================================

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}

// ============================================================================
// Dark Mode Hook
// ============================================================================

export function useDarkMode(): [boolean, () => void] {
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('asilva-blog-dark-mode', false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, [setDarkMode]);

  return [darkMode, toggleDarkMode];
}

// ============================================================================
// Posts Management Hook
// ============================================================================

export function usePosts(initialPosts: BlogPost[] = []) {
  const [posts, setPosts] = useLocalStorage<BlogPost[]>('asilva-blog-posts', initialPosts);

  const addPost = useCallback((newPost: Omit<BlogPost, 'id' | 'views' | 'readTime'>) => {
    const post: BlogPost = {
      ...newPost,
      id: Date.now(),
      views: 0,
      readTime: Math.ceil(newPost.content.length / 1000) // Rough estimate
    };
    setPosts((prev) => [post, ...prev]);
    return post;
  }, [setPosts]);

  const updatePost = useCallback((updatedPost: BlogPost) => {
    setPosts((prev) => prev.map((post) => post.id === updatedPost.id ? updatedPost : post));
  }, [setPosts]);

  const deletePost = useCallback((postId: number) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  }, [setPosts]);

  const getPostById = useCallback((postId: number): BlogPost | undefined => {
    return posts.find((post) => post.id === postId);
  }, [posts]);

  const getPostsByStatus = useCallback((status: PostStatus): BlogPost[] => {
    return posts.filter((post) => post.status === status);
  }, [posts]);

  const getPostsByCategory = useCallback((category: string): BlogPost[] => {
    return posts.filter((post) => post.category === category);
  }, [posts]);

  return {
    posts,
    addPost,
    updatePost,
    deletePost,
    getPostById,
    getPostsByStatus,
    getPostsByCategory
  };
}

// ============================================================================
// Filter Hook
// ============================================================================

export function useFilter(posts: BlogPost[]) {
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    statusFilter: 'all',
    categoryFilter: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    // Search filter
    if (filterState.searchQuery) {
      const query = filterState.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filterState.statusFilter !== 'all') {
      filtered = filtered.filter((post) => post.status === filterState.statusFilter);
    }

    // Category filter
    if (filterState.categoryFilter !== 'all') {
      filtered = filtered.filter((post) => post.category === filterState.categoryFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filterState.sortBy) {
        case 'date':
          comparison = new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
          break;
        case 'views':
          comparison = a.views - b.views;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return filterState.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [posts, filterState]);

  const setSearchQuery = useCallback((query: string) => {
    setFilterState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setStatusFilter = useCallback((status: PostStatus | 'all') => {
    setFilterState((prev) => ({ ...prev, statusFilter: status }));
  }, []);

  const setCategoryFilter = useCallback((category: string) => {
    setFilterState((prev) => ({ ...prev, categoryFilter: category }));
  }, []);

  const setSortBy = useCallback((sortBy: 'date' | 'views' | 'title') => {
    setFilterState((prev) => ({ ...prev, sortBy }));
  }, []);

  const toggleSortOrder = useCallback(() => {
    setFilterState((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterState({
      searchQuery: '',
      statusFilter: 'all',
      categoryFilter: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  }, []);

  return {
    filteredPosts,
    filterState,
    setSearchQuery,
    setStatusFilter,
    setCategoryFilter,
    setSortBy,
    toggleSortOrder,
    resetFilters
  };
}

// ============================================================================
// Exit Intent Hook
// ============================================================================

export function useExitIntent(delay: number = 0) {
  const [showExitIntent, setShowExitIntent] = useState(false);
  const hasShownRef = useRef(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShownRef.current) {
        setTimeout(() => {
          setShowExitIntent(true);
          hasShownRef.current = true;
        }, delay);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [delay]);

  const closeExitIntent = useCallback(() => {
    setShowExitIntent(false);
  }, []);

  const resetExitIntent = useCallback(() => {
    hasShownRef.current = false;
    setShowExitIntent(false);
  }, []);

  return {
    showExitIntent,
    closeExitIntent,
    resetExitIntent
  };
}

// ============================================================================
// Form Validation Hook
// ============================================================================

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, ValidationRule[]>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback((fieldName: keyof T, value: any): string | null => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    for (const rule of rules) {
      if (rule.required && !value) {
        return rule.message;
      }

      if (rule.minLength && value.length < rule.minLength) {
        return rule.message;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return rule.message;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message;
      }

      if (rule.custom && !rule.custom(value)) {
        return rule.message;
      }
    }

    return null;
  }, [validationRules]);

  const handleChange = useCallback((fieldName: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
    
    if (touched[fieldName as string]) {
      const error = validate(fieldName, value);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error || ''
      }));
    }
  }, [validate, touched]);

  const handleBlur = useCallback((fieldName: keyof T) => {
    setTouched((prev) => ({ ...prev, [fieldName as string]: true }));
    const error = validate(fieldName, values[fieldName]);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error || ''
    }));
  }, [validate, values]);

  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((key) => {
      const error = validate(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    return isValid;
  }, [validate, values, validationRules]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm
  };
}

// ============================================================================
// Debounce Hook
// ============================================================================

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// Media Query Hook
// ============================================================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    setMatches(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

// ============================================================================
// Click Outside Hook
// ============================================================================

export function useClickOutside<T extends HTMLElement>(
  handler: () => void
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handler]);

  return ref;
}

// ============================================================================
// Auto Save Hook
// ============================================================================

export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => void,
  delay: number = 2000
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    setIsSaving(true);
    
    const timer = setTimeout(() => {
      onSave(data);
      setIsSaving(false);
      setLastSaved(new Date());
    }, delay);

    return () => clearTimeout(timer);
  }, [data, delay, onSave]);

  return { isSaving, lastSaved };
}

// ============================================================================
// Clipboard Hook
// ============================================================================

export function useClipboard(timeout: number = 2000) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), timeout);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setIsCopied(false);
      return false;
    }
  }, [timeout]);

  return { isCopied, copy };
}

// ============================================================================
// Slug Generator Hook
// ============================================================================

export function useSlugGenerator() {
  const generateSlug = useCallback((title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }, []);

  return { generateSlug };
}

// ============================================================================
// Analytics Hook
// ============================================================================

export function useAnalytics(posts: BlogPost[]) {
  const totalViews = useMemo(() => {
    return posts.reduce((sum, post) => sum + post.views, 0);
  }, [posts]);

  const publishedPosts = useMemo(() => {
    return posts.filter((post) => post.status === 'published').length;
  }, [posts]);

  const draftPosts = useMemo(() => {
    return posts.filter((post) => post.status === 'draft').length;
  }, [posts]);

  const averageViews = useMemo(() => {
    if (posts.length === 0) return 0;
    return Math.round(totalViews / posts.length);
  }, [posts, totalViews]);

  const topPosts = useMemo(() => {
    return [...posts].sort((a, b) => b.views - a.views).slice(0, 5);
  }, [posts]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; views: number }> = {};
    
    posts.forEach((post) => {
      if (!stats[post.category]) {
        stats[post.category] = { count: 0, views: 0 };
      }
      stats[post.category].count++;
      stats[post.category].views += post.views;
    });

    return stats;
  }, [posts]);

  return {
    totalViews,
    publishedPosts,
    draftPosts,
    averageViews,
    topPosts,
    categoryStats
  };
}

// ============================================================================
// UI State Hook
// ============================================================================

export function useUIState() {
  const [darkMode, toggleDarkMode] = useDarkMode();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>('asilva-sidebar-open', true);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, [setSidebarOpen]);

  return {
    darkMode,
    toggleDarkMode,
    activeView,
    setActiveView,
    sidebarOpen,
    toggleSidebar
  };
}

// ============================================================================
// Export all hooks
// ============================================================================

export default {
  useLocalStorage,
  useDarkMode,
  usePosts,
  useFilter,
  useExitIntent,
  useFormValidation,
  useDebounce,
  useMediaQuery,
  useClickOutside,
  useAutoSave,
  useClipboard,
  useSlugGenerator,
  useAnalytics,
  useUIState
};
