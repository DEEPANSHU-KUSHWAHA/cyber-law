import { pgTable, uuid, jsonb, timestamp } from 'drizzle-orm/pg-core';
import type { WorkspaceState } from '@/lib/types';

export const studyProfiles = pgTable('study_profiles', {
  id: uuid('id').primaryKey(),
  data: jsonb('data').$type<WorkspaceState>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
