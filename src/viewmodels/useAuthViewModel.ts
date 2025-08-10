import { useState, useCallback, useEffect } from 'react';
import { AuthService } from '../services/authService';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '../utils/validations';
import type { User } from '../models/types';
import { ZodError } from 'zod';

interface AuthState {
  isLoading: boolean;
  error: string | null;
  user: User | null;
  isAuthenticated: boolean;
  showPassword: boolean;
  isRegisterMode: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

export function useAuthViewModel() {
  const [state, setState] = useState<AuthState>({
    isLoading: false,
    error: null,
    user: null,
    isAuthenticated: false,
    showPassword: false,
    isRegisterMode: false,
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Verificar autenticação ao iniciar
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const isAuth = await AuthService.isAuthenticated();
      
      if (isAuth) {
        const user = await AuthService.getCurrentUser();
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user,
          isLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const togglePasswordVisibility = useCallback(() => {
    setState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  const toggleMode = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isRegisterMode: !prev.isRegisterMode,
      error: null,
    }));
    setValidationErrors({});
  }, []);

  const validateLogin = (data: LoginInput): boolean => {
    try {
      loginSchema.parse(data);
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

  const validateRegister = (data: RegisterInput): boolean => {
    try {
      registerSchema.parse(data);
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

  const login = async (data: LoginInput) => {
    if (!validateLogin(data)) {
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await AuthService.login(data.login, data.password);
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
      }));
      
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao fazer login',
        isLoading: false,
      }));
      return false;
    }
  };

  const register = async (data: RegisterInput) => {
    if (!validateRegister(data)) {
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await AuthService.register(data.name, data.login, data.password);
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
      }));
      
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao registrar',
        isLoading: false,
      }));
      return false;
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await AuthService.logout();
      
      setState({
        isLoading: false,
        error: null,
        user: null,
        isAuthenticated: false,
        showPassword: false,
        isRegisterMode: false,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao fazer logout',
        isLoading: false,
      }));
    }
  };

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // Estado
    ...state,
    validationErrors,
    
    // Ações
    login,
    register,
    logout,
    togglePasswordVisibility,
    toggleMode,
    clearError,
    checkAuthentication,
  };
}