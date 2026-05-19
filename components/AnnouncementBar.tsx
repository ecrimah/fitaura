'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Banner {
    id: string;
    title: string;
    subtitle?: string;
    background_color: string;
    text_color: string;
    button_text?: string;
    button_url?: string;
}

const DEFAULT_MESSAGE = 'FREE CANADA SHIPPING ON ORDERS OVER $120';

export default function AnnouncementBar() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        let mounted = true;
        const fetchBanners = async () => {
            try {
                const now = new Date().toISOString();
                const { data, error } = await supabase
                    .from('banners')
                    .select('*')
                    .eq('is_active', true)
                    .eq('position', 'top')
                    .or(`start_date.is.null,start_date.lte.${now}`)
                    .or(`end_date.is.null,end_date.gte.${now}`)
                    .order('sort_order', { ascending: true });

                if (!error && mounted) setBanners(data || []);
            } catch {
                /* Silently fall back to default message */
            }
        };
        fetchBanners();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (banners.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % banners.length);
            }, 6000);
            return () => clearInterval(interval);
        }
    }, [banners.length]);

    if (banners.length === 0) {
        return (
            <div className="bg-sienna-500 text-cream-50 text-center text-[11px] sm:text-xs tracking-[0.28em] uppercase font-semibold py-2.5">
                {DEFAULT_MESSAGE}
                <span aria-hidden className="mx-3 opacity-60">+</span>
                <span className="hidden sm:inline opacity-90">Free returns within 30 days</span>
            </div>
        );
    }

    const currentBanner = banners[currentIndex % banners.length];

    return (
        <div
            className="text-center text-[11px] sm:text-xs tracking-[0.28em] uppercase font-semibold py-2.5 transition-colors duration-500"
            style={{
                backgroundColor: currentBanner.background_color || '#D14F2B',
                color: currentBanner.text_color || '#FBF7F1',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3">
                <span>{currentBanner.title}</span>
                {currentBanner.button_text && currentBanner.button_url && (
                    <Link
                        href={currentBanner.button_url}
                        className="underline underline-offset-4 hover:opacity-80 transition-opacity"
                    >
                        {currentBanner.button_text}
                    </Link>
                )}
            </div>
        </div>
    );
}
