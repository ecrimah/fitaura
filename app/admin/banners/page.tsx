'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface BannerRow {
  id?: string;
  name: string;
  type: string;
  title: string;
  subtitle: string;
  image_url: string;
  background_color: string;
  text_color: string;
  button_text: string;
  button_url: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  position: string;
  sort_order: number;
}

const EMPTY_BANNER: BannerRow = {
  name: '',
  type: 'announcement',
  title: '',
  subtitle: '',
  image_url: '',
  background_color: '#D14F2B',
  text_color: '#FBF7F1',
  button_text: '',
  button_url: '',
  start_date: null,
  end_date: null,
  is_active: true,
  position: 'top',
  sort_order: 0,
};

const POSITION_OPTIONS = [
  { value: 'top', label: 'Top announcement bar' },
  { value: 'middle', label: 'Mid-page banner' },
  { value: 'bottom', label: 'Bottom banner' },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BannerRow | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('position', { ascending: true })
        .order('sort_order', { ascending: true });
      if (error) throw error;
      setBanners((data ?? []) as BannerRow[]);
    } catch (err) {
      console.error('Fetch banners failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const saveBanner = async () => {
    if (!editing) return;
    if (!editing.name.trim()) return alert('Please give the banner a name.');
    setSaving(true);
    try {
      const payload = {
        ...editing,
        updated_at: new Date().toISOString(),
      };
      if (editing.id) {
        const { error } = await supabase.from('banners').update(payload).eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('banners').insert(payload);
        if (error) throw error;
      }
      setEditing(null);
      await fetchBanners();
    } catch (err: unknown) {
      alert('Save failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) return alert('Delete failed: ' + error.message);
    setBanners(banners.filter((b) => b.id !== id));
  };

  const toggleActive = async (banner: BannerRow) => {
    if (!banner.id) return;
    await supabase.from('banners').update({ is_active: !banner.is_active }).eq('id', banner.id);
    fetchBanners();
  };

  if (loading) return <div className="text-center text-gray-500 py-20">Loading banners…</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display tracking-wide text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the announcement bar and promotional banners across the storefront.</p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY_BANNER, sort_order: banners.length + 1 })}
          className="bg-sienna-500 hover:bg-sienna-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          + New Banner
        </button>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {banners.map((b) => (
          <div key={b.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
            <div
              className="w-3 h-12 rounded-full flex-shrink-0"
              style={{ backgroundColor: b.background_color || '#D14F2B' }}
              aria-hidden
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{b.name}</div>
              <div className="text-sm text-gray-500 truncate">{b.title}</div>
              <div className="text-xs text-gray-400 mt-1">
                <span className="uppercase tracking-wider">{b.position}</span> · Order: {b.sort_order} · {b.type}
                {b.start_date && <> · From {new Date(b.start_date).toLocaleDateString()}</>}
                {b.end_date && <> · Until {new Date(b.end_date).toLocaleDateString()}</>}
              </div>
            </div>
            <button
              onClick={() => toggleActive(b)}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
            >
              {b.is_active ? 'Active' : 'Hidden'}
            </button>
            <button onClick={() => setEditing(b)} className="text-sienna-500 hover:text-sienna-600 text-sm font-medium px-3 py-1">Edit</button>
            <button onClick={() => b.id && deleteBanner(b.id)} className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1">Delete</button>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="text-center text-gray-500 py-12 bg-white border border-dashed border-gray-300 rounded-lg">No banners yet. Click &ldquo;New Banner&rdquo; to create one.</div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">{editing.id ? 'Edit Banner' : 'New Banner'}</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-900">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Internal name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} placeholder="e.g. Holiday top bar" />
              <Field label="Title (visible)" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} placeholder="FREE SHIPPING ON ORDERS OVER $120" />
              <Field label="Subtitle (optional)" value={editing.subtitle} onChange={(v) => setEditing({ ...editing, subtitle: v })} />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Position</label>
                  <select
                    value={editing.position}
                    onChange={(e) => setEditing({ ...editing, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-sienna-500 focus:border-sienna-500 outline-none"
                  >
                    {POSITION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <Field label="Sort order" type="number" value={String(editing.sort_order)} onChange={(v) => setEditing({ ...editing, sort_order: Number(v) || 0 })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Background color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={editing.background_color} onChange={(e) => setEditing({ ...editing, background_color: e.target.value })} className="h-10 w-12 border border-gray-300 rounded cursor-pointer" />
                    <input type="text" value={editing.background_color} onChange={(e) => setEditing({ ...editing, background_color: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Text color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={editing.text_color} onChange={(e) => setEditing({ ...editing, text_color: e.target.value })} className="h-10 w-12 border border-gray-300 rounded cursor-pointer" />
                    <input type="text" value={editing.text_color} onChange={(e) => setEditing({ ...editing, text_color: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Button label (optional)" value={editing.button_text} onChange={(v) => setEditing({ ...editing, button_text: v })} />
                <Field label="Button link (optional)" value={editing.button_url} onChange={(v) => setEditing({ ...editing, button_url: v })} placeholder="/shop" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Start date (optional)" type="datetime-local" value={editing.start_date ? editing.start_date.slice(0, 16) : ''} onChange={(v) => setEditing({ ...editing, start_date: v ? new Date(v).toISOString() : null })} />
                <Field label="End date (optional)" type="datetime-local" value={editing.end_date ? editing.end_date.slice(0, 16) : ''} onChange={(v) => setEditing({ ...editing, end_date: v ? new Date(v).toISOString() : null })} />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                Active (show on storefront)
              </label>

              <div className="mt-4 p-4 rounded text-center text-[11px] tracking-[0.28em] uppercase font-semibold" style={{ backgroundColor: editing.background_color, color: editing.text_color }}>
                {editing.title || 'Banner preview'}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setEditing(null)} className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium">Cancel</button>
              <button onClick={saveBanner} disabled={saving} className="bg-sienna-500 hover:bg-sienna-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                {saving ? 'Saving…' : 'Save Banner'}
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
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-sienna-500 focus:border-sienna-500 outline-none"
      />
    </div>
  );
}
