import { notFound } from 'next/navigation';
import { BookReader } from '@/components/ReadingRoom';
import { books, bookMap } from '@/data/books';
export const dynamicParams = false;
export function generateStaticParams() { return books.map(b => ({ id: b.id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return { title: bookMap[id]?.title || 'Reading guide' }; }
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const book = bookMap[id]; if (!book) notFound(); return <BookReader book={book} />; }
