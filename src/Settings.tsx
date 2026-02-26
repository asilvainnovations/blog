import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNewsletter } from '@/hooks/useNewsletter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Bell, CheckCircle, Loader2 } from 'lucide-react';

interface SettingsProps {
  onAuthClick: () => void;
}

export function Settings({ onAuthClick }: SettingsProps) {
  const { user, profile, isAuthenticated, updateProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(profile?.newsletter_subscribed || false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Sign In Required</h1>
          <p className="text-slate-600 mb-6">
            Please sign in to access your settings.
          </p>
          <Button onClick={onAuthClick}>Sign In</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const { error } = await updateProfile({
      display_name: displayName,
      bio,
      newsletter_subscribed: newsletterSubscribed,
    });

    if (error) {
      setErrorMessage(error);
    } else {
      setSuccessMessage('Settings updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }

    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Settings</h1>
          <p className="text-lg text-slate-600">
            Manage your profile, preferences, and account settings.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-slate-500 mb-2">
                  Profile picture can be updated through Gravatar using your email.
                </p>
                <p className="text-sm font-medium text-slate-700">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How you want to be called"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about yourself"
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Newsletter Preferences</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Subscribe to newsletter</p>
                <p className="text-sm text-slate-500">
                  Receive weekly insights and updates
                </p>
              </div>
              <Switch
                checked={newsletterSubscribed}
                onCheckedChange={setNewsletterSubscribed}
              />
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Comment replies</p>
                  <p className="text-sm text-slate-500">
                    Get notified when someone replies to your comments
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">New articles</p>
                  <p className="text-sm text-slate-500">
                    Get notified about new articles in your favorite categories
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          {/* Alerts */}
          {successMessage && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
