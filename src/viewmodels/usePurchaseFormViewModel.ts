import { useState, useEffect, useCallback } from 'react';
import { PurchaseService } from '../services/purchaseService';
import { purchaseSchema, type PurchaseInput } from '../utils/validations';
import type { Purchase, PurchaseStatus } from '../models/types';
import { ZodError } from 'zod';
import { toDateOnlyString } from '../utils/format';

interface PurchaseFormState {
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  isEditMode: boolean;
  purchaseId?: string;
  form: {
    name: string;
    description: string;
    priceCents: number;
    purchaseDate: Date;
    dueDate?: Date;
    status: PurchaseStatus;
  };
}

interface ValidationErrors {
  [key: string]: string;
}

export function usePurchaseFormViewModel(purchaseId?: string) {
  const [state, setState] = useState<PurchaseFormState>({
    isLoading: false,
    isSaving: false,
    error: null,
    isEditMode: !!purchaseId,
    purchaseId,
    form: {
      name: '',
      description: '',
      priceCents: 0,
      purchaseDate: new Date(),
      dueDate: undefined,
      status: 'ANDAMENTO',
    },
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (purchaseId) {
      loadPurchase(purchaseId);
    }
  }, [purchaseId]);

  const loadPurchase = async (id: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const purchase = await PurchaseService.getById(id);
      
      if (purchase) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          form: {
            name: purchase.name,
            description: purchase.description || '',
            priceCents: purchase.priceCents,
            purchaseDate: new Date(purchase.purchaseDate),
            dueDate: purchase.dueDate ? new Date(purchase.dueDate) : undefined,
            status: purchase.status,
          },
        }));
      } else {
        throw new Error('Compra não encontrada');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao carregar compra',
        isLoading: false,
      }));
    }
  };

  const updateField = useCallback(<K extends keyof typeof state.form>(
    field: K,
    value: typeof state.form[K]
  ) => {
    setState(prev => ({
      ...prev,
      form: {
        ...prev.form,
        [field]: value,
      },
    }));
    
    // Limpar erro de validação do campo
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const validate = (): boolean => {
    try {
      const data: PurchaseInput = {
        name: state.form.name,
        description: state.form.description || undefined,
        priceCents: state.form.priceCents,
        purchaseDate: toDateOnlyString(state.form.purchaseDate)!,
        dueDate: toDateOnlyString(state.form.dueDate),
        status: state.form.status,
      };

      purchaseSchema.parse(data);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: ValidationErrors = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const save = async (): Promise<boolean> => {
    if (!validate()) {
      return false;
    }

    try {
      setState(prev => ({ ...prev, isSaving: true, error: null }));

      const purchaseData = {
        name: state.form.name,
        description: state.form.description || undefined,
        priceCents: state.form.priceCents,
        purchaseDate: toDateOnlyString(state.form.purchaseDate)!,
        dueDate: toDateOnlyString(state.form.dueDate),
        status: state.form.status,
      };

      if (state.isEditMode && state.purchaseId) {
        await PurchaseService.update(state.purchaseId, purchaseData);
      } else {
        await PurchaseService.create(purchaseData);
      }

      setState(prev => ({ ...prev, isSaving: false }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao salvar compra',
        isSaving: false,
      }));
      return false;
    }
  };

  const deletePurchase = async (): Promise<boolean> => {
    if (!state.purchaseId) return false;

    try {
      setState(prev => ({ ...prev, isSaving: true, error: null }));
      
      await PurchaseService.delete(state.purchaseId);
      
      setState(prev => ({ ...prev, isSaving: false }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao deletar compra',
        isSaving: false,
      }));
      return false;
    }
  };

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const getStatusOptions = () => [
    { key: 'ANDAMENTO' as const, label: 'Em Andamento' },
    { key: 'PAGO' as const, label: 'Pago' },
    { key: 'ATRASADO' as const, label: 'Atrasado' },
  ];

  return {
    ...state,
    validationErrors,
    updateField,
    save,
    deletePurchase,
    clearError,
    getStatusOptions,
  };
}