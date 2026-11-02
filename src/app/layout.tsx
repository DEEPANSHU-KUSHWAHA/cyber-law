import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import '../styles/learning.css';
import '../styles/labs.css';
import '../styles/practice.css';
import '../styles/print.css';
import '../styles/refinements.css';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: { default: 'Trace — Cyber Law & Digital Forensics', template: '%s · Trace' },
  description: 'A connected computer education course: 60 detailed lessons, seven interactive forensic labs, Indian law comparisons, case files, and printable study notes.',
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;550;600;650;700&family=IBM+Plex+Mono:wght@400;500;600&family=Sora:wght@400;500;550;600;650;700;750&display=swap" rel="stylesheet" /></head><body><AppShell>{children}</AppShell></body></html>;
}
