'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import ImageUploadField from '@/components/admin/ImageUploadField';

type Tab = 'hero' | 'brand_story' | 'testimonials';

interface HeroSlideRow {
  id?: string;
  section: 'homepage_hero';
  block_key: string;
  title: string;
  subtitle: string;
  content: string;
  image_url: string;
  button_text: string;
  button_url: string;
  metadata: {
    eyebrow?: string;
    secondary_label?: string;
    secondary_href?: string;
    image_alt?: string;
  };
  sort_order: number;
  is_active: boolean;
}

interface BrandStoryRow {
  id?: string;
  section: 'homepage';
  block_key: 'brand_story';
  title: string;
  subtitle: string;
  content: string;
  image_url: string;
  button_text: string;
  button_url: string;
  metadata: {
    eyebrow?: string;
    image_alt?: string;
    value_props?: Array<{ icon: string; title: string; body: string }>;
  };
  is_active: boolean;
}

interface TestimonialRow {
  id?: string;
  author: string;
  meta: string;
  quote: string;
  rating: number;
  avatar_url: string | null;
  is_active: boolean;
  sort_order: number;
}

const EMPTY_SLIDE: HeroSlideRow = {
  section: 'homepage_hero',
  block_key: '',
  title: '',
  subtitle: '',
  content: '',
  image_url: '',
  button_text: 'Shop Now',
  button_url: '/shop',
  metadata: { eyebrow: '', secondary_label: 'Learn More', secondary_href: '/about', image_alt: '' },
  sort_order: 0,
  is_active: true,
};

const EMPTY_TESTIMONIAL: TestimonialRow = {
  author: '',
  meta: 'Verified Customer',
  quote: '',
  rating: 5,
  avatar_url: null,
  is_active: true,
  sort_order: 0,
};

