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
    priceCents?: number;
    purchaseDate?: Date;
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
      priceCents: undefined,
      purchaseDate: undefined,
      dueDate: undefined,
      status: 'ANDAMENTO',
    },
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((field: string, value: any, currentForm: typeof state.form) => {
    console.log(`🔍 Validando campo ${field}:`, value);
    
    // Validação específica por campo
    let errorMessage = '';
    
    switch (field) {
      case 'name':
        const nameValue = value as string;
        if (!nameValue || nameValue.trim().length === 0) {
          errorMessage = 'Nome do produto é obrigatório';
        } else if (nameValue.length > 200) {
          errorMessage = 'Nome deve ter no máximo 200 caracteres';
        }
        break;
        
      case 'description':
        const descValue = value as string;
        if (!descValue || descValue.trim().length === 0) {
          errorMessage = 'Descrição é obrigatória';
        } else if (descValue.length > 500) {
          errorMessage = 'Descrição deve ter no máximo 500 caracteres';
        }
        break;
        
      case 'priceCents':
        const priceValue = value as number;
        if (!priceValue || priceValue <= 0) {
          errorMessage = 'Valor deve ser maior que zero';
        }
        break;
        
      case 'purchaseDate':
        if (!value) {
          errorMessage = 'Data de compra é obrigatória';
        }
        break;
        
      case 'dueDate':
        if (!value) {
          errorMessage = 'Data de vencimento é obrigatória';
        }
        break;
        
      case 'status':
        if (!value || !['PAGO', 'ANDAMENTO', 'ATRASADO'].includes(value as string)) {
          errorMessage = 'Selecione um status válido';
        }
        break;
    }
    
    console.log(`🔍 Campo ${field} - Erro:`, errorMessage || 'Sem erro');
    
    // Atualizar ou limpar erro do campo
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (errorMessage) {
        newErrors[field] = errorMessage;
      } else {
        delete newErrors[field];
      }
      console.log('🚨 Erros atualizados:', newErrors);
      return newErrors;
    });
  }, []);

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
    setState(prev => {
      const newState = {
        ...prev,
        form: {
          ...prev.form,
          [field]: value,
        },
      };
      
      // Validar campo individual em tempo real com o novo estado
      validateField(field as string, value, newState.form);
      
      return newState;
    });
  }, [validateField]);

  const validateAllFields = () => {
    console.log('🔍 Validando todos os campos:', state.form);
    
    // Validar cada campo individualmente
    validateField('name', state.form.name, state.form);
    validateField('description', state.form.description, state.form);
    validateField('priceCents', state.form.priceCents, state.form);
    validateField('purchaseDate', state.form.purchaseDate, state.form);
    validateField('dueDate', state.form.dueDate, state.form);
    validateField('status', state.form.status, state.form);
  };

  const validate = (): boolean => {
    // Aguardar um pouco para que os erros sejam atualizados
    setTimeout(() => {
      const hasErrors = Object.keys(validationErrors).length > 0;
      console.log('🔍 Verificando se há erros:', validationErrors, 'HasErrors:', hasErrors);
      
      if (hasErrors) {
        setState(prev => ({
          ...prev,
          error: 'Por favor, corrija os erros no formulário'
        }));
      } else {
        setState(prev => ({ ...prev, error: null }));
      }
    }, 100);
    
    // Retornar baseado no estado atual dos erros
    const hasErrors = Object.keys(validationErrors).length > 0;
    console.log('🔍 Resultado da validação:', !hasErrors);
    return !hasErrors;
  };

  const save = async (): Promise<boolean> => {
    // Validar todos os campos de uma vez
    const errors: ValidationErrors = {};
    
    // Validar nome
    if (!state.form.name || state.form.name.trim().length === 0) {
      errors.name = 'Nome do produto é obrigatório';
    }
    
    // Validar descrição
    if (!state.form.description || state.form.description.trim().length === 0) {
      errors.description = 'Descrição é obrigatória';
    }
    
    // Validar preço
    if (!state.form.priceCents || state.form.priceCents <= 0) {
      errors.priceCents = 'Valor deve ser maior que zero';
    }
    
    // Validar data de compra
    if (!state.form.purchaseDate) {
      errors.purchaseDate = 'Data de compra é obrigatória';
    }
    
    // Validar data de vencimento
    if (!state.form.dueDate) {
      errors.dueDate = 'Data de vencimento é obrigatória';
    }
    
    // Validar status
    if (!state.form.status || !['PAGO', 'ANDAMENTO', 'ATRASADO'].includes(state.form.status)) {
      errors.status = 'Selecione um status válido';
    }
    
    // Atualizar erros
    setValidationErrors(errors);
    
    // Se há erros, mostrar mensagem e não prosseguir
    if (Object.keys(errors).length > 0) {
      setState(prev => ({
        ...prev,
        error: 'Por favor, corrija os erros no formulário'
      }));
      return false;
    }
    
    // Limpar mensagem de erro se tudo ok
    setState(prev => ({ ...prev, error: null }));

    try {
      setState(prev => ({ ...prev, isSaving: true, error: null }));

      const purchaseData = {
        name: state.form.name,
        description: state.form.description || '',
        priceCents: state.form.priceCents || 0,
        purchaseDate: state.form.purchaseDate ? toDateOnlyString(state.form.purchaseDate)! : '',
        dueDate: state.form.dueDate ? toDateOnlyString(state.form.dueDate)! : '',
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