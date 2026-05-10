'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const REACTIONS = [
  { type: 'like', emoji: '👍', label: '좋아요' },
  { type: 'attended', emoji: '🚴', label: '참가했어요' },
] as const;

type ReactionType = typeof REACTIONS[number]['type'];
type Counts = Record<ReactionType, number>;
type Reacted = Record<ReactionType, boolean>;

export function ReactionButtons({ eventId }: { eventId: string }) {
  const [counts, setCounts] = useState<Counts>({ like: 0, attended: 0 });
  const [reacted, setReacted] = useState<Reacted>({ like: false, attended: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored: Reacted = { like: false, attended: false };
    for (const { type } of REACTIONS) {
      stored[type] = localStorage.getItem(`reaction-${eventId}-${type}`) === 'true';
    }
    setReacted(stored);

    fetch(`/api/reactions?eventId=${eventId}`)
      .then(r => r.json())
      .then(data => setCounts(data))
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleReaction = async (type: ReactionType) => {
    if (reacted[type]) return;

    setCounts(prev => ({ ...prev, [type]: prev[type] + 1 }));
    setReacted(prev => ({ ...prev, [type]: true }));
    localStorage.setItem(`reaction-${eventId}-${type}`, 'true');

    try {
      await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, type }),
      });
    } catch {
      setCounts(prev => ({ ...prev, [type]: prev[type] - 1 }));
      setReacted(prev => ({ ...prev, [type]: false }));
      localStorage.removeItem(`reaction-${eventId}-${type}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {REACTIONS.map(({ type, emoji, label }) => (
        <button
          key={type}
          onClick={() => handleReaction(type)}
          disabled={reacted[type] || loading}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all',
            reacted[type]
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background hover:bg-accent border-border disabled:opacity-50'
          )}
        >
          <span>{emoji}</span>
          <span>{label}</span>
          {!loading && (
            <span className={cn('text-xs', reacted[type] ? 'opacity-80' : 'opacity-50')}>
              {counts[type].toLocaleString()}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
