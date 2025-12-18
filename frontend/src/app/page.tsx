'use client';

import React, { useState } from 'react';
import { useSongs } from '@/hooks/useSongs';
import SongTable from '@/components/SongTable';
import SongGallery from '@/components/SongGallery';
import { Shuffle, Table, LayoutGrid, ChevronDown } from 'lucide-react';

export default function MusicApp() {
  const [seed, setSeed] = useState('58933423');
  const [region, setRegion] = useState('en-US');
  const [likesAvg, setLikesAvg] = useState(5);
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table');

  const { songs, loading, error, loadMore, setPage, page, hasMore } = useSongs({
    seed,
    region,
    likesAvg,
    viewMode
  });

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 100000000).toString());
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Toolbar */}
      <header className="sticky top-0 z-50 bg-white p-6 pb-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-end gap-8 mb-6">

          {/* Language */}
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <label className="text-xs text-gray-500 font-medium ml-1">Language</label>
            <div className="relative">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition shadow-sm text-gray-900"
              >
                <option value="en-US">English (US)</option>
                <option value="de-DE">German (DE)</option>
                <option value="uk-UA">Ukrainian (UA)</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Seed */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-500 font-medium ml-1">Seed</label>
            <div className="flex items-center relative">
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition shadow-sm text-gray-900"
              />
              <button
                onClick={handleRandomSeed}
                className="absolute right-2 p-1 hover:bg-gray-100 rounded text-gray-600 transition"
                title="Randomize Seed"
              >
                <Shuffle size={16} />
              </button>
            </div>
          </div>

          {/* Likes */}
          <div className="flex flex-col gap-1.5 flex-1 max-w-xs">
            <label className="text-xs text-gray-500 font-medium ml-1">Likes</label>
            <div className="flex items-center gap-3 px-1 h-[42px]">
              <div className="relative flex-1 h-1 bg-gray-200 rounded-full">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={likesAvg}
                  onChange={(e) => setLikesAvg(parseFloat(e.target.value))}
                  className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className="absolute h-full bg-blue-500 rounded-full"
                  style={{ width: `${(likesAvg / 10) * 100}%` }}
                />
                <div
                  className="absolute w-4 h-4 bg-blue-600 rounded-full shadow border-2 border-white top-1/2 transform -translate-y-1/2 -translate-x-1/2 pointer-events-none"
                  style={{ left: `${(likesAvg / 10) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700 w-8 text-right">{Number(likesAvg).toFixed(1)}</span>
            </div>
          </div>

          <div className="flex-1"></div>

          {/* View Mode */}
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <Table size={20} />
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`p-2 rounded-lg transition ${viewMode === 'gallery' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>

        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
          {/* ADD THIS BLOCK */}
          {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                  <strong>Error:</strong> {error}
                  <br/>
                  <span className="text-sm text-red-500">Check your API URL and backend permissions.</span>
              </div>
          )}
          {viewMode === 'table' ? (
          <SongTable songs={songs} page={page} setPage={setPage} loading={loading} />
        ) : (
          <SongGallery songs={songs} loadMore={loadMore} loading={loading} />
        )}
      </main>
    </div>
  );
}
