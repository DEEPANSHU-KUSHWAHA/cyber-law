import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { studyProfiles } from '@/db/schema';
import type { WorkspaceState } from '@/lib/types';

export const dynamic = 'force-dynamic';
const COOKIE = 'trace_learner';
const emptyState = (): WorkspaceState => ({ completed: [], bookmarks: [], notes: {}, labs: {}, attempts: [], lastTopic: '1.1', recentTopics: [], studyDays: [1, 3, 5], studyMinutes: 30 });
const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const validId = (v: unknown): v is string => typeof v === 'string' && /^[1-5]\.(1[0-2]|[1-9])$/.test(v);
const strings = (v: unknown, max: number) => Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string').slice(0, max) : [];

function validate(value: unknown): WorkspaceState {
  if (!isObject(value)) throw new Error('Invalid workspace');
  const result = emptyState();
  result.completed = [...new Set(strings(value.completed, 60).filter(validId))];
  result.bookmarks = strings(value.bookmarks, 200).filter(s => /^(topic|law|book|case):[\w.-]+$/.test(s)).slice(0, 100);
  if (isObject(value.notes)) {
    result.notes = Object.fromEntries(Object.entries(value.notes).filter(([k]) => validId(k) || /^case:[a-z-]+$/.test(k)).slice(0, 100).map(([k, v]) => [k, typeof v === 'string' ? v.slice(0, 12000) : '']));
  }
  if (isObject(value.labs)) {
    for (const [k, v] of Object.entries(value.labs).slice(0, 20)) {
      if (/^[a-z-]+$/.test(k) && isObject(v) && typeof v.completed === 'boolean') result.labs[k] = { completed: v.completed, date: typeof v.date === 'string' ? v.date.slice(0, 40) : '', result: typeof v.result === 'string' ? v.result.slice(0, 6000) : '' };
    }
  }
  if (Array.isArray(value.attempts)) {
    result.attempts = value.attempts.slice(0, 50).filter(isObject).filter(a => typeof a.id === 'string' && typeof a.score === 'number' && Number.isFinite(a.score) && typeof a.total === 'number' && a.total > 0).map(a => ({ id: String(a.id).slice(0, 80), date: typeof a.date === 'string' ? a.date.slice(0, 40) : '', score: Math.max(0, Number(a.score)), total: Number(a.total), mode: typeof a.mode === 'string' ? a.mode.slice(0, 40) : 'quiz', answers: isObject(a.answers) ? Object.fromEntries(Object.entries(a.answers).filter(([k, v]) => k.length < 60 && typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < 10).slice(0, 100).map(([k, v]) => [k, v as number] as const)) : {} }));
  }
  if (validId(value.lastTopic)) result.lastTopic = value.lastTopic;
  result.recentTopics = [...new Set(strings(value.recentTopics, 5).filter(validId))];
  result.studyDays = Array.isArray(value.studyDays) ? [...new Set(value.studyDays.filter((n): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 6))] : [1, 3, 5];
  if (typeof value.studyMinutes === 'number' && [15, 30, 45, 60].includes(value.studyMinutes)) result.studyMinutes = value.studyMinutes;
  return result;
}

export async function GET() {
  try {
    const jar = await cookies();
    let id = jar.get(COOKIE)?.value;
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      id = randomUUID();
      jar.set(COOKIE, id, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 31536000 });
    }
    await db.insert(studyProfiles).values({ id, data: emptyState() }).onConflictDoNothing();
    const [profile] = await db.select().from(studyProfiles).where(eq(studyProfiles.id, id)).limit(1);
    return NextResponse.json({ state: profile ? validate(profile.data) : emptyState() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Your workspace could not be loaded. Please retry.' }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 250000) return NextResponse.json({ error: 'Workspace is too large.' }, { status: 413 });
    const id = (await cookies()).get(COOKIE)?.value;
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Reload to initialize your workspace.' }, { status: 400 });
    const data = validate(JSON.parse(raw));
    await db.insert(studyProfiles).values({ id, data, updatedAt: new Date() }).onConflictDoUpdate({ target: studyProfiles.id, set: { data, updatedAt: new Date() } });
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof SyntaxError ? 'Invalid workspace data.' : 'Could not save. Your edits remain on screen; retry when connected.' }, { status: 400 });
  }
}
