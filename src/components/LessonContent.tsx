import type { Topic } from '@/lib/types';
import { sourceMap } from '@/lib/sources';
import { Lightbulb, FlaskConical, CheckCircle2 } from 'lucide-react';

export function LessonBody({ topic }: { topic: Topic }) {
  return <div className="lesson-prose">{topic.sections.map((section, index) => <section id={`section-${index + 1}`} key={section.title}><div className="lesson-section-number">{String(index + 1).padStart(2, '0')}</div><h2>{section.title}</h2>{section.body.map((p, i) => <p key={i}>{p}</p>)}{section.bullets && <ul>{section.bullets.map(b => <li key={b}>{b}</li>)}</ul>}</section>)}{topic.terms.length > 0 && <section><h2>Words worth knowing</h2><dl>{topic.terms.map(t => <div key={t.term}><dt>{t.term}</dt><dd>{t.definition}</dd></div>)}</dl></section>}</div>;
}
export function FieldExercise({ topic }: { topic: Topic }) {
  return <div className="field-exercise"><div className="exercise-eyebrow"><FlaskConical size={16} />PUT IT INTO PRACTICE</div><h2>{topic.practice.title}</h2><p className="exercise-scenario">{topic.practice.scenario}</p><ol>{topic.practice.steps.map((step, i) => <li key={step}><span>{i + 1}</span>{step}</li>)}</ol><div className="exercise-debrief"><Lightbulb size={19} /><div><strong>The thinking behind it</strong><p>{topic.practice.debrief}</p></div></div></div>;
}
export function PrintLesson({ topic, answers = true }: { topic: Topic; answers?: boolean }) {
  return <article className="print-lesson"><div className="print-resource-meta">UNIT {topic.unit} · LESSON {topic.id} · {topic.minutes} MINUTES</div><h1>{topic.title}</h1><p className="print-summary">{topic.summary}</p><h2>Learning outcomes</h2><ul>{topic.objectives.map(o => <li key={o}>{o}</li>)}</ul><LessonBody topic={topic} /><FieldExercise topic={topic} /><section className="print-question"><h2>Check your understanding</h2><h3>{topic.question.prompt}</h3><ol type="A">{topic.question.options.map(o => <li key={o}>{o}</li>)}</ol>{answers && <div className="print-answer"><strong>Correct answer: {String.fromCharCode(65 + topic.question.answer)}</strong><p>{topic.question.explanation}</p></div>}</section><section><h2>Primary sources & further reading</h2><ol className="print-sources">{topic.sources.map(id => { const source = sourceMap[id]; return source ? <li key={id}><strong>{source.title}</strong><br />{source.publisher}<br /><a href={source.url}>{source.url}</a>{source.note && <p>{source.note}</p>}</li> : null; })}</ol></section></article>;
}
