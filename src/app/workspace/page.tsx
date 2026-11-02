import PersonalWorkspace from '@/components/PersonalWorkspace';
export const metadata = { title: 'My workspace' };
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) { const { tab } = await searchParams; return <PersonalWorkspace key={tab || 'saved'} initialTab={['saved', 'notes', 'planner'].includes(tab || '') ? tab : 'saved'} />; }
