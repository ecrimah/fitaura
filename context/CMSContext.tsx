'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface SiteSettings {
    site_name: string;
    site_tagline: string;
    site_logo: string;
    contact_email: string;
    contact_phone: string;
    contact_whatsapp: string;
    contact_address: string;
    social_facebook: string;
    social_instagram: string;
    social_twitter: string;
    social_tiktok: string;
    social_snapchat: string;
    social_youtube: string;
    primary_color: string;
    secondary_color: string;
    currency: string;
    currency_symbol: string;
    [key: string]: string;
}

interface CMSContent {
    id: string;
    section: string;
    block_key: string;
    title: string | null;
    subtitle: string | null;
    content: string | null;
    image_url: string | null;
    button_text: string | null;
    button_url: string | null;
    metadata: Record<string, unknown>;
    is_active: boolean;
}

interface Banner {
    id: string;
    name: string;
    type: string;
    title: string | null;
    subtitle: string | null;
    image_url: string | null;
    background_color: string;
    text_color: string;
    button_text: string | null;
    button_url: string | null;
    is_active: boolean;
    position: string;
    start_date: string | null;
    end_date: string | null;
}

interface CMSContextType {
    settings: SiteSettings;
    content: CMSContent[];
    banners: Banner[];
    loading: boolean;
    getContent: (section: string, blockKey: string) => CMSContent | undefined;
    getSetting: (key: string) => string;
    getActiveBanners: (position?: string) => Banner[];
    refreshCMS: () => Promise<void>;
}

// FITAURA brand defaults — used as fallback when Supabase isn't reachable yet.
// Real values are loaded from `site_settings` on mount and override these.
const defaultSettings: SiteSettings = {
    site_name: 'FITAURA',
    site_tagline: 'Modern lifestyle clothing — gymwear, athleisure and fashion-forward apparel built to empower confidence and comfort.',
    site_logo: '/fitaura-logo.png',
    contact_email: 'Fitaurawear@gmail.com',
    contact_phone: '+1 (587) 432-6761',
    contact_whatsapp: '+15874326761',
    contact_address: 'Calgary, Alberta, Canada',
    social_facebook: '',
    social_instagram: 'https://instagram.com/fitaura.ca',
    social_twitter: '',
    social_tiktok: '',
    social_snapchat: '',
    social_youtube: '',
    primary_color: '#D14F2B',
    secondary_color: '#FBF7F1',
    currency: 'CAD',
    currency_symbol: '$',
};

const CMSContext = createContext<CMSContextType>({
    settings: defaultSettings,
    content: [],
    banners: [],
    loading: true,
    getContent: () => undefined,
    getSetting: () => '',
    getActiveBanners: () => [],
    refreshCMS: async () => { },
});

// Coerce the jsonb `value` column into a string for the SiteSettings record.
// Supports the common shapes: bare string, { value: string }, number, boolean, null.
function coerceSettingValue(value: unknown): string {
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

export function CMSProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [content, setContent] = useState<CMSContent[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCMSData = useCallback(async () => {
        // Skip the network call entirely when env vars are still placeholders —
        // the app keeps working with hardcoded defaults until Supabase is wired.
        if (!isSupabaseConfigured) {
            setLoading(false);
            return;
        }

        try {
            const [settingsRes, contentRes, bannersRes] = await Promise.all([
                supabase.from('site_settings').select('key, value'),
                supabase
                    .from('cms_content')
                    .select('id, section, block_key, title, subtitle, content, image_url, button_text, button_url, metadata, is_active')
                    .eq('is_active', true),
                supabase
                    .from('banners')
                    .select('*')
                    .eq('is_active', true),
            ]);

            if (settingsRes.data && settingsRes.data.length) {
                const merged: SiteSettings = { ...defaultSettings };
                for (const row of settingsRes.data as { key: string; value: unknown }[]) {
                    merged[row.key] = coerceSettingValue(row.value);
                }
                setSettings(merged);
            }

            if (contentRes.data) {
                setContent(contentRes.data as CMSContent[]);
            }

            if (bannersRes.data) {
                setBanners(bannersRes.data as Banner[]);
            }
        } catch {
            // Silent fallback to defaults — homepage already renders valid UI.
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCMSData();
    }, [fetchCMSData]);

    const getContent = (section: string, blockKey: string): CMSContent | undefined => {
        return content.find(c => c.section === section && c.block_key === blockKey);
    };

    const getSetting = (key: string): string => {
        return settings[key] || defaultSettings[key] || '';
    };

    const getActiveBanners = (position?: string): Banner[] => {
        const now = new Date();
        return banners.filter(b => {
            if (position && b.position !== position) return false;
            if (b.start_date && new Date(b.start_date) > now) return false;
            if (b.end_date && new Date(b.end_date) < now) return false;
            return b.is_active;
        });
    };

    return (
        <CMSContext.Provider
            value={{
                settings,
                content,
                banners,
                loading,
                getContent,
                getSetting,
                getActiveBanners,
                refreshCMS: fetchCMSData,
            }}
        >
            {children}
        </CMSContext.Provider>
    );
}

export function useCMS() {
    const context = useContext(CMSContext);
    if (!context) {
        throw new Error('useCMS must be used within a CMSProvider');
    }
    return context;
}

export default CMSContext;
