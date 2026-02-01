import React, { useState, useEffect } from 'react';
import { 
  Camera, Plus, Eye, Edit3, Trash2, Save, X, Calendar, Tag, Share2, Search, 
  Menu, Sun, Moon, Users, BarChart3, Mail, Settings, Image as ImageIcon, 
  Video, Code, Link as LinkIcon, Bold, Italic, List, AlignLeft, ChevronDown, 
  Upload, AlertCircle, Check, TrendingUp, FileText, Layout, Zap 
} from 'lucide-react';

// Type definitions
type PostStatus = 'draft' | 'published' | 'scheduled';
type ViewType = 'dashboard' | 'posts' | 'new-post' | 'analytics' | 'settings';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  status: PostStatus;
  category: string;
  tags: string[];
  featuredImage: string;
  views: number;
  readTime: number;
}

type NewPost = Omit<BlogPost, 'id' | 'views' | 'readTime'>;

interface BlogEditorProps {
  post: BlogPost | null;
  onSave: (post: BlogPost | NewPost) => void;
  onCancel: () => void;
}

// Utility function
const cn = (...classes: (string | boolean | undefined | null)[]): string => 
  classes.filter(Boolean).join(' ');
