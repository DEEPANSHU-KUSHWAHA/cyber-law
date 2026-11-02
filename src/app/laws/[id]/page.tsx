import { notFound } from 'next/navigation';
import { LawReader } from '@/components/LawLibrary';
import { lawDocuments, lawMap } from '@/data/laws';
export const dynamicParams = false;
export function generateStaticParams() { return lawDocuments.map(l => ({ id: l.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return { title: lawMap[id]?.short || 'Law guide' }; }
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const law = lawMap[id]; if (!law) notFound(); return <LawReader key={id} law={law} />; }
