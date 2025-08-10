import { db } from '../db';
import { purchases } from '../db/schema';
import { eq, and, gte, lte, like, or, desc } from 'drizzle-orm';
import type { Purchase, NewPurchase } from '../db/schema';
import type { PurchaseFilters, DashboardStats } from '../models/types';
import { AuthService } from './authService';

export class PurchaseService {
  // Criar nova compra
  static async create(data: Omit<NewPurchase, 'userId'>): Promise<Purchase> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const newPurchase: NewPurchase = {
        ...data,
        userId: currentUser.id,
      };

      const [createdPurchase] = await db.insert(purchases).values(newPurchase).returning();
      
      if (!createdPurchase) {
        throw new Error('Erro ao criar compra');
      }

      return createdPurchase;
    } catch (error) {
      console.error('Erro ao criar compra:', error);
      throw error;
    }
  }

  // Atualizar compra
  static async update(id: string, updates: Partial<Purchase>): Promise<Purchase> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      // Atualizar status automaticamente se necessário
      if (updates.status === 'PAGO' && !updates.paidAt) {
        updates.paidAt = new Date().toISOString();
      }

      const [updatedPurchase] = await db
        .update(purchases)
        .set({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .where(and(
          eq(purchases.id, id),
          eq(purchases.userId, currentUser.id)
        ))
        .returning();

      if (!updatedPurchase) {
        throw new Error('Compra não encontrada');
      }

      return updatedPurchase;
    } catch (error) {
      console.error('Erro ao atualizar compra:', error);
      throw error;
    }
  }

  // Deletar compra
  static async delete(id: string): Promise<void> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      await db
        .delete(purchases)
        .where(and(
          eq(purchases.id, id),
          eq(purchases.userId, currentUser.id)
        ));
    } catch (error) {
      console.error('Erro ao deletar compra:', error);
      throw error;
    }
  }

  // Buscar compra por ID
  static async getById(id: string): Promise<Purchase | undefined> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      const purchase = await db
        .select()
        .from(purchases)
        .where(and(
          eq(purchases.id, id),
          eq(purchases.userId, currentUser.id)
        ))
        .get();

      return purchase;
    } catch (error) {
      console.error('Erro ao buscar compra:', error);
      throw error;
    }
  }

  // Listar compras com filtros
  static async list(filters?: PurchaseFilters): Promise<Purchase[]> {
    try {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      let query = db.select().from(purchases).where(eq(purchases.userId, currentUser.id));

      // Aplicar filtros
      const conditions = [eq(purchases.userId, currentUser.id)];

      if (filters?.status) {
        conditions.push(eq(purchases.status, filters.status));
      }

      if (filters?.dateFrom) {
        conditions.push(gte(purchases.dueDate, filters.dateFrom));
      }

      if (filters?.dateTo) {
        conditions.push(lte(purchases.dueDate, filters.dateTo));
      }

      if (filters?.searchTerm) {
        conditions.push(
          or(
            like(purchases.name, `%${filters.searchTerm}%`),
            like(purchases.description, `%${filters.searchTerm}%`)
          )
        );
      }

      const result = await db
        .select()
        .from(purchases)
        .where(and(...conditions))
        .orderBy(desc(purchases.createdAt));

      // Atualizar status de compras atrasadas
      const today = new Date().toISOString().split('T')[0];
      for (const purchase of result) {
        // Comparação segura: ambas as datas em formato YYYY-MM-DD
        const due = purchase.dueDate?.split('T')[0];
        if (purchase.status === 'ANDAMENTO' && due && due < today) {
          await this.update(purchase.id, { status: 'ATRASADO' });
          purchase.status = 'ATRASADO';
        }
      }

      return result;
    } catch (error) {
      console.error('Erro ao listar compras:', error);
      throw error;
    }
  }

  // Obter estatísticas do dashboard
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const allPurchases = await this.list();
      
      const stats: DashboardStats = {
        paidCount: 0,
        paidTotal: 0,
        pendingCount: 0,
        pendingTotal: 0,
        overdueCount: 0,
        overdueTotal: 0,
      };

      for (const purchase of allPurchases) {
        switch (purchase.status) {
          case 'PAGO':
            stats.paidCount++;
            stats.paidTotal += purchase.priceCents;
            break;
          case 'ANDAMENTO':
            stats.pendingCount++;
            stats.pendingTotal += purchase.priceCents;
            break;
          case 'ATRASADO':
            stats.overdueCount++;
            stats.overdueTotal += purchase.priceCents;
            break;
        }
      }

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  // Obter histórico de pagamentos (últimos 30 dias)
  static async getPaymentHistory(): Promise<Purchase[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      return await db
        .select()
        .from(purchases)
        .where(and(
          eq(purchases.userId, currentUser.id),
          eq(purchases.status, 'PAGO'),
          gte(purchases.paidAt, thirtyDaysAgoISO)
        ))
        .orderBy(desc(purchases.paidAt));
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      throw error;
    }
  }

  // Pagar compra
  static async pay(id: string): Promise<Purchase> {
    return this.update(id, {
      status: 'PAGO',
      paidAt: new Date().toISOString(),
    });
  }
}