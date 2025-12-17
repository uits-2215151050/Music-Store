'use client';

import React, { useState } from 'react';
import { Song } from '@/types';
import SongDetail from './SongDetail';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SongTableProps {
    songs: Song[];
    page: number;
    setPage: (p: number) => void;
    loading: boolean;
}

export default function SongTable({ songs, page, setPage, loading }: SongTableProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    if (loading && songs.length === 0) {
        return <div className="p-12 text-center text-gray-500">Loading songs...</div>;
    }

    return (
        <div className="w-full">
            <div className="bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="px-4 py-4 w-12 font-bold text-gray-900">#</th>
                            <th className="px-4 py-4 font-bold text-gray-900">Song</th>
                            <th className="px-4 py-4 font-bold text-gray-900">Artist</th>
                            <th className="px-4 py-4 font-bold text-gray-900">Album</th>
                            <th className="px-4 py-4 font-bold text-gray-900">Genre</th>
                        </tr>
                    </thead>
                    <tbody>
                        {songs.map((song) => (
                            <React.Fragment key={song.id}>
                                <tr
                                    onClick={() => toggleExpand(song.id)}
                                    className="cursor-pointer group border-b border-gray-100 hover:bg-transparent"
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 group-hover:text-gray-600 transition">
                                                {expandedId === song.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </span>
                                            <span className="font-bold text-gray-900">{song.index}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 font-medium text-gray-900">{song.title}</td>
                                    <td className="px-4 py-4 text-gray-900">{song.artist}</td>
                                    <td className="px-4 py-4 text-gray-600">{song.album}</td>
                                    <td className="px-4 py-4 text-gray-900">{song.genre}</td>
                                </tr>
                {expandedId === song.id && (
                                    <tr className="bg-blue-400/10 backdrop-blur-sm">
                                        <td colSpan={5} className="p-0 border-b border-white/10">
                                            <div className="px-4 py-4">
                                                <SongDetail song={song} />
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-2 mt-8">
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1 || loading}
                    className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-blue-600 rounded disabled:opacity-50 hover:bg-gray-50 transition"
                >
                    «
                </button>
                <div className="flex gap-2">
                    <button className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded font-medium">
                        {page}
                    </button>
                    <button onClick={() => setPage(page + 1)} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-blue-600 rounded font-medium hover:bg-gray-50 transition">
                        {page + 1}
                    </button>
                    <button onClick={() => setPage(page + 2)} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-blue-600 rounded font-medium hover:bg-gray-50 transition">
                        {page + 2}
                    </button>
                </div>
                <button
                    onClick={() => setPage(page + 1)}
                    disabled={loading}
                    className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-blue-600 rounded disabled:opacity-50 hover:bg-gray-50 transition"
                >
                    »
                </button>
            </div>
        </div>
    );
}
