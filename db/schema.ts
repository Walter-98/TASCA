import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const movements=sqliteTable('movements',{id:text('id').primaryKey(),type:text('type').notNull(),amount:integer('amount').notNull(),category:text('category').notNull(),description:text('description').notNull(),date:text('date').notNull()});
export const budgets=sqliteTable('budgets',{month:text('month').primaryKey(),amount:integer('amount').notNull()});