const DEFAULT_BRAND_STORY: BrandStoryRow = {
  section: 'homepage',
  block_key: 'brand_story',
  title: 'BUILT FOR',
  subtitle: 'EVERY AURA.',
  content: '',
  image_url: '',
  button_text: 'Discover Our Story',
  button_url: '/about',
  metadata: {
    eyebrow: 'Our Story',
    image_alt: 'FITAURA brand portrait',
    value_props: [
      { icon: 'ri-pulse-line', title: 'Built To Move', body: '' },
      { icon: 'ri-sparkling-2-line', title: 'Fashion-Forward', body: '' },
      { icon: 'ri-heart-3-line', title: 'Confidence In Comfort', body: '' },
    ],
  },
  is_active: true,
};

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slides, setSlides] = useState<HeroSlideRow[]>([]);
  const [brandStory, setBrandStory] = useState<BrandStoryRow>(DEFAULT_BRAND_STORY);
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);

  const [editingSlide, setEditingSlide] = useState<HeroSlideRow | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialRow | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [heroRes, storyRes, testRes] = await Promise.all([
        supabase
          .from('cms_content')
          .select('*')
          .eq('section', 'homepage_hero')
          .order('sort_order', { ascending: true }),
        supabase
          .from('cms_content')
          .select('*')
          .eq('section', 'homepage')
          .eq('block_key', 'brand_story')
          .maybeSingle(),
        supabase
          .from('testimonials')
          .select('*')
          .order('sort_order', { ascending: true }),
      ]);

      if (heroRes.data) setSlides(heroRes.data as HeroSlideRow[]);
      if (storyRes.data) setBrandStory(storyRes.data as BrandStoryRow);
      if (testRes.data) setTestimonials(testRes.data as TestimonialRow[]);
    } catch (err) {
      console.error('Failed to load CMS content:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // -------------------------------------------------------------------------
  // Hero slides
  // -------------------------------------------------------------------------
  const saveSlide = async () => {
    if (!editingSlide) return;
    setSaving(true);
    try {
      const payload = {
        section: editingSlide.section,
        block_key: editingSlide.block_key || `slide_${Date.now()}`,
        title: editingSlide.title,
        subtitle: editingSlide.subtitle,
        content: editingSlide.content,
        image_url: editingSlide.image_url,
        button_text: editingSlide.button_text,
        button_url: editingSlide.button_url,
        metadata: editingSlide.metadata,
        sort_order: editingSlide.sort_order,
        is_active: editingSlide.is_active,
        updated_at: new Date().toISOString(),
      };
      if (editingSlide.id) {
        const { error } = await supabase.from('cms_content').update(payload).eq('id', editingSlide.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cms_content').insert(payload);
        if (error) throw error;
      }
      setEditingSlide(null);
      await fetchAll();
    } catch (err: unknown) {
      alert('Error saving slide: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const deleteSlide = async (id: string) => {
    if (!confirm('Delete this slide? This cannot be undone.')) return;
    const { error } = await supabase.from('cms_content').delete().eq('id', id);
    if (error) return alert('Error: ' + error.message);
    setSlides(slides.filter((s) => s.id !== id));
  };

  // -------------------------------------------------------------------------
  // Brand story
  // -------------------------------------------------------------------------
  const saveBrandStory = async () => {
    setSaving(true);
    try {
      const payload = {
        section: 'homepage',
        block_key: 'brand_story',
        title: brandStory.title,
        subtitle: brandStory.subtitle,
        content: brandStory.content,
        image_url: brandStory.image_url,
        button_text: brandStory.button_text,
        button_url: brandStory.button_url,
        metadata: brandStory.metadata,
        is_active: brandStory.is_active,
        updated_at: new Date().toISOString(),
      };
      if (brandStory.id) {
        const { error } = await supabase.from('cms_content').update(payload).eq('id', brandStory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cms_content').insert(payload);
        if (error) throw error;
      }
      alert('Brand story saved.');
      await fetchAll();
    } catch (err: unknown) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const updateValueProp = (idx: number, key: 'icon' | 'title' | 'body', value: string) => {
    const props = [...(brandStory.metadata.value_props ?? [])];
    props[idx] = { ...props[idx], [key]: value };
    setBrandStory({ ...brandStory, metadata: { ...brandStory.metadata, value_props: props } });
  };

  // -------------------------------------------------------------------------
  // Testimonials
  // -------------------------------------------------------------------------
  const saveTestimonial = async () => {
    if (!editingTestimonial) return;
    setSaving(true);
    try {
      const payload = {
        author: editingTestimonial.author,
        meta: editingTestimonial.meta,
        quote: editingTestimonial.quote,
        rating: editingTestimonial.rating,
        avatar_url: editingTestimonial.avatar_url,
        is_active: editingTestimonial.is_active,
        sort_order: editingTestimonial.sort_order,
        updated_at: new Date().toISOString(),
      };
      if (editingTestimonial.id) {
        const { error } = await supabase.from('testimonials').update(payload).eq('id', editingTestimonial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('testimonials').insert(payload);
        if (error) throw error;
      }
      setEditingTestimonial(null);
      await fetchAll();
    } catch (err: unknown) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) return alert('Error: ' + error.message);
    setTestimonials(testimonials.filter((t) => t.id !== id));
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-20">Loading homepage content…</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-display tracking-wide text-gray-900">Homepage Content</h1>
        <p className="text-sm text-gray-500 mt-1">Edit the hero carousel, brand story, and testimonials shown on the storefront homepage.</p>
      </header>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {([
            ['hero', 'Hero Slides'],
            ['brand_story', 'Brand Story'],
            ['testimonials', 'Testimonials'],
          ] as [Tab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${tab === id ? 'border-sienna-500 text-sienna-500' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'hero' && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Hero Slides ({slides.length})</h2>
            <button
              onClick={() => setEditingSlide({ ...EMPTY_SLIDE, sort_order: slides.length + 1 })}
              className="bg-sienna-500 hover:bg-sienna-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              + Add Slide
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {slides.map((slide) => (
              <div key={slide.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                <img src={slide.image_url || '/brand/hero-1.jpg'} alt="" className="w-20 h-24 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{slide.title} {slide.subtitle}</div>
                  <div className="text-sm text-gray-500 truncate">{slide.content}</div>
                  <div className="text-xs text-gray-400 mt-1">Order: {slide.sort_order} · {slide.is_active ? 'Active' : 'Inactive'}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingSlide(slide)} className="text-sienna-500 hover:text-sienna-600 text-sm font-medium px-3 py-1">Edit</button>
                  <button onClick={() => slide.id && deleteSlide(slide.id)} className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1">Delete</button>
                </div>
              </div>
            ))}
            {slides.length === 0 && (
              <div className="text-center text-gray-500 py-12 bg-white border border-dashed border-gray-300 rounded-lg">No slides yet. Click &ldquo;Add Slide&rdquo; to create your first one.</div>
            )}
          </div>
        </section>
      )}

      {tab === 'brand_story' && (
        <section className="bg-white border border-gray-200 rounded-lg p-6 max-w-3xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Brand Story Block</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FormField label="Eyebrow" value={brandStory.metadata.eyebrow ?? ''} onChange={(v) => setBrandStory({ ...brandStory, metadata: { ...brandStory.metadata, eyebrow: v } })} />
            <FormField label="Image alt text" value={brandStory.metadata.image_alt ?? ''} onChange={(v) => setBrandStory({ ...brandStory, metadata: { ...brandStory.metadata, image_alt: v } })} />
            <FormField label="Headline (top)" value={brandStory.title} onChange={(v) => setBrandStory({ ...brandStory, title: v })} />
            <FormField label="Headline (bottom)" value={brandStory.subtitle} onChange={(v) => setBrandStory({ ...brandStory, subtitle: v })} />
          </div>
          <FormField label="Body copy" textarea value={brandStory.content} onChange={(v) => setBrandStory({ ...brandStory, content: v })} className="mt-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <FormField label="Button label" value={brandStory.button_text} onChange={(v) => setBrandStory({ ...brandStory, button_text: v })} />
            <FormField label="Button link" value={brandStory.button_url} onChange={(v) => setBrandStory({ ...brandStory, button_url: v })} />
          </div>

          <div className="mt-4">
            <ImageUploadField
              label="Image"
              hint="Editorial portrait shown alongside the brand story. Recommended 1200×1500 (4:5)."
              value={brandStory.image_url}
              onChange={(url) => setBrandStory({ ...brandStory, image_url: url })}
              bucket="media"
              pathPrefix="homepage/brand-story"
              aspectClassName="aspect-[4/5]"
              allowUrlFallback
              disabled={saving}
            />
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Value Props (3 items)</h3>
            <div className="space-y-3">
              {(brandStory.metadata.value_props ?? []).map((p, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2">
                  <input className="col-span-3 px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Icon (e.g. ri-pulse-line)" value={p.icon} onChange={(e) => updateValueProp(idx, 'icon', e.target.value)} />
                  <input className="col-span-3 px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Title" value={p.title} onChange={(e) => updateValueProp(idx, 'title', e.target.value)} />
                  <input className="col-span-6 px-3 py-2 border border-gray-300 rounded text-sm" placeholder="Body" value={p.body} onChange={(e) => updateValueProp(idx, 'body', e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={brandStory.is_active} onChange={(e) => setBrandStory({ ...brandStory, is_active: e.target.checked })} />
              Active (show on homepage)
            </label>
            <button onClick={saveBrandStory} disabled={saving} className="ml-auto bg-sienna-500 hover:bg-sienna-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              {saving ? 'Saving…' : 'Save Brand Story'}
            </button>
          </div>
        </section>
      )}

      {tab === 'testimonials' && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Testimonials ({testimonials.length})</h2>
            <button
              onClick={() => setEditingTestimonial({ ...EMPTY_TESTIMONIAL, sort_order: testimonials.length + 1 })}
              className="bg-sienna-500 hover:bg-sienna-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              + Add Testimonial
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-cream-100 text-sienna-500 font-bold flex items-center justify-center flex-shrink-0">{t.author.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">{t.author} <span className="text-xs text-gray-400 font-normal">· {t.meta}</span></div>
                  <div className="text-sm text-gray-500 line-clamp-2">{t.quote}</div>
                  <div className="text-xs text-gray-400 mt-1">Rating: {t.rating}★ · Order: {t.sort_order} · {t.is_active ? 'Active' : 'Hidden'}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingTestimonial(t)} className="text-sienna-500 hover:text-sienna-600 text-sm font-medium px-3 py-1">Edit</button>
                  <button onClick={() => t.id && deleteTestimonial(t.id)} className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1">Delete</button>
                </div>
              </div>
            ))}
            {testimonials.length === 0 && (
              <div className="text-center text-gray-500 py-12 bg-white border border-dashed border-gray-300 rounded-lg">No testimonials yet.</div>
            )}
          </div>
        </section>
      )}

      {/* ============================================================ Slide modal */}
      {editingSlide && (
        <Modal title={editingSlide.id ? 'Edit Slide' : 'New Slide'} onClose={() => setEditingSlide(null)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FormField label="Block key (unique)" value={editingSlide.block_key} onChange={(v) => setEditingSlide({ ...editingSlide, block_key: v })} placeholder="slide_1" />
            <FormField label="Sort order" type="number" value={String(editingSlide.sort_order)} onChange={(v) => setEditingSlide({ ...editingSlide, sort_order: Number(v) || 0 })} />
            <FormField label="Eyebrow (small tag)" value={editingSlide.metadata.eyebrow ?? ''} onChange={(v) => setEditingSlide({ ...editingSlide, metadata: { ...editingSlide.metadata, eyebrow: v } })} />
            <FormField label="Image alt" value={editingSlide.metadata.image_alt ?? ''} onChange={(v) => setEditingSlide({ ...editingSlide, metadata: { ...editingSlide.metadata, image_alt: v } })} />
            <FormField label="Headline top" value={editingSlide.title} onChange={(v) => setEditingSlide({ ...editingSlide, title: v })} />
            <FormField label="Headline bottom" value={editingSlide.subtitle} onChange={(v) => setEditingSlide({ ...editingSlide, subtitle: v })} />
          </div>
          <FormField label="Body copy" textarea value={editingSlide.content} onChange={(v) => setEditingSlide({ ...editingSlide, content: v })} className="mt-4" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <FormField label="Primary button label" value={editingSlide.button_text} onChange={(v) => setEditingSlide({ ...editingSlide, button_text: v })} />
            <FormField label="Primary button link" value={editingSlide.button_url} onChange={(v) => setEditingSlide({ ...editingSlide, button_url: v })} />
            <FormField label="Secondary button label" value={editingSlide.metadata.secondary_label ?? ''} onChange={(v) => setEditingSlide({ ...editingSlide, metadata: { ...editingSlide.metadata, secondary_label: v } })} />
            <FormField label="Secondary button link" value={editingSlide.metadata.secondary_href ?? ''} onChange={(v) => setEditingSlide({ ...editingSlide, metadata: { ...editingSlide.metadata, secondary_href: v } })} />
          </div>
          <div className="mt-4">
            <ImageUploadField
              label="Background image"
              hint="Full-bleed hero photo. Recommended 2400×1500 (16:10), focal subject on the right."
              value={editingSlide.image_url}
              onChange={(url) => setEditingSlide({ ...editingSlide, image_url: url })}
              bucket="media"
              pathPrefix="homepage/hero"
              aspectClassName="aspect-[16/10]"
              allowUrlFallback
              disabled={saving}
            />
          </div>
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editingSlide.is_active} onChange={(e) => setEditingSlide({ ...editingSlide, is_active: e.target.checked })} />
              Active
            </label>
            <button onClick={() => setEditingSlide(null)} className="ml-auto text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium">Cancel</button>
            <button onClick={saveSlide} disabled={saving} className="bg-sienna-500 hover:bg-sienna-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {/* ===================================================== Testimonial modal */}
      {editingTestimonial && (
        <Modal title={editingTestimonial.id ? 'Edit Testimonial' : 'New Testimonial'} onClose={() => setEditingTestimonial(null)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FormField label="Author" value={editingTestimonial.author} onChange={(v) => setEditingTestimonial({ ...editingTestimonial, author: v })} />
            <FormField label="Meta (e.g. Verified Customer)" value={editingTestimonial.meta} onChange={(v) => setEditingTestimonial({ ...editingTestimonial, meta: v })} />
          </div>
          <FormField label="Quote" textarea value={editingTestimonial.quote} onChange={(v) => setEditingTestimonial({ ...editingTestimonial, quote: v })} className="mt-4" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <FormField label="Rating (1-5)" type="number" value={String(editingTestimonial.rating)} onChange={(v) => setEditingTestimonial({ ...editingTestimonial, rating: Math.min(5, Math.max(1, Number(v) || 5)) })} />
            <FormField label="Sort order" type="number" value={String(editingTestimonial.sort_order)} onChange={(v) => setEditingTestimonial({ ...editingTestimonial, sort_order: Number(v) || 0 })} />
          </div>
          <div className="mt-4">
            <ImageUploadField
              label="Avatar (optional)"
              hint="Square headshot. Used in the homepage testimonial carousel."
              value={editingTestimonial.avatar_url}
              onChange={(url) => setEditingTestimonial({ ...editingTestimonial, avatar_url: url || null })}
              bucket="avatars"
              pathPrefix="testimonials"
              aspectClassName="aspect-square max-w-[180px]"
              allowUrlFallback
              disabled={saving}
            />
          </div>
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editingTestimonial.is_active} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, is_active: e.target.checked })} />
              Active
            </label>
            <button onClick={() => setEditingTestimonial(null)} className="ml-auto text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium">Cancel</button>
            <button onClick={saveTestimonial} disabled={saving} className="bg-sienna-500 hover:bg-sienna-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// Local UI primitives — keeps the admin page self-contained, no global deps
// --------------------------------------------------------------------------

function FormField({
  label,
  value,
  onChange,
  textarea,
  type = 'text',
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>}
      {textarea ? (
        <textarea
          rows={4}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-sienna-500 focus:border-sienna-500 outline-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-sienna-500 focus:border-sienna-500 outline-none"
        />
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
