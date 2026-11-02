'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { WorkspaceState, QuizAttempt } from '@/lib/types';

const STORAGE_KEY = 'trace-workspace-v1';
const initial: WorkspaceState = { completed: [], bookmarks: [], notes: {}, labs: {}, attempts: [], lastTopic: '1.1', recentTopics: [], studyDays: [1, 3, 5], studyMinutes: 30 };

const readLocalState = (): WorkspaceState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkspaceState;
  } catch {
    return null;
  }
};

const saveLocalState = (value: WorkspaceState) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage failures in restricted browsers or private mode.
  }
};

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

  const hydrateFromStorage = useCallback(() => {
    const saved = readLocalState();
    if (saved) {
      stateRef.current = saved;
      revision.current = 0;
      setState(saved);
    }
    setReady(true);
    setError(false);
    initialized.current = true;
  }, []);

  const update = useCallback((patch: Partial<WorkspaceState>) => {
    stateRef.current = { ...stateRef.current, ...patch };
    revision.current += 1;
    setState(stateRef.current);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch('/api/workspace', { signal: controller.signal });
        if (!response.ok) throw new Error('Unavailable');
        const body = await response.json();
        if (revision.current > 0) {
          stateRef.current = { ...body.state, ...stateRef.current };
          revision.current += 1;
        } else {
          stateRef.current = body.state;
        }
        saveLocalState(stateRef.current);
        initialized.current = true;
        setState(stateRef.current);
        setReady(true);
        setError(false);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        hydrateFromStorage();
      }
    };

    void load();
    return () => controller.abort();
  }, [loadRetry, hydrateFromStorage]);

  useEffect(() => {
    if (!ready || revision.current === savedRevision.current) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const version = revision.current;
      setSaving(true);

      const persist = async () => {
        saveLocalState(stateRef.current);
        try {
          const response = await fetch('/api/workspace', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stateRef.current),
            signal: controller.signal,
          });
          if (!response.ok) throw new Error('Save failed');
          savedRevision.current = version;
          setError(false);
        } catch (e) {
          if (e instanceof Error && e.name !== 'AbortError') {
            savedRevision.current = version;
            setError(false);
          }
        } finally {
          if (!controller.signal.aborted) setSaving(false);
        }
      };

      void persist();
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
