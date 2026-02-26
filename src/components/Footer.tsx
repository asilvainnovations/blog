import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNewsletter } from '@/hooks/useNewsletter';
import {
  Zap,
  Shield,
  Heart,
  Brain,
  Users,
  Twitter,
  Linkedin,
  Facebook,
  Youtube,
  Mail,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const contentPillars = [
  { name: 'Systems Innovations', slug: 'systems-innovations', icon: Zap },
  { name: 'Integrated Risk Management', slug: 'integrated-risk-management', icon: Shield },
  { name: 'Resilience', slug: 'resilience', icon: Heart },
  { name: 'AI and Analytics', slug: 'ai-and-analytics', icon: Brain },
  { name: 'Real-Time Leadership', slug: 'real-time-leadership', icon: Users },
];

const resourceLinks = [
  { name: 'Articles', href: '/articles' },
  { name: 'Case Studies', href: '/case-studies' },
  { name: 'Whitepapers', href: '/whitepapers' },
  { name: 'Webinars', href: '/webinars' },
  { name: 'Podcasts', href: '/podcasts' },
];

const companyLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Our Team', href: '/team' },
  { name: 'Careers', href: '/careers' },
  { name: 'Contact', href: '/contact' },
  { name: 'Press Kit', href: '/press' },
];

const legalLinks = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Cookie Policy', href: '/cookies' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const { subscribe, isLoading, success, error, reset } = useNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    await subscribe(email);
    if (success) {
      setEmail('');
      setTimeout(reset, 5000);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Stay Ahead of the Curve
              </h3>
              <p className="text-slate-400">
                Get weekly insights on systems innovation, risk management, and leadership delivered to your inbox.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  'Subscribing...'
                ) : success ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            {error && (
              <p className="text-red-400 text-sm lg:col-start-2">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img
                src="https://asilvainnovations.com/assets/apps/user_1097/app_13212/draft/icon/app_logo.png?1772033116"
                alt="ASilva Innovations"
                className="h-10 w-auto"
              />
              <span className="font-bold text-white">ASilva Innovations</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6">
              Empowering organizations to navigate complexity and build resilient, adaptive systems for sustainable success.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/asilvainnovations"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/company/asilvainnovations"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com/asilvainnovations"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com/asilvainnovations"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Content Pillars */}
          <div>
            <h4 className="font-semibold text-white mb-4">Topics</h4>
            <ul className="space-y-2">
              {contentPillars.map((pillar) => (
                <li key={pillar.slug}>
                  <Link
                    to={`/category/${pillar.slug}`}
                    className="text-sm hover:text-white transition-colors flex items-center gap-2"
                  >
                    <pillar.icon className="h-3 w-3" />
                    {pillar.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} ASilva Innovations. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
