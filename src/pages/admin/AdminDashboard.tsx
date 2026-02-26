import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { mockArticles, mockCategories } from '@/data/mockData';
import {
  FileText,
  Eye,
  Users,
  TrendingUp,
  MessageSquare,
  Plus,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import type { ArticleWithRelations } from '@/types';

interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalComments: number;
  subscribers: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    totalComments: 0,
    subscribers: 0,
  });
  const [recentArticles, setRecentArticles] = useState<ArticleWithRelations[]>([]);
  const [popularArticles, setPopularArticles] = useState<ArticleWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      // Use mock data
      const articles = mockArticles as ArticleWithRelations[];
      setStats({
        totalArticles: articles.length,
        publishedArticles: articles.filter((a) => a.status === 'published').length,
        draftArticles: articles.filter((a) => a.status === 'draft').length,
        totalViews: articles.reduce((sum, a) => sum + a.view_count, 0),
        totalComments: 0,
        subscribers: 1250,
      });
      setRecentArticles(articles.slice(0, 5));
      setPopularArticles(
        [...articles].sort((a, b) => b.view_count - a.view_count).slice(0, 5)
      );
      setIsLoading(false);
      return;
    }

    // Load stats from Supabase
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*');

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*');

    const { data: subscribers, error: subscribersError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .is('unsubscribed_at', null);

    if (articles) {
      setStats({
        totalArticles: articles.length,
        publishedArticles: articles.filter((a) => a.status === 'published').length,
        draftArticles: articles.filter((a) => a.status === 'draft').length,
        totalViews: articles.reduce((sum, a) => sum + (a.view_count || 0), 0),
        totalComments: comments?.length || 0,
        subscribers: subscribers?.length || 0,
      });

      // Load recent articles
      const { data: recent } = await supabase
        .from('articles')
        .select(`
          *,
          author:authors(*),
          category:categories(*)
        `)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (recent) {
        setRecentArticles(recent as ArticleWithRelations[]);
      }

      // Load popular articles
      const { data: popular } = await supabase
        .from('articles')
        .select(`
          *,
          author:authors(*),
          category:categories(*)
        `)
        .order('view_count', { ascending: false })
        .limit(5);

      if (popular) {
        setPopularArticles(popular as ArticleWithRelations[]);
      }
    }

    setIsLoading(false);
  };

  const statCards = [
    {
      title: 'Total Articles',
      value: stats.totalArticles,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin/articles',
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/admin/analytics',
    },
    {
      title: 'Subscribers',
      value: stats.subscribers.toLocaleString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/admin/settings',
    },
    {
      title: 'Comments',
      value: stats.totalComments,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/admin/comments',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-slate-400" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-slate-500">
              Welcome back! Here's what's happening with your blog.
            </p>
          </div>
          <Link to="/admin/articles/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Link key={stat.title} to={stat.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Content Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Articles */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Articles</CardTitle>
              <Link to="/admin/articles">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentArticles.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>No articles yet</p>
                  <Link to="/admin/articles/new" className="mt-2 inline-block">
                    <Button size="sm">Create your first article</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentArticles.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      {article.featured_image && (
                        <img
                          src={article.featured_image}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(article.status)}
                          <p className="font-medium truncate">{article.title}</p>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-1 mt-1">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span>{article.category?.name}</span>
                          <span>•</span>
                          <span>{article.view_count} views</span>
                          <span>•</span>
                          <span>
                            {format(
                              new Date(article.updated_at),
                              'MMM d, yyyy'
                            )}
                          </span>
                        </div>
                      </div>
                      <Link to={`/admin/articles/${article.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Most Popular
              </CardTitle>
            </CardHeader>
            <CardContent>
              {popularArticles.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>No data yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {popularArticles.map((article, index) => (
                    <div
                      key={article.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-lg font-bold text-slate-300 w-6">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {article.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {article.view_count.toLocaleString()} views
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/admin/articles/new">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                  <Plus className="h-6 w-6" />
                  <span>New Article</span>
                </Button>
              </Link>
              <Link to="/admin/articles">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                  <FileText className="h-6 w-6" />
                  <span>All Articles</span>
                </Button>
              </Link>
              <Link to="/admin/media">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  <span>Media Library</span>
                </Button>
              </Link>
              <Link to="/admin/analytics">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>Analytics</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
