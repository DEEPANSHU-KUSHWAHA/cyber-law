import { Suspense } from 'react';
import PrintView from '@/components/PrintView';
export const metadata = { title: 'Print & PDF studio', robots: { index: false, follow: false } };
export default function Page() { return <Suspense fallback={null}><PrintView /></Suspense>; }
