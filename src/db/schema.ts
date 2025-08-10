import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  name: text('name').notNull(),
  login: text('login').notNull().unique(),
  password: text('password').notNull(), // sha256 hash
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export const purchases = sqliteTable('purchases', {
  id: text('id').primaryKey().$defaultFn(() => `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(), // Armazenar em centavos
  purchaseDate: text('purchase_date').notNull(),
  dueDate: text('due_date'),
  status: text('status', { enum: ['PAGO', 'ANDAMENTO', 'ATRASADO'] }).notNull().default('ANDAMENTO'),
  paidAt: text('paid_at'), // Data de pagamento
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;