'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Newspaper, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  FileEdit,
  X,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminNews } from '@/lib/adminMock';

interface ContentNewsViewProps {
  news: AdminNews[];
  setNews: (news: AdminNews[]) => void;
  logAction: (action: string) => void;
  permissions: Record<string, boolean>;
}

export default function ContentNewsView({
  news,
  setNews,
  logAction,
  permissions
}: ContentNewsViewProps) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Published' | 'Draft'>('All');
  
  // Modals state
  const [newsModalType, setNewsModalType] = useState<'add' | 'edit' | null>(null);
  const [activeArticle, setActiveArticle] = useState<AdminNews | null>(null);
  
  // News Form state
  const [newsForm, setNewsForm] = useState({
    title: '',
    summary: '',
    category: 'Macroeconomics',
    status: 'Published' as 'Published' | 'Draft',
    featured: false
  });

  const canModify = permissions.news;

  // Filtered news
  const filteredNews = news.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = activeFilter === 'All' || item.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // Action handlers
  const handleToggleStatus = (id: string, current: 'Published' | 'Draft') => {
    if (!canModify) return toast.error('Access Denied: Support and Finance roles cannot manage news articles.');
    const nextStatus = (current === 'Published' ? 'Draft' : 'Published') as 'Published' | 'Draft';
    
    const updated = news.map(n => {
      if (n.id === id) return { ...n, status: nextStatus };
      return n;
    });
    setNews(updated);
    logAction(`Toggled News status ID ${id} to ${nextStatus}`);
    toast.success(`Article marked as ${nextStatus}`);
  };

  const handleToggleFeatured = (id: string, current: boolean) => {
    if (!canModify) return toast.error('Access Denied');
    const updated = news.map(n => {
      if (n.id === id) return { ...n, featured: !current };
      return n;
    });
    setNews(updated);
    logAction(`Toggled News Featured flag ID ${id} to ${!current}`);
    toast.success(!current ? 'Article is now Featured' : 'Article removed from Featured list');
  };

  const handleDelete = (id: string, title: string) => {
    if (!canModify) return toast.error('Access Denied');
    if (confirm(`Are you sure you want to delete this news article: "${title}"?`)) {
      const updated = news.filter(n => n.id !== id);
      setNews(updated);
      logAction(`Deleted News article ID ${id}: "${title}"`);
      toast.success('Article deleted');
    }
  };

  const openAddNews = () => {
    if (!canModify) return toast.error('Access Denied');
    setNewsModalType('add');
    setNewsForm({
      title: '',
      summary: '',
      category: 'Macroeconomics',
      status: 'Published',
      featured: false
    });
  };

  const openEditNews = (item: AdminNews) => {
    if (!canModify) return toast.error('Access Denied');
    setNewsModalType('edit');
    setActiveArticle(item);
    setNewsForm({
      title: item.title,
      summary: item.summary,
      category: item.category,
      status: item.status,
      featured: item.featured
    });
  };

  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModify) return;

    if (newsModalType === 'add') {
      const newArt: AdminNews = {
        id: `nws-${Math.floor(100 + Math.random() * 900)}`,
        title: newsForm.title,
        summary: newsForm.summary,
        category: newsForm.category,
        status: newsForm.status,
        publishedAt: new Date().toISOString(),
        featured: newsForm.featured
      };
      setNews([newArt, ...news]);
      logAction(`Created News article: "${newArt.title}"`);
      toast.success('Article published successfully');
    } else if (newsModalType === 'edit' && activeArticle) {
      const updated = news.map(n => {
        if (n.id === activeArticle.id) {
          return {
            ...n,
            title: newsForm.title,
            summary: newsForm.summary,
            category: newsForm.category,
            status: newsForm.status,
            featured: newsForm.featured
          };
        }
        return n;
      });
      setNews(updated);
      logAction(`Modified News article: "${newsForm.title}"`);
      toast.success('Article updated successfully');
    }

    setNewsModalType(null);
    setActiveArticle(null);
  };

  return (
    <div className="space-y-6">
      {/* Control panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-panel border border-border/80 rounded-xl p-4">
        {/* Search & Status Toggle */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              placeholder="Search news, summaries..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-card text-xs"
            />
          </div>

          <div className="flex border border-border rounded overflow-hidden">
            {(['All', 'Published', 'Draft'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  activeFilter === f ? 'bg-muted text-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Add news */}
        <Button size="sm" onClick={openAddNews} className="gap-1.5 cursor-pointer font-bold shrink-0 text-xs">
          <Plus className="w-4 h-4" /> Publish Article
        </Button>
      </div>

      {/* Articles Grid List */}
      {filteredNews.length === 0 ? (
        <Card className="bg-panel border-border/80 p-12 text-center text-muted-foreground italic">
          No news articles listed inside search queries.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-200">
          {filteredNews.map(art => (
            <Card key={art.id} className="bg-panel border-border/80 hover:border-primary/20 transition-all duration-300 relative overflow-hidden group">
              <CardContent className="p-5 flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* Category and date tags */}
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <span className="bg-muted text-primary border border-border px-1.5 py-0.5 rounded font-semibold">
                      {art.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(art.publishedAt).toLocaleString()}
                    </span>
                    {art.featured && (
                      <span className="inline-flex items-center gap-0.5 bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded font-bold">
                        <Sparkles className="w-3 h-3" /> FEATURED
                      </span>
                    )}
                  </div>

                  {/* Title and Summary */}
                  <h3 className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                    {art.summary}
                  </p>
                </div>

                {/* Operations and status */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0 w-full md:w-auto border-t md:border-t-0 border-border pt-3 md:pt-0">
                  <div className="text-right">
                    <Badge 
                      variant={art.status === 'Published' ? 'default' : 'secondary'}
                      className="text-[9px] font-mono py-0 font-bold uppercase tracking-wider cursor-pointer"
                      onClick={() => handleToggleStatus(art.id, art.status)}
                      title="Click to toggle publish status"
                    >
                      {art.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleFeatured(art.id, art.featured)}
                      title={art.featured ? "Remove featured spotlight" : "Spotlight as Featured"}
                      className={`p-1.5 rounded hover:bg-muted cursor-pointer transition-colors ${
                        art.featured ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditNews(art)}
                      title="Edit article"
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <FileEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(art.id, art.title)}
                      title="Delete Article"
                      className="p-1.5 rounded hover:bg-muted text-bearish cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ARTICLE EDIT/ADD MODAL */}
      {newsModalType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleNewsSubmit}
            className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                {newsModalType === 'add' ? 'Publish Press Bulletin' : 'Edit Press Bulletin'}
              </h3>
              <button 
                type="button" 
                onClick={() => { setNewsModalType(null); setActiveArticle(null); }}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold block">Bulletin Category</label>
                  <select 
                    value={newsForm.category}
                    onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="w-full bg-card border border-border rounded px-2.5 py-2 text-foreground outline-none mt-1"
                  >
                    <option value="Macroeconomics">Macroeconomics</option>
                    <option value="Technology">Technology</option>
                    <option value="Crypto">Crypto Assets</option>
                    <option value="Equities Market">Equities Market</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold block">Publish Status</label>
                  <select 
                    value={newsForm.status}
                    onChange={e => setNewsForm({ ...newsForm, status: e.target.value as any })}
                    className="w-full bg-card border border-border rounded px-2.5 py-2 text-foreground outline-none mt-1"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Article Headline</label>
                <Input 
                  value={newsForm.title}
                  onChange={e => setNewsForm({ ...newsForm, title: e.target.value })}
                  placeholder="e.g. Fed Policy Rotations..."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Content Summary</label>
                <textarea 
                  value={newsForm.summary}
                  onChange={e => setNewsForm({ ...newsForm, summary: e.target.value })}
                  placeholder="e.g. Summary of structural changes..."
                  rows={4}
                  required
                  className="w-full bg-card border border-border rounded p-2.5 text-xs text-foreground outline-none resize-none focus:border-primary/50"
                />
              </div>

              <div className="flex items-center gap-2 bg-muted/20 border border-border p-2.5 rounded">
                <input 
                  type="checkbox"
                  id="featuredToggle"
                  checked={newsForm.featured}
                  onChange={e => setNewsForm({ ...newsForm, featured: e.target.checked })}
                  className="w-4 h-4 cursor-pointer accent-primary"
                />
                <label htmlFor="featuredToggle" className="cursor-pointer font-bold text-foreground flex items-center gap-1 select-none">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Mark article as Featured
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/20">
              <Button type="button" variant="ghost" onClick={() => { setNewsModalType(null); setActiveArticle(null); }} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                Confirm News Publication
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
