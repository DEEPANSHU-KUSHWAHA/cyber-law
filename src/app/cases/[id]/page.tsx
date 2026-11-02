import { notFound } from 'next/navigation';
import { CaseReader } from '@/components/CaseFiles';
import { cases, caseMap } from '@/data/cases';
export const dynamicParams = false;
export function generateStaticParams() { return cases.map(c => ({ id: c.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return { title: caseMap[id]?.title || 'Case file' }; }
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const study = caseMap[id]; if (!study) notFound(); return <CaseReader study={study} />; }
