import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import type { User, NewUser } from '../db/schema';

const AUTH_TOKEN_KEY = '@defesa-app:auth-token';
const CURRENT_USER_KEY = '@defesa-app:current-user';

export class AuthService {
  // Hash da senha usando SHA256
  private static hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  // Verificar senha
  private static verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  // Registrar novo usuário
  static async register(name: string, login: string, password: string): Promise<User> {
    try {
      // Verificar se o login já existe
      const existingUser = await db.select().from(users).where(eq(users.login, login)).get();
      
      if (existingUser) {
        throw new Error('Login já existe');
      }

      // Hash da senha
      const hashedPassword = this.hashPassword(password);

      // Criar usuário
      const newUser: NewUser = {
        name,
        login,
        password: hashedPassword,
      };

      const [createdUser] = await db.insert(users).values(newUser).returning();
      
      if (!createdUser) {
        throw new Error('Erro ao criar usuário');
      }

      // Fazer login automático após registro
      await this.saveAuthData(createdUser);

      return createdUser;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }

  // Login
  static async login(login: string, password: string): Promise<User> {
    try {
      // Buscar usuário
      const user = await db.select().from(users).where(eq(users.login, login)).get();
      
      if (!user) {
        throw new Error('Usuário ou senha inválidos');
      }

      // Verificar senha
      if (!this.verifyPassword(password, user.password)) {
        throw new Error('Usuário ou senha inválidos');
      }

      // Salvar dados de autenticação
      await this.saveAuthData(user);

      return user;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, CURRENT_USER_KEY]);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  }

  // Salvar dados de autenticação
  private static async saveAuthData(user: User): Promise<void> {
    try {
      // Gerar token simples (em produção, use JWT)
      const token = CryptoJS.SHA256(`${user.id}-${Date.now()}`).toString();
      
      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, token],
        [CURRENT_USER_KEY, JSON.stringify(user)],
      ]);
    } catch (error) {
      console.error('Erro ao salvar dados de autenticação:', error);
      throw error;
    }
  }

  // Obter usuário atual
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      return null;
    }
  }

  // Verificar se está autenticado
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return false;
    }
  }

  // Atualizar usuário
  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        throw new Error('Usuário não encontrado');
      }

      // Atualizar dados salvos se for o usuário atual
      const currentUser = await this.getCurrentUser();
      if (currentUser?.id === userId) {
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }

      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }
}