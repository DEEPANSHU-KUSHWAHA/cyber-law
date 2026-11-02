export type Section = { title: string; body: string[]; bullets?: string[] };
export type Question = { id: string; prompt: string; options: string[]; answer: number; explanation: string; unit: number; marks?: number };
export type Topic = {
  id: string; unit: number; title: string; minutes: number; summary: string;
  objectives: string[]; sections: Section[]; terms: { term: string; definition: string }[];
  practice: { title: string; scenario: string; steps: string[]; debrief: string };
  question: Question; lawIds: string[]; labId?: string; sources: string[];
};
export type Unit = { id: number; roman: string; title: string; shortTitle: string; description: string; color: string; icon: string };
export type Source = { id: string; title: string; publisher: string; url: string; note?: string };
export type LawSection = { number: string; title: string; text: string; old?: string };
export type LawDocument = {
  id: string; title: string; short: string; year: string; kind: 'Act' | 'Rule' | 'Policy' | 'Standard';
  status: 'current' | 'historical' | 'framework'; summary: string; url: string; caution?: string;
  sections: LawSection[]; topics: string[];
};
export type Comparison = { subject: string; old: string; next: string; change: string; caveat: string; topic: string };
export type Book = { id: string; title: string; authors: string; publisher: string; year: string; color: string; code: string; url: string; description: string; editionNote: string; chapters: { title: string; summary: string; topics: string[] }[] };
export type CaseStudy = { id: string; title: string; category: string; year: string; subtitle: string; fictional: boolean; difficulty: string; summary: string; story: string[]; timeline: { date: string; event: string }[]; issue: string; holding: string; lessons: string[]; questions: string[]; sources: string[]; topics: string[] };
export type Lab = { id: string; title: string; subtitle: string; minutes: number; unit: number; type: 'acquisition' | 'hash' | 'osint' | 'network' | 'email' | 'certificate' | 'ai'; skills: string[]; description: string; steps: string[] };
export type QuizAttempt = { id: string; date: string; score: number; total: number; mode: string; answers: Record<string, number> };
export type WorkspaceState = {
  completed: string[]; bookmarks: string[]; notes: Record<string, string>;
  labs: Record<string, { completed: boolean; date: string; result: string }>;
  attempts: QuizAttempt[]; lastTopic: string; recentTopics: string[];
  studyDays: number[]; studyMinutes: number;
};
