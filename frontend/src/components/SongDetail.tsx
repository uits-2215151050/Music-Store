'use client';

import React, { useRef, useState } from 'react';
import { Song } from '@/types';
import { Play, Pause, ThumbsUp, Facebook, Volume2 } from 'lucide-react';

export default function SongDetail({ song }: { song: Song }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Cover URL: /api/cover/[id]?title=...&artist=...
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const coverUrl = `${apiUrl}/api/cover/${song.coverParams}?title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(song.artist)}`;
    // Audio URL: /api/music/preview/[id]?genre=...
    const audioUrl = `${apiUrl}/api/music/preview/${song.id}?genre=${encodeURIComponent(song.genre)}`;

    return (
        <div className="flex flex-col md:flex-row gap-8 bg-blue-50/0 rounded-xl">
            {/* Cover Art */}
            <div className="w-48 h-48 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 p-2 transform rotate-1">
                <div className="w-full h-full relative group overflow-hidden rounded bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverUrl} alt={song.title} className="w-full h-full object-cover" />

                    {/* Play Overlay (on hover) */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer" onClick={togglePlay}>
                        <button className="bg-white/90 text-black rounded-full p-4 shadow-lg transform scale-90 group-hover:scale-100 transition">
                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Info & Content */}
            <div className="flex-1 min-w-0 pt-2">
                <div className="flex flex-col gap-1 mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{song.title}</h3>
                    <div className="text-lg text-gray-600 flex items-center gap-2">
                        <span>from <span className="font-semibold text-gray-900">{song.album}</span></span>
                        <span>by <span className="font-semibold text-gray-900">{song.artist}</span></span>
                    </div>
                    <div className="text-gray-500 mt-1">Apple Records, 2019</div>
                </div>

                {/* Custom Audio Player */}
                <div className="bg-gray-50 rounded-full px-4 py-2 flex items-center gap-4 border border-gray-200 max-w-lg mb-6">
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        onPause={() => setIsPlaying(false)}
                        onPlay={() => setIsPlaying(true)}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        className="hidden"
                    />

                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full text-white hover:bg-blue-700 transition flex-shrink-0 shadow-sm"
                    >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                    </button>

                    <div className="flex-1 flex items-center gap-3">
                        <Volume2 size={16} className="text-gray-400" />
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full relative group cursor-pointer">
                            <div
                                className="absolute h-full bg-gray-400 rounded-full"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            />
                        </div>
                        <span className="text-xs font-mono font-medium text-white bg-gray-500 px-2 py-0.5 rounded-full">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Lyrics Section */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="inline-block border-b-2 border-transparent border-gray-300 pb-1 mb-4">
                        <span className="text-gray-500 font-medium">Lyrics</span>
                    </div>

                    <div className="text-gray-600 space-y-2 font-serif text-sm leading-relaxed max-w-lg whitespace-pre-wrap">
                        {song.lyrics}
                    </div>
                </div>

                {/* Social Actions */}
                <div className="mt-8 flex gap-3">
                    <button className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition">
                        <div className="bg-white/20 rounded-full p-0.5">
                            <ThumbsUp size={12} fill="currentColor" />
                        </div>
                        {song.likes}
                    </button>
                    <button className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition">
                        <Facebook size={14} />
                    </button>
                </div>

            </div>
        </div>
    );
}

