'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import data from '../data/gallery.json';

type Item = {
  id: string;
  title: string;
  src: string;      // 例: "/cards/shuu_v1.png"（public/cards に置く）
  alt?: string;
  tags: string[];
  notes?: string;
  owner?: string;
  created?: string; // "YYYY-MM-DD"
};

const ITEMS: Item[] = data as Item[];

export default function ImageGallery() {   // ← default export の“関数”です
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [idx, setIdx] = useState<number | null>(null);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    ITEMS.forEach((i) => i.tags?.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ITEMS.filter((it) => {
      const hitQ =
        !q ||
        it.title.toLowerCase().includes(q) ||
        (it.owner && it.owner.toLowerCase().includes(q)) ||
        (it.notes && it.notes.toLowerCase().includes(q)) ||
        it.tags.join(' ').toLowerCase().includes(q);
      const hitT = !tag || it.tags.includes(tag);
      return hitQ && hitT;
    });
  }, [query, tag]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (idx === null) return;
      if (e.key === 'Escape') setIdx(null);
      if (e.key === 'ArrowLeft') setIdx((i) => (i === null ? null : (i + filtered.length - 1) % filtered.length));
      if (e.key === 'ArrowRight') setIdx((i) => (i === null ? null : (i + 1) % filtered.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, filtered.length]);

  const openAt = (i: number) => setIdx(i);
  const close = () => setIdx(null);
  const next = () => setIdx((i) => (i === null ? null : (i + 1) % filtered.length));
  const prev = () => setIdx((i) => (i === null ? null : (i + filtered.length - 1) % filtered.length));

  const sel = idx !== null ? filtered[idx] : null;

  return (
    <div className="min-h-screen bg-[#F4EEE4] text-[#26211B]">
      <header className="sticky top-0 z-10 backdrop-blur bg-[#F4EEE4]/85 border-b-2 border-[#26211B]">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <div className="grid place-items-center bg-[#FFF9F1] border-2 border-[#26211B] shadow-[4px_4px_0_#26211B] w-8 h-8">SC</div>
          <h1 className="tracking-wider">STATUS CARD GALLERY (Images)</h1>
          <div className="ml-auto">
            <input
              aria-label="検索"
              placeholder="検索：タイトル・タグ・メモ・作成者…"
              className="w-72 max-w-[60vw] px-3 py-2 text-[12px] bg-[#FFF9F1] border-2 border-[#26211B] focus:outline-none shadow-[4px_4px_0_#26211B]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
<div className="mx-auto max-w-6xl px-4 pb-3">
  <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 [-webkit-overflow-scrolling:touch]">
    <TagChip active={!tag} onClick={() => setTag(null)} label="すべて" />
    {allTags.map((t) => (
      <TagChip key={t} active={tag === t} onClick={() => setTag(t)} label={t} />
    ))}
  </div>
</div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((it, i) => (
            <button
              key={it.id}
              onClick={() => openAt(i)}
              className="group bg-[#FFF9F1] border-2 border-[#26211B] shadow-[6px_6px_0_#26211B] hover:translate-x-[1px] hover:translate-y-[1px] transition-transform overflow-hidden"
              aria-label={`${it.title} を拡大`}
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={it.src}
                  alt={it.alt || it.title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              <div className="px-2 py-2 border-t-2 border-[#26211B]">
                <div className="text-xs font-semibold truncate">{it.title}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {it.tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 border-2 border-[#26211B] bg-[#FFE5B4] shadow-[2px_2px_0_#26211B]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {sel && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={close} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative max-w-5xl w-full bg-[#FFF9F1] border-2 border-[#26211B] shadow-[10px_10px_0_#26211B]">
              <div className="flex items-center justify-between p-3 border-b-2 border-[#26211B]">
                <div className="text-sm font-semibold">{sel.title}</div>
                <div className="flex items-center gap-2">
                  <button onClick={prev} className="px-3 py-1 border-2 border-[#26211B] shadow-[3px_3px_0_#26211B] text-[12px]">←</button>
                  <button onClick={next} className="px-3 py-1 border-2 border-[#26211B] shadow-[3px_3px_0_#26211B] text-[12px]">→</button>
                  <button onClick={close} className="px-3 py-1 border-2 border-[#26211B] shadow-[3px_3px_0_#26211B] text-[12px]">閉じる(Esc)</button>
                </div>
              </div>

              <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative md:col-span-2 bg-white border-2 border-[#26211B] min-h-[50vh]">
                  <Image
                    src={sel.src}
                    alt={sel.alt || sel.title}
                    fill
                    className="object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />
                </div>
                <div className="text-[12px]">
                  {sel.owner && <div className="mb-1">作成者：{sel.owner}</div>}
                  {sel.created && <div className="mb-1">作成日：{sel.created}</div>}
                  {sel.notes && <div className="mt-2 p-2 bg-white border-2 border-[#26211B]">{sel.notes}</div>}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {sel.tags.map((t) => (
                      <button key={t} onClick={() => { setTag(t); setIdx(null); }} className="px-2 py-0.5 border-2 border-[#26211B] shadow-[2px_2px_0_#26211B]">
                        #{t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TagChip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 border-2 border-[#26211B] shadow-[3px_3px_0_#26211B] text-[11px] ${
        active ? 'bg-[#26211B] text-white' : 'bg-[#FFF9F1] hover:bg-[#FFEFD9]'
      }`}
    >
      {label}
    </button>
  );
}
