import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const VALID_TYPES = ['like', 'attended'] as const;
type ReactionType = typeof VALID_TYPES[number];

export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get('eventId');
  if (!eventId) return NextResponse.json({ like: 0, attending: 0 });

  const supabase = await createClient();
  const { data } = await supabase
    .from('event_reactions' as never)
    .select('reaction_type, count')
    .eq('event_id', eventId);

  const counts: Record<ReactionType, number> = { like: 0, attending: 0 };
  for (const row of (data as { reaction_type: string; count: number }[]) ?? []) {
    if (row.reaction_type === 'like' || row.reaction_type === 'attending') {
      counts[row.reaction_type] = Number(row.count);
    }
  }

  return NextResponse.json(counts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { eventId, type } = body as { eventId: string; type: string };

  if (!eventId || !VALID_TYPES.includes(type as ReactionType)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('increment_reaction', {
    p_event_id: eventId,
    p_reaction_type: type,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ count: data });
}
