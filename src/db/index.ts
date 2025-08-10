import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import CryptoJS from 'crypto-js';

const expoDb = openDatabaseSync('defesa-app.db');
export const db = drizzle(expoDb, { schema });

// Função para inicializar o banco de dados
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Criar usuário padrão se não existir
    try {
      const existingUser = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.login, 'admin'))
        .get();

      if (!existingUser) {
        // Hash da senha 'admin123' usando SHA256
        const hashedPassword = CryptoJS.SHA256('admin123').toString();
        
        await db.insert(schema.users).values({
          id: 'default-user-id',
          name: 'Administrador',
          login: 'admin',
          password: hashedPassword,
        });
        
        console.log('Usuario padrão criado: login=admin, senha=admin123');
      }
    } catch (error) {
      console.log('Erro ao criar usuário padrão (pode já existir):', error);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}