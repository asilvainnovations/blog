import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  BarChart3,
  FileText,
  MessageSquare,
  Users,
  Mail,
  Eye,
  TrendingUp,
  Clock,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase/client';
import { useAllComments } from '@/hooks/useComments';
import { useAllDrafts } from '@/hooks/useDrafts';
import { useNewsletterSubscribers } from '@/hooks/useNewsletter';
import { format } from 'date-fns';
import type { Article, Comment, Author } from '@/types';

export function AdminDashboard() {
  const { isAdmin, isEditor, author } = useAuth();
  const { summary, isLoading: isAnalyticsLoading } = useAnalytics();
  const { comments: pendingComments, refetch: refetchComments } = useAllComments('pending');
  const { drafts, refetch: refetchDrafts } = useAllDrafts();
  const { subscribers, fetchSubscribers } = useNewsletterSubscribers();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not admin or editor
  if (!isAdmin && !isEditor) {
    return <Navigate to="/" replace />;
  }

  // Fetch all articles
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoadingArticles(true);
      const { data } = await supabase
        .from('articles')
        .select(`
          *,
          author:authors(*),
          category:categories(*)
        `)
        .order('updated_at', { ascending: false });

      if (data) {
        setArticles(data as Article[]);
      }
      setIsLoadingArticles(false);
    };

    fetchArticles();
    fetchSubscribers();
  }, []);

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    await supabase.from('articles').delete().eq('id', id);
    setArticles(articles.filter((a) => a.id !== id));
  };

  const handleModerateComment = async (commentId: string, status: string) => {
    await supabase.from('comments').update({ status }).eq('id', commentId);
    refetchComments();
  };

  const statCards = [
    {
      title: 'Total Views',
      value: summary?.totalViews.toLocaleString() || '0',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Published Articles',
      value: summary?.totalArticles.toLocaleString() || '0',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Subscribers',
      value: summary?.totalSubscribers.toLocaleString() || '0',
      icon: Mail,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Pending Comments',
      value: pendingComments.length.toString(),
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600 mt-1">
                Welcome back, {author?.name}
              </p>
            </div>
            <Link to="/admin/articles/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Article
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="articles" className="gap-2">
              <FileText className="h-4 w-4" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
              {pendingComments.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingComments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="drafts" className="gap-2">
              <Edit className="h-4 w-4" />
              Drafts
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="subscribers" className="gap-2">
                <Users className="h-4 w-4" />
                Subscribers
              </TabsTrigger>
            )}
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Articles</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-slate-500">Title</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500">Author</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500">Views</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-500">Date</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredArticles.map((article) => (
                        <tr key={article.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <Link
                              to={`/article/${article.slug}`}
                              className="font-medium hover:text-blue-600"
                            >
                              {article.title}
                            </Link>
                          </td>
                          <td className="py-3 px-4">{article.author?.name}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                article.status === 'published'
                                  ? 'default'
                                  : article.status === 'draft'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {article.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{article.view_count.toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm text-slate-500">
                            {article.published_at
                              ? format(new Date(article.published_at), 'MMM d, yyyy')
                              : '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/article/${article.slug}`}>View</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/articles/${article.id}/edit`}>Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteArticle(article.id)}
                                >
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <CardTitle>Pending Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingComments.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">
                      No pending comments to moderate.
                    </p>
                  ) : (
                    pendingComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4 border rounded-lg hover:bg-slate-50"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{comment.author_name}</p>
                            <p className="text-sm text-slate-500">
                              On: {(comment as { article?: { title?: string } }).article?.title || 'Unknown'}
                            </p>
                            <p className="mt-2 text-slate-700">{comment.content}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => handleModerateComment(comment.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => handleModerateComment(comment.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drafts Tab */}
          <TabsContent value="drafts">
            <Card>
              <CardHeader>
                <CardTitle>Drafts & Scheduled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drafts.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">
                      No drafts or scheduled articles.
                    </p>
                  ) : (
                    drafts.map((draft) => (
                      <div
                        key={draft.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                      >
                        <div>
                          <p className="font-medium">{draft.title}</p>
                          <p className="text-sm text-slate-500">
                            Status: {draft.status} • Last updated:{' '}
                            {format(new Date(draft.updated_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/admin/articles/${draft.id}/edit`}>Edit</Link>
                          </Button>
                          {draft.status === 'scheduled' && draft.scheduled_at && (
                            <span className="text-sm text-slate-500 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {format(new Date(draft.scheduled_at), 'MMM d, h:mm a')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summary?.topArticles.slice(0, 5).map((article, index) => (
                      <div
                        key={article.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-mono">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <p className="font-medium line-clamp-1">{article.title}</p>
                        </div>
                        <span className="text-sm text-slate-500">
                          {article.views.toLocaleString()} views
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Views by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summary?.viewsByCategory.map((item) => (
                      <div key={item.category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.category}</span>
                          <span>{item.views.toLocaleString()}</span>
                        </div>
                        <Progress
                          value={
                            (item.views / (summary?.totalViews || 1)) * 100
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscribers Tab */}
          {isAdmin && (
            <TabsContent value="subscribers">
              <Card>
                <CardHeader>
                  <CardTitle>Newsletter Subscribers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-slate-500">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-500">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-500">Subscribed</th>
                          <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((subscriber: { id: string; email: string; name?: string; subscribed_at: string; confirmed: boolean }) => (
                          <tr key={subscriber.id} className="border-b hover:bg-slate-50">
                            <td className="py-3 px-4">{subscriber.email}</td>
                            <td className="py-3 px-4">{subscriber.name || '-'}</td>
                            <td className="py-3 px-4 text-sm text-slate-500">
                              {format(new Date(subscriber.subscribed_at), 'MMM d, yyyy')}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={subscriber.confirmed ? 'default' : 'secondary'}>
                                {subscriber.confirmed ? 'Confirmed' : 'Pending'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
