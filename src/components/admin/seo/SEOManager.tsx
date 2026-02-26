import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Search, Share2, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SEOManagerProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  onChange: (seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
    canonicalUrl: string;
  }) => void;
}

export function SEOManager({
  title,
  description,
  keywords = '',
  ogImage = '',
  canonicalUrl = '',
  onChange,
}: SEOManagerProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [seoData, setSeoData] = useState({
    title: title || '',
    description: description || '',
    keywords: keywords || '',
    ogImage: ogImage || '',
    canonicalUrl: canonicalUrl || '',
  });

  useEffect(() => {
    onChange(seoData);
  }, [seoData]);

  const titleLength = seoData.title.length;
  const descriptionLength = seoData.description.length;
  const titleScore = Math.min((titleLength / 60) * 100, 100);
  const descriptionScore = Math.min((descriptionLength / 160) * 100, 100);

  const getTitleStatus = () => {
    if (titleLength === 0) return { color: 'bg-red-500', text: 'Missing title', status: 'error' };
    if (titleLength < 30) return { color: 'bg-yellow-500', text: 'Title too short', status: 'warning' };
    if (titleLength > 60) return { color: 'bg-yellow-500', text: 'Title too long', status: 'warning' };
    return { color: 'bg-green-500', text: 'Perfect title length', status: 'success' };
  };

  const getDescriptionStatus = () => {
    if (descriptionLength === 0) return { color: 'bg-red-500', text: 'Missing description', status: 'error' };
    if (descriptionLength < 120) return { color: 'bg-yellow-500', text: 'Description too short', status: 'warning' };
    if (descriptionLength > 160) return { color: 'bg-yellow-500', text: 'Description too long', status: 'warning' };
    return { color: 'bg-green-500', text: 'Perfect description length', status: 'success' };
  };

  const titleStatus = getTitleStatus();
  const descriptionStatus = getDescriptionStatus();

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="gap-2">
            <Search className="h-4 w-4" />
            SEO Settings
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Globe className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="h-4 w-4" />
            Social
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Meta Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-title">Meta Title</Label>
              <span className={cn(
                'text-xs font-medium',
                titleStatus.status === 'success' ? 'text-green-600' :
                titleStatus.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
              )}>
                {titleLength}/60
              </span>
            </div>
            <Input
              id="seo-title"
              value={seoData.title}
              onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
              placeholder="Enter SEO-optimized title..."
              className={cn(
                titleStatus.status === 'error' && 'border-red-500 focus-visible:ring-red-500',
                titleStatus.status === 'warning' && 'border-yellow-500 focus-visible:ring-yellow-500'
              )}
            />
            <Progress value={titleScore} className={cn('h-1', titleStatus.color)} />
            <p className="text-xs text-slate-500">{titleStatus.text}</p>
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-description">Meta Description</Label>
              <span className={cn(
                'text-xs font-medium',
                descriptionStatus.status === 'success' ? 'text-green-600' :
                descriptionStatus.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
              )}>
                {descriptionLength}/160
              </span>
            </div>
            <Textarea
              id="seo-description"
              value={seoData.description}
              onChange={(e) => setSeoData({ ...seoData, description: e.target.value })}
              placeholder="Enter compelling meta description..."
              rows={3}
              className={cn(
                descriptionStatus.status === 'error' && 'border-red-500 focus-visible:ring-red-500',
                descriptionStatus.status === 'warning' && 'border-yellow-500 focus-visible:ring-yellow-500'
              )}
            />
            <Progress value={descriptionScore} className={cn('h-1', descriptionStatus.color)} />
            <p className="text-xs text-slate-500">{descriptionStatus.text}</p>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label htmlFor="seo-keywords">Keywords</Label>
            <Input
              id="seo-keywords"
              value={seoData.keywords}
              onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
              placeholder="Enter keywords separated by commas..."
            />
            <p className="text-xs text-slate-500">
              Separate keywords with commas (e.g., innovation, leadership, technology)
            </p>
          </div>

          {/* Canonical URL */}
          <div className="space-y-2">
            <Label htmlFor="canonical-url">Canonical URL</Label>
            <Input
              id="canonical-url"
              value={seoData.canonicalUrl}
              onChange={(e) => setSeoData({ ...seoData, canonicalUrl: e.target.value })}
              placeholder="https://example.com/article-slug"
            />
            <p className="text-xs text-slate-500">
              Use this if the content appears on multiple URLs
            </p>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {/* Google Search Preview */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Search className="h-4 w-4" />
              Google Search Preview
            </h4>
            <div className="bg-white rounded-lg border p-4 max-w-2xl">
              <div className="space-y-1">
                <p className="text-xs text-slate-600 truncate">
                  asilvainnovations.com › article › ...
                </p>
                <h3 className={cn(
                  'text-xl text-blue-700 hover:underline cursor-pointer',
                  !seoData.title && 'text-slate-400 italic'
                )}>
                  {seoData.title || 'Your title will appear here'}
                </h3>
                <p className={cn(
                  'text-sm text-slate-600 line-clamp-2',
                  !seoData.description && 'text-slate-400 italic'
                )}>
                  {seoData.description || 'Your meta description will appear here. Make it compelling to increase click-through rates.'}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Preview */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile Preview
            </h4>
            <div className="bg-white rounded-lg border p-4 max-w-sm">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 truncate">
                  asilvainnovations.com
                </p>
                <h3 className={cn(
                  'text-base text-blue-700 line-clamp-2',
                  !seoData.title && 'text-slate-400 italic'
                )}>
                  {seoData.title || 'Your title will appear here'}
                </h3>
                <p className={cn(
                  'text-xs text-slate-600 line-clamp-3',
                  !seoData.description && 'text-slate-400 italic'
                )}>
                  {seoData.description || 'Your meta description will appear here.'}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          {/* Open Graph Image */}
          <div className="space-y-2">
            <Label htmlFor="og-image">Open Graph Image URL</Label>
            <Input
              id="og-image"
              value={seoData.ogImage}
              onChange={(e) => setSeoData({ ...seoData, ogImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-slate-500">
              Recommended size: 1200x630 pixels
            </p>
          </div>

          {/* Social Preview */}
          {seoData.ogImage && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Social Media Preview
              </h4>
              <div className="bg-white rounded-lg border max-w-md overflow-hidden">
                <img
                  src={seoData.ogImage}
                  alt="Open Graph Preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x630?text=Invalid+Image+URL';
                  }}
                />
                <div className="p-3 bg-slate-50">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    ASILVAINNOVATIONS.COM
                  </p>
                  <h4 className="font-semibold text-sm line-clamp-2 mt-1">
                    {seoData.title || 'Article Title'}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                    {seoData.description || 'Article description'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
