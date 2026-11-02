import { notFound } from 'next/navigation';
import { LabRunner } from '@/components/Labs';
import { labs } from '@/lib/course';
export const dynamicParams = false;
export function generateStaticParams() { return labs.map(l => ({ id: l.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return { title: labs.find(l => l.id === id)?.title || 'Forensic lab' }; }
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const lab = labs.find(l => l.id === id); if (!lab) notFound(); return <LabRunner key={id} lab={lab} />; }
