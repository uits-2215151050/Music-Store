'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Song } from '@/types';
import SongDetail from './SongDetail';

interface SongGalleryProps {
    songs: Song[];
    loadMore: () => void;
    loading: boolean;
}

export default function SongGallery({ songs, loadMore, loading }: SongGalleryProps) {
    const observer = useRef<IntersectionObserver | null>(null);
    const lastSongElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                loadMore();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadMore]);

    // For gallery, we can just expand in a modal or inline (accordion style not great for grid).
    // Let's use a selected state to show a modal or details panel.
    // For simplicity given requirements "expandable", I'll make the card expand in place or show a modal.
    // A modal is best for Gallery.

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {songs.map((song, index) => {
                    const isLast = index === songs.length - 1;
                    return (
                        <div
                            key={song.id}
                            ref={isLast ? lastSongElementRef : null}
                            onClick={() => setSelectedSong(song)}
                            className="bg-white/20 backdrop-blur-xl rounded-lg overflow-hidden border border-white/20 hover:border-blue-400/50 hover:shadow-lg transition cursor-pointer flex flex-col group"
                        >
                            {/* Card Content */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <div className="h-48 overflow-hidden relative bg-gradient-to-br from-gray-300 to-gray-400">
                                <img
                                    src={`${apiUrl}/api/cover/${song.coverParams}?title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`}
                                    alt={song.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                                    ❤️ {song.likes}
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition" />
                            </div>
                            <div className="p-4 flex-1 flex flex-col bg-white/40 backdrop-blur-lg">
                                <h3 className="font-bold text-gray-900 mb-1 truncate" title={song.title}>{song.title}</h3>
                                <p className="text-gray-700 text-sm mb-2 truncate">{song.artist}</p>
                                <div className="mt-auto flex justify-between items-center text-xs text-gray-700">
                                    <span>{song.genre}</span>
                                    <span>#{song.index}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {loading && <div className="text-center py-6 text-gray-400">Loading more...</div>}

            {/* Modal for Details */}
            {selectedSong && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-lg" onClick={() => setSelectedSong(null)}>
                    <div className="bg-white/85 backdrop-blur-xl rounded-xl p-6 max-w-2xl w-full border border-white/40 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedSong(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <SongDetail song={selectedSong} />
                    </div>
                </div>
            )}
        </>
    );
}

