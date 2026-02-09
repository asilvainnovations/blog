import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Eye, Calendar, Clock, Search,
  Filter, MoreVertical, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Article, Category } from '@/types';
import { cn } from '@/lib/utils';

type ArticleStatus = 'draft' | 'published' | 'scheduled' | 'deleted';
type SortOption = 'newest' | 'oldest' | 'title' | 'views';

interface ArticleFilters {
  status?: ArticleStatus;
  category?: Category;
  author?: string;
  search?: string;
  sort?: SortOption;
}

export default function ArticleManagement() {
  const { user, profile } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ArticleFilters>({
    status: undefined,
    sort: 'newest'
  });
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, [filters]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('articles')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url, role)
        `);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      } else {
        // Don't show deleted articles by default
        query = query.neq('status', 'deleted');
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.author) {
        query = query.eq('author_id', filters.author);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
      }

      // Apply sorting
      switch (filters.sort) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
        case 'views':
          query = query.order('views', { ascending: false });
          break;
        default: // newest
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (articleId: string) => {
    try {
      const response = await fetch('/api/article-management', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: articleId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete article');
      }

      // Refresh articles
      fetchArticles();
      setShowDeleteConfirm(false);
      setArticleToDelete(null);
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article');
    }
  };

  const handleBulkAction = async (action: 'publish' | 'draft' | 'delete') => {
    // Implementation for bulk actions
    console.log('Bulk action:', action, 'for articles:', Array.from(selectedArticles));
    // TODO: Implement bulk operations
  };

  const toggleArticleSelection = (articleId: string) => {
    const newSelection = new Set(selectedArticles);
    if (newSelection.has(articleId)) {
      newSelection.delete(articleId);
    } else {
      newSelection.add(articleId);
    }
    setSelectedArticles(newSelection);
  };

  const getStatusBadge = (status: ArticleStatus) => {
    const styles = {
      published: 'bg-green-100 text-green-700',
      draft: 'bg-yellow-100 text-yellow-700',
      scheduled: 'bg-blue-100 text-blue-700',
      deleted: 'bg-red-100 text-red-700',
    };

    const icons = {
      published: <CheckCircle className="w-3 h-3" />,
      draft: <Edit className="w-3 h-3" />,
      scheduled: <Clock className="w-3 h-3" />,
      deleted: <XCircle className="w-3 h-3" />,
    };

    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', styles[status])}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const canEditArticle = (article: Article) => {
    if (profile?.role === 'admin' || profile?.role === 'editor') return true;
    if (profile?.role === 'author' && article.author_id === user?.id) return true;
    return false;
  };

  const canDeleteArticle = () => {
    return profile?.role === 'admin';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Article Management</h2>
          <p className="text-gray-600">Create, edit, and manage your blog content</p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/articles/new'}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Article
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as ArticleStatus || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={filters.sort || 'newest'}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value as SortOption })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedArticles.size > 0 && (
          <div className="mt-4 flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-blue-900">
              {selectedArticles.size} article{selectedArticles.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('publish')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                Publish
              </button>
              <button
                onClick={() => handleBulkAction('draft')}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
              >
                Draft
              </button>
              {canDeleteArticle() && (
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No articles found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedArticles.size === articles.length && articles.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedArticles(new Set(articles.map(a => a.id)));
                        } else {
                          setSelectedArticles(new Set());
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Author</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Views</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedArticles.has(article.id)}
                        onChange={() => toggleArticleSelection(article.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {article.featured_image && (
                          <img
                            src={article.featured_image}
                            alt=""
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{article.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{article.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {article.author?.avatar_url && (
                          <img
                            src={article.author.avatar_url}
                            alt=""
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="text-sm text-gray-700">{article.author?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{article.category}</span>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(article.status as ArticleStatus)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        {article.views || 0}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(article.created_at).toLocaleDateString()}
                      </div>
                      {article.scheduled_publish_at && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(article.scheduled_publish_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {canEditArticle(article) && (
                          <button
                            onClick={() => window.location.href = `/admin/articles/edit/${article.id}`}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => window.open(`/articles/${article.slug}`, '_blank')}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canDeleteArticle() && (
                          <button
                            onClick={() => {
                              setArticleToDelete(article.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Article</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this article? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setArticleToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => articleToDelete && handleDelete(articleToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}