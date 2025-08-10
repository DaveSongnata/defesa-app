export interface User {
  id: string;
  name: string;
  login: string;
  password: string; // sha256 hash
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  name: string;
  description?: string;
  priceCents: number; // Armazenar em centavos para evitar problemas com float
  purchaseDate: string; // ISO date
  dueDate?: string; // ISO date
  status: 'PAGO' | 'ANDAMENTO' | 'ATRASADO';
  paidAt?: string; // ISO date - momento do pagamento
  createdAt: string;
  updatedAt: string;
}

export type PurchaseStatus = Purchase['status'];

export interface PurchaseFilters {
  status?: PurchaseStatus;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

export interface DashboardStats {
  paidCount: number;
  paidTotal: number;
  pendingCount: number;
  pendingTotal: number;
  overdueCount: number;
  overdueTotal: number;
}