import PrintView, { type PrintProps } from '@/components/PrintView';
export const metadata = { title: 'Print & PDF studio', robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<PrintProps> }) { const props = await searchParams; return <PrintView key={JSON.stringify(props)} {...props} />; }
