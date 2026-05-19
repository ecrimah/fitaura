'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import ImageUploadField from '@/components/admin/ImageUploadField';
import type { StorageBucket } from '@/lib/storage/upload-image';

type Category = 'general' | 'contact' | 'social' | 'theme' | 'commerce';

interface SettingRow {
  key: string;
  value: string;
  category: Category;
  label: string;
  placeholder?: string;
  hint?: string;
  type?: 'text' | 'textarea' | 'color' | 'url' | 'email' | 'image';
  /** For `type === 'image'` — where the upload goes. */
  bucket?: StorageBucket;
  pathPrefix?: string;
  aspect?: string;
}

// Definitive list of keys we expose in the admin UI — keeps the form clean
// even if the DB has stale keys from older migrations.
const FIELDS: Omit<SettingRow, 'value'>[] = [
  { key: 'site_name',         label: 'Site name',         category: 'general',  placeholder: 'FITAURA' },
  { key: 'site_tagline',      label: 'Site tagline',      category: 'general',  type: 'textarea', hint: 'Shown in metadata, SEO, and the brand story fallback.' },
  {
    key: 'site_logo',
    label: 'Site logo',
    category: 'general',
    type: 'image',
    bucket: 'media',
    pathPrefix: 'site/logo',
    aspect: 'aspect-[3/1]',
    hint: 'Used in the header, footer, and admin sidebar. PNG with transparent background works best.',
  },
  {
    key: 'site_favicon',
    label: 'Favicon',
    category: 'general',
    type: 'image',
    bucket: 'media',
    pathPrefix: 'site/favicon',
    aspect: 'aspect-square max-w-[160px]',
    hint: 'Square mark used as the browser tab icon and PWA fallback. 512×512 recommended.',
  },

  { key: 'contact_email',     label: 'Contact email',     category: 'contact',  type: 'email' },
  { key: 'contact_phone',     label: 'Contact phone',     category: 'contact',  placeholder: '+1 (587) 432-6761' },
  { key: 'contact_whatsapp',  label: 'WhatsApp number',   category: 'contact',  placeholder: '+15874326761',     hint: 'Digits only with +country code.' },
  { key: 'contact_address',   label: 'Address',           category: 'contact',  placeholder: 'Calgary, Alberta, Canada' },

  { key: 'social_instagram',  label: 'Instagram URL',     category: 'social',   type: 'url' },
  { key: 'social_facebook',   label: 'Facebook URL',      category: 'social',   type: 'url' },
  { key: 'social_twitter',    label: 'X / Twitter URL',   category: 'social',   type: 'url' },
  { key: 'social_tiktok',     label: 'TikTok URL',        category: 'social',   type: 'url' },
  { key: 'social_youtube',    label: 'YouTube URL',       category: 'social',   type: 'url' },
  { key: 'social_snapchat',   label: 'Snapchat URL',      category: 'social',   type: 'url' },

  { key: 'primary_color',     label: 'Primary brand color',   category: 'theme', type: 'color' },
  { key: 'secondary_color',   label: 'Secondary brand color', category: 'theme', type: 'color' },

  { key: 'currency',          label: 'Currency code',     category: 'commerce', placeholder: 'CAD' },
  { key: 'currency_symbol',   label: 'Currency symbol',   category: 'commerce', placeholder: '$' },
];

const CATEGORY_LABELS: Record<Category, string> = {
  general: 'General',
  contact: 'Contact',
  social: 'Social Links',
  theme: 'Theme Colors',
  commerce: 'Commerce',
};

function coerce(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if (typeof v.value === 'string') return v.value;
    return JSON.stringify(value);
  }
  return '';
}

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('general');

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('site_settings').select('key, value');
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const row of (data ?? []) as { key: string; value: unknown }[]) {
        map[row.key] = coerce(row.value);
      }
      setValues(map);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateValue = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert every defined field, even if untouched, so the DB stays
      // authoritative even after this admin page first ships.
      const rows = FIELDS.map((f) => ({
        key: f.key,
        value: JSON.stringify(values[f.key] ?? ''),
        category: f.category,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await supabase
        .from('site_settings')
        .upsert(rows, { onConflict: 'key' });
      if (error) throw error;
      alert('Settings saved. Refresh the storefront tab to see changes.');
    } catch (err: unknown) {
      alert('Save failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center text-gray-500 py-20">Loading settings…</div>;

  const fieldsByCategory = FIELDS.filter((f) => f.category === activeCategory);
  const categoriesInUse = (Object.keys(CATEGORY_LABELS) as Category[]).filter((cat) =>
    FIELDS.some((f) => f.category === cat),
  );

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-display tracking-wide text-gray-900">Site Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Edit the global brand info used across the storefront, footer, header, SEO, and emails.</p>
      </header>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6 overflow-x-auto">
          {categoriesInUse.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeCategory === cat ? 'border-sienna-500 text-sienna-500' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </nav>
      </div>

      <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        {fieldsByCategory.map((field) => (
          <div key={field.key}>
            {field.type === 'image' ? (
              <ImageUploadField
                label={field.label}
                hint={field.hint}
                value={values[field.key] ?? ''}
                onChange={(url) => updateValue(field.key, url)}
                bucket={field.bucket ?? 'media'}
                pathPrefix={field.pathPrefix ?? 'site'}
                aspectClassName={field.aspect ?? 'aspect-[3/1]'}
                allowUrlFallback
                disabled={saving}
              />
            ) : (
              <>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={values[field.key] ?? ''}
                    placeholder={field.placeholder}
                    onChange={(e) => updateValue(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-sienna-500 focus:border-sienna-500 outline-none"
                  />
                ) : field.type === 'color' ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={values[field.key] || '#D14F2B'}
                      onChange={(e) => updateValue(field.key, e.target.value)}
                      className="h-10 w-12 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={values[field.key] ?? ''}
                      placeholder="#D14F2B"
                      onChange={(e) => updateValue(field.key, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:ring-2 focus:ring-sienna-500 focus:border-sienna-500 outline-none"
                    />
                  </div>
                ) : (
                  <input
                    type={field.type ?? 'text'}
                    value={values[field.key] ?? ''}
                    placeholder={field.placeholder}
                    onChange={(e) => updateValue(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-sienna-500 focus:border-sienna-500 outline-none"
                  />
                )}
                {field.hint && <p className="text-xs text-gray-500 mt-1">{field.hint}</p>}
              </>
            )}
          </div>
        ))}
      </section>

      <div className="flex items-center justify-end gap-3 mt-6">
        <button onClick={fetchSettings} disabled={saving} className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium">
          Reset
        </button>
        <button onClick={handleSave} disabled={saving} className="bg-sienna-500 hover:bg-sienna-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          {saving ? 'Saving…' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
