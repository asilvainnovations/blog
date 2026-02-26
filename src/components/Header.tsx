import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Search,
  Menu,
  User,
  Bookmark,
  Settings,
  LogOut,
  ChevronDown,
  Zap,
  Shield,
  Heart,
  Brain,
  Users,
  BarChart3,
  FileEdit,
} from 'lucide-react';

const categories = [
  { name: 'Systems Innovations', slug: 'systems-innovations', icon: Zap, color: '#0EA5E9' },
  { name: 'Integrated Risk Management', slug: 'integrated-risk-management', icon: Shield, color: '#F59E0B' },
  { name: 'Resilience', slug: 'resilience', icon: Heart, color: '#10B981' },
  { name: 'AI and Analytics', slug: 'ai-and-analytics', icon: Brain, color: '#8B5CF6' },
  { name: 'Real-Time Leadership', slug: 'real-time-leadership', icon: Users, color: '#EC4899' },
];

interface HeaderProps {
  onAuthClick: () => void;
}

export function Header({ onAuthClick }: HeaderProps) {
  const { user, author, isAuthenticated, isAdmin, isEditor, signOut } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://asilvainnovations.com/assets/apps/user_1097/app_13212/draft/icon/app_logo.png?1772033116"
              alt="ASilva Innovations"
              className="h-10 w-auto"
            />
            <span className={`font-bold text-lg hidden sm:block transition-colors ${
              isScrolled ? 'text-slate-900' : 'text-white'
            }`}>
              ASilva Innovations
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/">
              <Button
                variant="ghost"
                className={`${isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
              >
                Home
              </Button>
            </Link>

            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`${isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
                >
                  Topics
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64">
                {categories.map((category) => (
                  <DropdownMenuItem key={category.slug} asChild>
                    <Link
                      to={`/category/${category.slug}`}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <category.icon className="h-4 w-4" style={{ color: category.color }} />
                      <span>{category.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/articles">
              <Button
                variant="ghost"
                className={`${isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
              >
                Articles
              </Button>
            </Link>

            {(isAdmin || isEditor) && (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  className={`${isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
                >
                  Admin
                </Button>
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="w-full">
                <form onSubmit={handleSearch} className="flex gap-2 mt-4">
                  <Input
                    type="search"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button type="submit">Search</Button>
                </form>
              </SheetContent>
            </Sheet>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-2 ${isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
                  >
                    <img
                      src={author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email}`}
                      alt={author?.name || 'User'}
                      className="h-8 w-8 rounded-full"
                    />
                    <span className="hidden sm:inline">{author?.name?.split(' ')[0] || 'Account'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{author?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/bookmarks')}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    Bookmarks
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  {(isAdmin || isEditor) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/admin/articles/new')}>
                        <FileEdit className="mr-2 h-4 w-4" />
                        New Article
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={onAuthClick}
                variant={isScrolled ? 'default' : 'outline'}
                className={isScrolled ? '' : 'border-white text-white hover:bg-white hover:text-slate-900'}
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`lg:hidden ${isScrolled ? 'text-slate-700 hover:text-slate-900' : 'text-white/90 hover:text-white hover:bg-white/10'}`}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-4 mt-8">
                  <Link to="/" className="text-lg font-medium">Home</Link>
                  <Link to="/articles" className="text-lg font-medium">Articles</Link>
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Topics</p>
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        to={`/category/${category.slug}`}
                        className="flex items-center gap-2 py-2 text-sm"
                      >
                        <category.icon className="h-4 w-4" style={{ color: category.color }} />
                        {category.name}
                      </Link>
                    ))}
                  </div>
                  {isAuthenticated && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-muted-foreground mb-2">Account</p>
                      <Link to="/profile" className="block py-2 text-sm">Profile</Link>
                      <Link to="/bookmarks" className="block py-2 text-sm">Bookmarks</Link>
                      <Link to="/settings" className="block py-2 text-sm">Settings</Link>
                      {(isAdmin || isEditor) && (
                        <Link to="/admin" className="block py-2 text-sm">Admin Dashboard</Link>
                      )}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
