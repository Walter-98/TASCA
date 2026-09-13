import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const movements=sqliteTable('movements',{id:text('id').primaryKey(),type:text('type').notNull(),amount:integer('amount').notNull(),category:text('category').notNull(),description:text('description').notNull(),date:text('date').notNull(),accountId:text('account_id'),toAccountId:text('to_account_id')});
export const budgets=sqliteTable('budgets',{month:text('month').primaryKey(),amount:integer('amount').notNull()});
export const accounts=sqliteTable('accounts',{id:text('id').primaryKey(),name:text('name').notNull(),opening:integer('opening').notNull(),openingDate:text('opening_date').notNull()});
export const recurring=sqliteTable('recurring',{id:text('id').primaryKey(),type:text('type').notNull(),amount:integer('amount').notNull(),category:text('category').notNull(),description:text('description').notNull(),accountId:text('account_id').notNull(),startDate:text('start_date').notNull(),endDate:text('end_date'),active:integer('active').notNull().default(1)});
export const occurrences=sqliteTable('occurrences',{id:text('id').primaryKey(),recurringId:text('recurring_id').notNull(),date:text('date').notNull()});
