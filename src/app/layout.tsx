import type { Metadata } from 'next';
import { DM_Sans, IBM_Plex_Mono, Sora } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import '../styles/learning.css';
import '../styles/labs.css';
import '../styles/practice.css';
import '../styles/print.css';
import '../styles/refinements.css';
import AppShell from '@/components/AppShell';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-ibm-plex-mono' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export const metadata: Metadata = {
  title: { default: 'Trace — Cyber Law & Digital Forensics', template: '%s · Trace' },
  description: 'A connected computer education course: 60 detailed lessons, seven interactive forensic labs, Indian law comparisons, case files, and printable study notes.',
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${ibmPlexMono.variable} ${sora.variable}`}>
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
