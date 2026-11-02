import { notFound } from 'next/navigation';
import LessonReader from '@/components/LessonReader';
import { topics, topicMap } from '@/data';
export const dynamicParams = false;
export function generateStaticParams() { return topics.map(t => ({ id: t.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return { title: topicMap[id]?.title || 'Lesson' }; }
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const topic = topicMap[id]; if (!topic) notFound(); return <LessonReader key={id} topic={topic} />; }
