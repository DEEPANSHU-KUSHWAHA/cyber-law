'use client';
import { useEffect, useId, useRef, type ReactNode, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Scale, Fingerprint, ScanSearch, HardDrive, BrainCircuit, Bookmark, X, ArrowUpRight, Search, FileText, Check, CircleHelp, type LucideIcon } from 'lucide-react';
import { useWorkspace } from './WorkspaceProvider';
import { sourceMap } from '@/lib/sources';

const unitIcons: Record<string, LucideIcon> = { Scale, Fingerprint, ScanSearch, HardDrive, BrainCircuit };
export function UnitIcon({ name, size = 21, ...props }: { name: string; size?: number; className?: string }) { const Icon = unitIcons[name] || FileText; return <Icon size={size} strokeWidth={1.7} {...props} />; }
export function ProgressRing({ value, size = 100 }: { value: number; size?: number }) {
  return <div className="progress-ring" style={{ '--progress': `${value}%`, width: size, height: size } as CSSProperties} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label="Course completion"><div><strong>{value}<span>%</span></strong><small>complete</small></div></div>;
}
export function BookmarkButton({ id, label = false, className = '' }: { id: string; label?: boolean; className?: string }) {
  const { state, toggleBookmark, ready } = useWorkspace(); const saved = state.bookmarks.includes(id);
  return <button type="button" className={`${label ? 'button button-secondary' : 'icon-button'} ${saved ? 'is-bookmarked' : ''} ${className}`} onClick={() => toggleBookmark(id)} disabled={!ready} aria-pressed={saved} title={saved ? 'Remove from saved items' : 'Save for later'} aria-label={saved ? 'Remove bookmark' : 'Save for later'}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />{label && <span>{saved ? 'Saved to workspace' : 'Save for later'}</span>}</button>;
}
export function PageHeading({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return <div className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{children && <div className="heading-actions">{children}</div>}</div>;
}
export function EmptyState({ title, description, href, action = 'Explore the course' }: { title: string; description: string; href?: string; action?: string }) {
  return <div className="empty-state"><div className="empty-icon"><Search size={28} /></div><h3>{title}</h3><p>{description}</p>{href && <Link className="button button-primary" href={href}>{action}<ArrowUpRight size={16} /></Link>}</div>;
}
export function Modal({ title, children, onClose, className = '' }: { title: string; children: ReactNode; onClose: () => void; className?: string }) {
  const id = useId(); const ref = useRef<HTMLDivElement>(null); const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => ref.current?.querySelector<HTMLElement>('input,button,a,textarea,select,[tabindex="0"]')?.focus(), 30);
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key === 'Tab') {
        const nodes = ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,textarea,select,[tabindex="0"]');
        if (!nodes?.length) return;
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handle);
    return () => { clearTimeout(timer); document.body.style.overflow = overflow; document.removeEventListener('keydown', handle); previous?.focus(); };
  }, []);
  return createPortal(<div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div ref={ref} role="dialog" aria-modal="true" aria-labelledby={id} className={`modal ${className}`}><div className="modal-heading"><h2 id={id}>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button></div>{children}</div></div>, document.body);
}
export function SourceList({ ids }: { ids: string[] }) {
  return <div className="source-list">{ids.map((id, index) => { const source = sourceMap[id]; if (!source) return null; return <a href={source.url} target="_blank" rel="noopener noreferrer" key={id}><span className="source-number">{String(index + 1).padStart(2, '0')}</span><div><strong>{source.title}</strong><p>{source.publisher}</p>{source.note && <small>{source.note}</small>}</div><ArrowUpRight size={17} /></a>; })}</div>;
}
export function InfoNote({ children, warning = false }: { children: ReactNode; warning?: boolean }) { return <div className={`info-note ${warning ? 'warning' : ''}`}>{warning ? <CircleHelp size={19} /> : <Check size={19} />}<div>{children}</div></div>; }
