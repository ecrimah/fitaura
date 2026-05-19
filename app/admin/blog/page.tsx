'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ImageUploadField from '@/components/admin/ImageUploadField';

type BlogStatus = 'draft' | 'published' | 'scheduled' | 'archived';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  status: BlogStatus;
  published_at: string | null;
  seo_title: string;
  seo_description: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

const EMPTY_POST: BlogPost = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image: null,
  status: 'draft',
  published_at: null,
  seo_title: '',
  seo_description: '',
  tags: [],
};

const STATUS_STYLE: Record<BlogStatus, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  scheduled: 'bg-amber-100 text-amber-700',
  archived: 'bg-gray-200 text-gray-500',
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | BlogStatus>('all');
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, content, featured_image, status, published_at, seo_title, seo_description, tags, created_at, updated_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts((data ?? []) as BlogPost[]);
    } catch (err) {
      console.error('Fetch posts failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.slug.trim() || !editing.content.trim()) {
      return alert('Please fill title, slug and content.');
    }
    setSaving(true);
    try {
      const payload = {
        title: editing.title,
        slug: editing.slug,
        excerpt: editing.excerpt,
        content: editing.content,
        featured_image: editing.featured_image,
        status: editing.status,
        published_at: editing.status === 'published' && !editing.published_at
          ? new Date().toISOString()
          : editing.published_at,
        seo_title: editing.seo_title || null,
        seo_description: editing.seo_description || null,
        tags: editing.tags,
        updated_at: new Date().toISOString(),
      };
      if (editing.id) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', editing.id);
        if (error) throw error;
    } else {
        const { error } = await supabase.from('blog_posts').insert(payload);
        if (error) throw error;
      }
      setEditing(null);
      await fetchPosts();
    } catch (err: unknown) {
      alert('Save failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) return alert('Delete failed: ' + error.message);
    setPosts(posts.filter((p) => p.id !== id));
  };

  const handleStatusToggle = async (post: BlogPost) => {
    if (!post.id) return;
    const next: BlogStatus = post.status === 'published' ? 'draft' : 'published';
    await supabase
      .from('blog_posts')
      .update({
        status: next,
        published_at: next === 'published' && !post.published_at ? new Date().toISOString() : post.published_at,
      })
      .eq('id', post.id);
    fetchPosts();
  };

  const filtered = filter === 'all' ? posts : posts.filter((p) => p.status === filter);

  const counts = {
    all: posts.length,
    published: posts.filter((p) => p.status === 'published').length,
    draft: posts.filter((p) => p.status === 'draft').length,
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    archived: posts.filter((p) => p.status === 'archived').length,
  };

  if (loading) return <div className="text-center text-gray-500 py-20">Loading posts…</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display tracking-wide text-gray-900">Journal</h1>
          <p className="text-sm text-gray-500 mt-1">Write, publish, and manage FITAURA journal entries.</p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY_POST })}
          className="bg-sienna-500 hover:bg-sienna-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          + New Post
        </button>
      </header>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6 overflow-x-auto">
          {([
            ['all', `All (${counts.all})`],
            ['published', `Published (${counts.published})`],
            ['draft', `Draft (${counts.draft})`],
            ['scheduled', `Scheduled (${counts.scheduled})`],
            ['archived', `Archived (${counts.archived})`],
          ] as [typeof filter, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${filter === id ? 'border-sienna-500 text-sienna-500' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map((p) => (
          <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
            <div className="w-24 h-16 rounded bg-gray-100 overflow-hidden flex-shrink-0">
              {p.featured_image && (
                // eslint-disable-next-line @next/next/no-img-element -- admin thumb
                <img src={p.featured_image} alt="" className="w-full h-full object-cover" />
              )}
        </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{p.title}</div>
              <div className="text-sm text-gray-500 truncate">{p.excerpt || '—'}</div>
              <div className="text-xs text-gray-400 mt-1">
                /{p.slug}
                {p.published_at && <> · Published {new Date(p.published_at).toLocaleDateString()}</>}
      </div>
            </div>
              <button
              onClick={() => handleStatusToggle(p)}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider ${STATUS_STYLE[p.status]}`}
            >
              {p.status}
              </button>
            <button onClick={() => setEditing(p)} className="text-sienna-500 hover:text-sienna-600 text-sm font-medium px-3 py-1">Edit</button>
            <button onClick={() => p.id && handleDelete(p.id)} className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1">Delete</button>
            </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-12 bg-white border border-dashed border-gray-300 rounded-lg">
            No posts yet. Click &ldquo;New Post&rdquo; to write your first journal entry.
          </div>
        )}
        </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[92vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">{editing.id ? 'Edit Post' : 'New Post'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-900">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <Field
                label="Title"
                value={editing.title}
                onChange={(v) => setEditing({
                  ...editing,
                  title: v,
                  // Auto-fill slug only when slug is empty or matches previous slugified title
                  slug: !editing.slug || editing.slug === slugify(editing.title) ? slugify(v) : editing.slug,
                })}
                placeholder="The FITAURA training notebook"
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Field label="Slug" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: slugify(v) })} placeholder="the-fitaura-training-notebook" />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                  <select
                    value={editing.status}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value as BlogStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-sienna-500 focus:border-sienna-500 outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                  </select>
            </div>
          </div>

              <Field label="Excerpt" textarea value={editing.excerpt} onChange={(v) => setEditing({ ...editing, excerpt: v })} placeholder="A short summary shown on the journal index." />

              <ImageUploadField
                label="Featured image"
                hint="Recommended 1600×900 (16:9). Appears as the cover on the journal page and in social shares."
                value={editing.featured_image}
                onChange={(url) => setEditing({ ...editing, featured_image: url || null })}
                bucket="blog"
                pathPrefix="posts"
                aspectClassName="aspect-[16/9]"
                allowUrlFallback
                disabled={saving}
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content (HTML)</label>
                <textarea
                  rows={14}
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  placeholder="<p>Write your story…</p>"
                  className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-[13px] focus:ring-2 focus:ring-sienna-500 focus:border-sienna-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">HTML is sanitized before render — safe tags only.</p>
          </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (comma separated)</label>
                    <input
                  type="text"
                  value={editing.tags.join(', ')}
                  onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
                  placeholder="training, design, behind the brand"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                        </div>

              <details className="border border-gray-200 rounded-lg">
                <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-gray-700">SEO (optional)</summary>
                <div className="p-4 space-y-4 border-t border-gray-200">
                  <Field label="SEO title" value={editing.seo_title} onChange={(v) => setEditing({ ...editing, seo_title: v })} placeholder="Custom title for search engines" />
                  <Field label="SEO description" textarea value={editing.seo_description} onChange={(v) => setEditing({ ...editing, seo_description: v })} placeholder="Meta description (150-160 chars)" />
                        </div>
              </details>
                      </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setEditing(null)} className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="bg-sienna-500 hover:bg-sienna-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                {saving ? 'Saving…' : editing.id ? 'Update Post' : 'Create Post'}
                        </button>
                      </div>
          </div>
        </div>
      )}
      </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-sienna-500 focus:border-sienna-500 outline-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-sienna-500 focus:border-sienna-500 outline-none"
        />
      )}
    </div>
  );
}
