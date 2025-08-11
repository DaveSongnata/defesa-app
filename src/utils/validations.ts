import { z } from 'zod';

// Schema de validação para login
export const loginSchema = z.object({
  login: z
    .string()
    .min(3, 'Login deve ter no mínimo 3 caracteres')
    .max(50, 'Login deve ter no máximo 50 caracteres'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
});

// Schema de validação para registro
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  login: z
    .string()
    .min(3, 'Login deve ter no mínimo 3 caracteres')
    .max(50, 'Login deve ter no máximo 50 caracteres'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  confirmPassword: z
    .string()
    .min(6, 'Confirmação de senha deve ter no mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// Schema de validação para compra
export const purchaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome do produto é obrigatório')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .trim(),
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .trim(),
  priceCents: z
    .number()
    .int('Valor deve ser um número inteiro')
    .min(1, 'Valor deve ser maior que zero'),
  purchaseDate: z
    .string()
    .min(1, 'Data de compra é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  dueDate: z
    .string()
    .min(1, 'Data de vencimento é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  status: z.enum(['PAGO', 'ANDAMENTO', 'ATRASADO'], {
    errorMap: () => ({ message: 'Selecione um status válido' })
  }),
});

// Tipos inferidos dos schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PurchaseInput = z.infer<typeof purchaseSchema>;