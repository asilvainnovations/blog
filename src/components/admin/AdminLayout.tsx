import { useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Image,
  Users,
  Settings,
  BarChart3,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Newspaper,
  Tags,
  MessageSquare,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: FileText, label: 'All Articles', href: '/admin/articles' },
  { icon: PlusCircle, label: 'New Article', href: '/admin/articles/new' },
  { icon: Newspaper, label: 'Categories', href: '/admin/categories' },
  { icon: Tags, label: 'Tags', href: '/admin/tags' },
  { icon: Image, label: 'Media Library', href: '/admin/media' },
  { icon: MessageSquare, label: 'Comments', href: '/admin/comments' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, isEditor, author, signOut } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Redirect if not admin or editor
  if (!isAdmin && !isEditor) {
    return <Navigate to="/" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link to="/admin" className="flex items-center gap-3">
            <img
              src="https://asilvainnovations.com/assets/apps/user_1097/app_13212/draft/icon/app_logo.png?1772033116"
              alt="ASilva"
              className="h-8 w-auto"
            />
            <span className="font-bold text-lg">Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/admin' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${author?.name}`}
              alt={author?.name}
              className="w-10 h-10 rounded-full bg-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{author?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{author?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-4 ml-auto">
            <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
              View Site
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
