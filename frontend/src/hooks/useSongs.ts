'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Song, GeneratorOptions } from '@/types';

type ViewMode = 'table' | 'gallery';

interface UseSongsReturn {
    songs: Song[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => void;
    setPage: (page: number) => void;
    page: number;
}

export function useSongs(options: Omit<GeneratorOptions, 'page'>): UseSongsReturn {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const prevOptionsRef = useRef(options);

    // Reset when primary options change
    useEffect(() => {
        const prev = prevOptionsRef.current;
        if (
            prev.seed !== options.seed ||
            prev.region !== options.region ||
            prev.likesAvg !== options.likesAvg ||
            prev.viewMode !== options.viewMode
        ) {
            setPage(1);
            setSongs([]);
            setHasMore(true);
            prevOptionsRef.current = options;
        }
    }, [options.seed, options.region, options.likesAvg, options.viewMode, options]);

    const fetchSongs = useCallback(async (pageNum: number, isLoadMore: boolean) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                seed: options.seed,
                region: options.region,
                likes: options.likesAvg.toString(),
                page: pageNum.toString(),
                viewMode: options.viewMode
            });

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/songs?${params}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();

            if (options.viewMode === 'gallery') {
                // Infinite scroll: append
                if (isLoadMore) {
                    setSongs(prev => [...prev, ...data.songs]);
                } else {
                    setSongs(data.songs);
                }
            } else {
                // Table: replace
                setSongs(data.songs);
            }

            // Assume if we got 0 songs, no more data (though generator always returns songs unless page > max safe integer?)
            // For this app, generator is infinite, but we can assume practical limit if empty.
            if (data.songs.length === 0) setHasMore(false);

        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [options.seed, options.region, options.likesAvg, options.viewMode]);

    // Initial fetch or page change
    useEffect(() => {
        // If gallery and page > 1, this effect might trigger on state setPage.
        // We handle logic: if gallery, setPage triggers append.
        // If table, setPage triggers replace.
        // BUT, options change triggers setPage(1).

        // We need to distinguish "Reset" from "Next Page".
        // The reset effect above sets page=1.

        fetchSongs(page, page > 1 && options.viewMode === 'gallery');
    }, [page, fetchSongs, options.viewMode]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            setPage(p => p + 1);
        }
    }, [loading, hasMore]);

    return { songs, loading, error, hasMore, loadMore, setPage, page };
}

