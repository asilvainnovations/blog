import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { mockArticles, mockCategories } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  Loader2,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import type { ArticleWithRelations } from '@/types';

export function ArticlesList() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      // Use mock data
      setArticles(mockArticles as ArticleWithRelations[]);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        author:authors(*),
        category:categories(*)
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Failed to load articles');
    } else {
      setArticles(data as ArticleWithRelations[] || []);
    }

    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    if (!isSupabaseConfigured) {
      setArticles(articles.filter((a) => a.id !== id));
      toast.success('Article deleted');
      return;
    }

    const { error } = await supabase.from('articles').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete article');
    } else {
      setArticles(articles.filter((a) => a.id !== id));
      toast.success('Article deleted');
    }
  };

  const handleDuplicate = async (article: ArticleWithRelations) => {
    const newArticle = {
      ...article,
      id: undefined,
      title: `${article.title} (Copy)`,
      slug: `${article.slug}-copy`,
      status: 'draft',
      published_at: null,
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      toast.info('Demo Mode: Cannot duplicate in demo mode');
      return;
    }

    const { data, error } = await supabase
      .from('articles')
      .insert(newArticle)
      .select()
      .single();

    if (error) {
      toast.error('Failed to duplicate article');
    } else {
      toast.success('Article duplicated');
      loadArticles();
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || article.status === statusFilter;

    const matchesCategory =
      categoryFilter === 'all' || article.category_id === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="secondary">
            <FileText className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Clock className="h-3 w-3 mr-1" />
            Scheduled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Articles</h1>
            <p className="text-slate-500">
              Manage your blog articles and content
            </p>
          </div>
          <Link to="/admin/articles/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {mockCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-lg border">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">
                No articles found
              </h3>
              <p className="text-slate-500 mt-1">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Create your first article to get started'}
              </p>
              {!searchQuery && (
                <Link to="/admin/articles/new" className="mt-4">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Article
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">
                      Article
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">
                      Author
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">
                      Views
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">
                      Date
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-start gap-3">
                          {article.featured_image && (
                            <img
                              src={article.featured_image}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              {article.title}
                            </p>
                            <p className="text-sm text-slate-500 line-clamp-1">
                              {article.excerpt}
                            </p>
                            {article.featured && (
                              <Badge
                                variant="outline"
                                className="mt-1 text-amber-600 border-amber-200"
                              >
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              article.author?.avatar_url ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${article.author?.name}`
                            }
                            alt={article.author?.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm">{article.author?.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(article.status)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className="text-sm px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: `${article.category?.color}20`,
                            color: article.category?.color,
                          }}
                        >
                          {article.category?.name}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {article.view_count.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-500">
                        {article.published_at
                          ? format(new Date(article.published_at), 'MMM d, yyyy')
                          : format(new Date(article.updated_at), 'MMM d, yyyy')}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/article/${article.slug}`)
                              }
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/admin/articles/${article.id}/edit`)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(article)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(article.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {!isLoading && filteredArticles.length > 0 && (
          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>
              Showing {filteredArticles.length} of {articles.length} articles
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
