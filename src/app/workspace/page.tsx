import { Suspense } from 'react';
import PersonalWorkspace from '@/components/PersonalWorkspace';
export const metadata = { title: 'My workspace' };
export default function Page() { return <Suspense fallback={null}><PersonalWorkspace /></Suspense>; }
