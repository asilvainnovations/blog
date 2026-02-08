import React, { useState } from 'react';
import { 
  LayoutDashboard, FileText, MessageSquare, Users, 
  Mail, Settings, ShieldAlert, ChevronRight 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Analytics from '../Analytics'; // Importing the Analytics component
import { cn } from '@/lib/utils'; // Using your utility function

type AdminTab = 'overview' | 'articles' | 'comments' | 'users' | 'newsletter' | 'settings';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const { profile } = useAuth();

  // RBAC Check: Ensure only Admins or Editors can view this page
  const isAuthorized = profile?.role === 'admin' || profile?.role === 'editor';

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">
            You do not have the required permissions to access the Admin Dashboard. 
            Please contact your system administrator.
          </p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'articles', label: 'Article Management', icon: FileText },
    { id: 'comments', label: 'Comment Moderation', icon: MessageSquare },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'newsletter', label: 'Subscribers', icon: Mail },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Analytics />; // Rendering your attached Analytics component
      case 'articles':
        return <div className="p-8 text-center text-gray-500">Article CRUD Management UI placeholder</div>;
      case 'comments':
        return <div className="p-8 text-center text-gray-600">Comment Moderation Workflow placeholder</div>;
      case 'users':
        return <div className="p-8 text-center text-gray-600">RBAC User Management UI placeholder</div>;
      case 'newsletter':
        return <div className="p-8 text-center text-gray-600">Subscriber Segmentation & Export placeholder</div>;
      default:
        return <Analytics />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-100 pt-24 hidden lg:block">
        <div className="px-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Signed in as</p>
            <p className="font-bold text-gray-900 truncate">{profile?.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
          </div>
        </div>

        <nav className="px-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                activeTab === item.id 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
              {activeTab === item.id && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-0">
        {/* If Overview/Analytics is chosen, it already has its own pt-24 and layout */}
        {activeTab === 'overview' ? (
          <div className="lg:-mt-24"> {/* Offset the layout difference */}
            {renderTabContent()}
          </div>
        ) : (
          <div className="pt-24 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
              <p className="text-gray-600">Manage your blog's {activeTab} settings and data.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px]">
              {renderTabContent()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}