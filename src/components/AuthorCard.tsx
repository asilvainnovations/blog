import { Twitter, Linkedin, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Author } from '@/types';

interface AuthorCardProps {
  author: Author;
}

export function AuthorCard({ author }: AuthorCardProps) {
  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    editor: 'Editor',
    author: 'Author',
    contributor: 'Contributor',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start gap-4">
        <img
          src={author.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${author.name}`}
          alt={author.name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-slate-900">{author.name}</h3>
            <Badge variant="secondary" className="text-xs">
              {roleLabels[author.role] || 'Author'}
            </Badge>
          </div>
          
          {author.bio && (
            <p className="text-slate-600 text-sm mb-4 line-clamp-3">{author.bio}</p>
          )}

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {author.social_links?.twitter && (
              <a
                href={author.social_links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-100 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {author.social_links?.linkedin && (
              <a
                href={author.social_links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-100 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {author.social_links?.website && (
              <a
                href={author.social_links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-100 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                aria-label="Website"
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
