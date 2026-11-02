'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { WorkspaceState, QuizAttempt } from '@/lib/types';

const initial: WorkspaceState = { completed: [], bookmarks: [], notes: {}, labs: {}, attempts: [], lastTopic: '1.1', recentTopics: [], studyDays: [1, 3, 5], studyMinutes: 30 };
type Context = {
  state: WorkspaceState; ready: boolean; saving: boolean; error: boolean;
  update: (patch: Partial<WorkspaceState>) => void; toggleBookmark: (id: string) => void;
  toggleComplete: (id: string) => void; visitTopic: (id: string) => void;
  recordLab: (id: string, result: string) => void; recordAttempt: (attempt: QuizAttempt) => void; retry: () => void;
};
const WorkspaceContext = createContext<Context | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initial);
  const stateRef = useRef(initial);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [loadRetry, setLoadRetry] = useState(0);
  const [saveRetry, setSaveRetry] = useState(0);
  const revision = useRef(0);
  const initialized = useRef(false);
  const savedRevision = useRef(0);
  const update = useCallback((patch: Partial<WorkspaceState>) => {
    stateRef.current = { ...stateRef.current, ...patch };
    revision.current += 1;
    setState(stateRef.current);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/workspace', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Unavailable');
      const body = await response.json();
      if (revision.current > 0) { stateRef.current = { ...body.state, ...stateRef.current }; revision.current += 1; }
      else stateRef.current = body.state;
      initialized.current = true;
      setState(stateRef.current);
      setReady(true); setError(false);
    }).catch(e => { if (e.name !== 'AbortError') { setError(true); setReady(true); } });
    return () => controller.abort();
  }, [loadRetry]);
  useEffect(() => {
    if (!ready || revision.current === savedRevision.current) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const version = revision.current;
      setSaving(true);
      fetch('/api/workspace', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(stateRef.current), signal: controller.signal })
        .then(r => { if (!r.ok) throw new Error('Save failed'); savedRevision.current = version; setError(false); })
        .catch(e => { if (e.name !== 'AbortError') setError(true); })
        .finally(() => { if (!controller.signal.aborted) setSaving(false); });
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [state, ready, saveRetry]);
  const toggleBookmark = (id: string) => update({ bookmarks: stateRef.current.bookmarks.includes(id) ? stateRef.current.bookmarks.filter(b => b !== id) : [...stateRef.current.bookmarks, id] });
  const toggleComplete = (id: string) => update({ completed: stateRef.current.completed.includes(id) ? stateRef.current.completed.filter(c => c !== id) : [...stateRef.current.completed, id] });
  const visitTopic = (id: string) => update({ lastTopic: id, recentTopics: [id, ...stateRef.current.recentTopics.filter(t => t !== id)].slice(0, 5) });
  const recordLab = (id: string, result: string) => update({ labs: { ...stateRef.current.labs, [id]: { completed: true, date: new Date().toISOString(), result } } });
  const recordAttempt = (attempt: QuizAttempt) => update({ attempts: [attempt, ...stateRef.current.attempts].slice(0, 50) });
  return <WorkspaceContext.Provider value={{ state, ready, saving, error, update, toggleBookmark, toggleComplete, visitTopic, recordLab, recordAttempt, retry: () => { if (initialized.current && revision.current > savedRevision.current) setSaveRetry(c => c + 1); else setLoadRetry(c => c + 1); } }}>{children}</WorkspaceContext.Provider>;
}
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('WorkspaceProvider is required');
  return context;
}
