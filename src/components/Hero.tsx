import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ArticleWithRelations } from '@/types';

interface HeroProps {
  featuredArticles: ArticleWithRelations[];
  isLoading?: boolean;
}

export function Hero({ featuredArticles, isLoading = false }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % featuredArticles.length);
  }, [featuredArticles.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
  }, [featuredArticles.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || featuredArticles.length <= 1) return;

    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, featuredArticles.length]);

  if (isLoading) {
    return (
      <section className="relative min-h-[600px] lg:min-h-[700px] bg-gradient-to-br from-slate-900 via-blue-900 to-teal-800 flex items-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-white/20 rounded mb-6" />
            <div className="h-16 w-3/4 bg-white/20 rounded mb-4" />
            <div className="h-16 w-1/2 bg-white/20 rounded mb-8" />
            <div className="h-4 w-full max-w-2xl bg-white/10 rounded mb-2" />
            <div className="h-4 w-2/3 bg-white/10 rounded" />
          </div>
        </div>
      </section>
    );
  }

  if (featuredArticles.length === 0) {
    return null;
  }

  const currentArticle = featuredArticles[currentIndex];

  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] bg-gradient-to-br from-slate-900 via-blue-900 to-teal-800 flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div className="space-y-6">
            {/* Category Badge */}
            {currentArticle.category && (
              <Link
                to={`/category/${currentArticle.category.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: `${currentArticle.category.color}20`,
                  color: currentArticle.category.color,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: currentArticle.category.color }}
                />
                {currentArticle.category.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              <Link
                to={`/article/${currentArticle.slug}`}
                className="hover:text-blue-200 transition-colors"
              >
                {currentArticle.title}
              </Link>
            </h1>

            {/* Excerpt */}
            {currentArticle.excerpt && (
              <p className="text-lg text-white/80 max-w-xl leading-relaxed">
                {currentArticle.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
              {currentArticle.author && (
                <div className="flex items-center gap-2">
                  <img
                    src={currentArticle.author.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentArticle.author.name}`}
                    alt={currentArticle.author.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{currentArticle.author.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{currentArticle.read_time} min read</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to={`/article/${currentArticle.slug}`}>
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-white/90 group"
                >
                  Read Article
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/articles">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  View All Articles
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Featured Image */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={currentArticle.featured_image || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'}
                alt={currentArticle.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 border-2 border-white flex items-center justify-center text-xs text-white font-medium"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Join 10,000+ readers</p>
                <p className="text-xs text-slate-500">Weekly insights delivered</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation */}
        {featuredArticles.length > 1 && (
          <div className="flex items-center justify-between mt-12">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {featuredArticles.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
