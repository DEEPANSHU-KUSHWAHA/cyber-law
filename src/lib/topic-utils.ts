import type { Topic, Section } from './types';

type TopicInput = {
  id: string; title: string; minutes?: number; summary: string;
  sections: Section[]; practice: Topic['practice'];
  quiz: [string, string[], number, string]; laws: string[]; sources: string[]; labId?: string;
  terms?: Topic['terms'];
};
export function topic(input: TopicInput): Topic {
  const { id, title, minutes = 12, summary, sections, practice, quiz, laws, sources, labId, terms = [] } = input;
  return { id, title, minutes, summary, sections, practice, terms, lawIds: laws, sources, labId,
    unit: Number(id.split('.')[0]),
    objectives: sections.map(s => `Explain ${s.title.charAt(0).toLowerCase() + s.title.slice(1)} and apply it to an investigation.`),
    question: { id: `q-${id}`, prompt: quiz[0], options: quiz[1], answer: quiz[2], explanation: quiz[3], unit: Number(id.split('.')[0]) },
  };
}
