'use client';
import React, { useEffect, useMemo, useState } from 'react';
import data from '../data/cards.json'; // ← 相対パスでJSONを読み込み
import Link from 'next/link'; // ← 先頭のimport群に追加

type Stat = { label: string; value: number };
type Card = {
  id: string;
  name: string;
  activities: string[];
  good: string;
  weak: string;
  statuses: Stat[];
  tags: string[];
  instagram?: string;
  bio?: string;
  tone?: 'beige' | 'sand' | 'linen';
  iconUrl?: string;
};

const CARDS: Card[] = data as Card[];

export default function StatusCardGalleryRPG() {  // ← default export が必須
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    CARDS.forEach((c) => c.tags?.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CARDS.filter((c) => {
      const hitQ = !q
        || c.name.toLowerCase().includes(q)
        || c.activities.join(' ').toLowerCase().includes(q)
        || c.tags.join(' ').toLowerCase().includes(q)
        || c.good.toLowerCase().includes(q)
        || c.weak.toLowerCase().includes(q);
      const hitT = !tag || c.tags.includes(tag);
      return hitQ && hitT;
    });
  }, [query, tag]);

  useEffect(() => {
    const idFromHash = window.location.hash.replace('#card-', '');
    if (idFromHash) setSelected(idFromHash);
    const onHash = () => setSelected(window.location.hash.replace('#card-', '') || null);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const open = (id: string) => (window.location.hash = `card-${id}`);
  const close = () => { history.replaceState(null, '', ' '); setSelected(null); };

  const sel = CARDS.find((c) => c.id === selected) || null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur bg-[#F4EEE4]/85 border-b-2 border-[#26211B]">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <div className="grid place-items-center bg-[#FFF9F1] border-2 border-[#26211B] shadow-[4px_4px_0_#26211B] w-8 h-8">SC</div>
          <h1 className="tracking-wider">STATUS CARD ARCHIVE</h1>
          <div className="ml-auto">
            <input
              aria-label="検索"
              placeholder="検索：名前・強み・タグ…"
              className="w-64 max-w-[45vw] px-3 py-2 text-[12px] bg-[#FFF9F1] border-2 border-[#26211B] focus:outline-none focus:ring-0 shadow-[4px_4px_0_#26211B]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3 flex flex-wrap gap-2">
          <TagChip active={!tag} onClick={() => setTag(null)} label="すべて" />
          {allTags.map((t) => (
            <TagChip key={t} active={tag === t} onClick={() => setTag(t)} label={t} />
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <Card key={c.id} c={c} onOpen={() => open(c.id)} />
          ))}
        </div>
      </main>

      {sel && <DetailModal card={sel} onClose={close} />}

      <footer className="mx-auto max-w-6xl px-4 py-8 text-[11px] text-black/60">
        © STATUS CARD / 灯火 — RPG UI demo
      </footer>
    </div>
  );
}

function Card({ c, onOpen }: { c: Card; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group text-left w-full bg-[#FFF9F1] border-2 border-[#26211B] shadow-[6px_6px_0_#26211B] hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
      aria-label={`${c.name} のカードを開く`}
    >
      <div className="h-20 w-full bg-gradient-to-br from-[#F7F0E7] to-[#E9D9C6] border-b-2 border-[#26211B]" />
      <div className="p-3">
        <div className="min-w-0">
          <div className="text-sm truncate">{c.name}</div>
          <div className="text-[11px] text-black/70 truncate">{c.activities.join('・')}</div>
        </div>
        <div className="mt-3 space-y-1.5">
          {c.statuses.slice(0, 3).map((s) => (
            <StatBar key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {c.tags.map((t) => (
            <Pill key={t}>{t}</Pill>
          ))}
        </div>
      </div>
    </button>
  );
}

function DetailModal({ card, onClose }: { card: Card; onClose: () => void }) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="absolute inset-x-0 top-10 mx-auto max-w-4xl bg-[#FFF9F1] border-2 border-[#26211B] shadow-[10px_10px_0_#26211B]">
        <div className="h-24 w-full bg-gradient-to-br from-[#F7F0E7] to-[#E9D9C6] border-b-2 border-[#26211B]" />
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="p-4 md:p-5 border-r-2 border-[#26211B]">
            <div className="text-base">{card.name}</div>
            <div className="text-[11px] text-black/70">{card.activities.join('・')}</div>
            {card.bio && <p className="mt-3 text-[12px] leading-relaxed text-black/80">{card.bio}</p>}
            <div className="mt-4 space-y-2">
              {card.statuses.map((s) => (
                <StatBar key={s.label} label={s.label} value={s.value} large />
              ))}
            </div>
            {card.instagram && (
              <div className="mt-5 text-[11px] text-black/70">Instagram：<span className="underline">{card.instagram}</span></div>
            )}
          </div>

          <div className="md:col-span-2 p-4 md:p-5">
            <Section title="GOOD（強み）"><Pill tone="good">{card.good}</Pill></Section>
            <Section title="WEAK（取り扱い注意）"><Pill tone="weak">{card.weak}</Pill></Section>
            <Section title="タグ">
              <div className="flex flex-wrap gap-1.5">
                {card.tags.map((t) => (<Pill key={t}>{t}</Pill>))}
              </div>
            </Section>
            <Section title="メモ">
              <div className="p-3 bg-[#FFF] border-2 border-[#26211B] text-[12px]">
                好き/嫌いの根っこ、行動のコツなどを書けます。
              </div>
            </Section>
            <div className="mt-6 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 bg-[#F0C14B] border-2 border-[#26211B] shadow-[4px_4px_0_#26211B] text-[12px]">
                閉じる（Esc）
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 first:mt-0">
      <h3 className="text-[11px] tracking-wider">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Pill({ children, tone = 'base' }: { children: React.ReactNode; tone?: 'base' | 'good' | 'weak' }) {
  const map: Record<string, string> = { base: 'bg-[#FFE5B4]', good: 'bg-[#B8E986]', weak: 'bg-[#FFD1D1]' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 border-2 border-[#26211B] shadow-[2px_2px_0_#26211B] text-[11px] ${map[tone]}`}>
      {children}
    </span>
  );
}

function StatBar({ label, value, large = false }: { label: string; value: number; large?: boolean }) {
  const h = large ? 'h-3' : 'h-2.5';
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span>{label}</span><span>{value}%</span>
      </div>
      <div className={`mt-0.5 w-full bg-[#E5DACB] border-2 border-[#26211B] ${h}`}>
        <div className="bg-[#ECA45C] h-full" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function TagChip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1 border-2 border-[#26211B] shadow-[3px_3px_0_#26211B] text-[11px] ${active ? 'bg-[#26211B] text-white' : 'bg-[#FFF9F1] hover:bg-[#FFEFD9]'}`}>
      {label}
    </button>
  );
  // ヘッダー内の検索ボックスの右あたりに追加
<Link
  href="/gallery"
  className="ml-2 px-3 py-2 text-[12px] border-2 border-[#26211B] bg-[#FFF9F1] shadow-[4px_4px_0_#26211B]"
>
  画像ギャラリーへ
</Link>
}
