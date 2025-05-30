import axiosInstance from '../config/axios';
import { API_URLS } from '../config/api';
import { authService } from './auth';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'USER';
  active?: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  regularUsers: number;
}

class UsersService {
  private readonly baseUrl = API_URLS.USERS;

  // ========== BUSCAR USUÁRIOS ==========

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axiosInstance.get(this.baseUrl);
      const users = response.data;
      
      // Mapear para incluir campos adicionais com valores padrão
      return users.map((user: { id: number; name: string; email: string; role?: string; active?: boolean; createdAt?: string; updatedAt?: string }) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'USER',
        active: user.active !== false,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString()
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao buscar usuários';
      console.error('Erro ao buscar usuários:', error);
      throw new Error(errorMessage);
    }
  }

  async getActiveUsers(): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter(user => user.active);
    } catch (error) {
      console.error('Erro ao buscar usuários ativos:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
      const user = response.data;
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'USER',
        active: user.active !== false,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString()
      };
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Usuário não encontrado';
      console.error(`Erro ao buscar usuário ${id}:`, error);
      throw new Error(errorMessage);
    }
  }

  async getUsersByRole(role: 'ADMIN' | 'USER'): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter(user => user.role === role);
    } catch (error) {
      console.error(`Erro ao buscar usuários por role ${role}:`, error);
      throw error;
    }
  }

  async searchUsersByName(name: string): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      const term = name.toLowerCase();
      return allUsers.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error(`Erro ao buscar usuários por nome ${name}:`, error);
      throw error;
    }
  }

  // ========== OPERAÇÕES ADMINISTRATIVAS ==========

  async createUser(request: CreateUserRequest): Promise<User> {
    try {
      console.log('Criando usuário:', request);
      
      const response = await axiosInstance.post(this.baseUrl, request);
      const userData = response.data;
      
      console.log('Usuário criado com sucesso:', userData);
      return userData;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao criar usuário';
      console.error('Erro ao criar usuário:', error);
      throw new Error(errorMessage);
    }
  }

  async updateUser(id: number, request: UpdateUserRequest): Promise<User> {
    try {
      console.log('Atualizando usuário:', id, request);
      
      const response = await axiosInstance.put(`${this.baseUrl}/${id}`, request);
      const userData = response.data;
      
      console.log('Usuário atualizado com sucesso:', userData);
      return userData;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao atualizar usuário';
      console.error(`Erro ao atualizar usuário ${id}:`, error);
      throw new Error(errorMessage);
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      console.log('Deletando usuário:', id);
      
      await axiosInstance.delete(`${this.baseUrl}/${id}`);
      
      console.log('Usuário deletado com sucesso:', id);
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao deletar usuário';
      console.error(`Erro ao deletar usuário ${id}:`, error);
      throw new Error(errorMessage);
    }
  }

  async activateUser(id: number): Promise<User> {
    try {
      return await this.updateUser(id, { active: true });
    } catch (error) {
      console.error(`Erro ao ativar usuário ${id}:`, error);
      throw error;
    }
  }

  async deactivateUser(id: number): Promise<User> {
    try {
      return await this.updateUser(id, { active: false });
    } catch (error) {
      console.error(`Erro ao inativar usuário ${id}:`, error);
      throw error;
    }
  }

  async changeUserRole(id: number, role: 'ADMIN' | 'USER'): Promise<User> {
    try {
      return await this.updateUser(id, { role });
    } catch (error) {
      console.error(`Erro ao alterar role do usuário ${id}:`, error);
      throw error;
    }
  }

  // ========== ESTATÍSTICAS ==========

  async getUserStats(): Promise<UserStats> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/stats`);
      const backendStats = response.data;
      
      // Mapear a resposta do backend para nossa interface
      // O backend retorna { total, active }, vamos calcular o resto localmente
      const allUsers = await this.getAllUsers();
      const adminUsers = allUsers.filter(user => user.role === 'ADMIN');
      const regularUsers = allUsers.filter(user => user.role === 'USER');
      
      return {
        totalUsers: backendStats.total,
        activeUsers: backendStats.active,
        inactiveUsers: backendStats.total - backendStats.active,
        adminUsers: adminUsers.length,
        regularUsers: regularUsers.length,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao buscar estatísticas de usuários';
      console.error('Erro ao buscar estatísticas de usuários:', error);
      throw new Error(errorMessage);
    }
  }

  // ========== UTILITÁRIOS ==========

  formatUserName(user: User): string {
    return user.name;
  }

  formatUserRole(role: string): string {
    return role === 'ADMIN' ? 'Administrador' : 'Usuário';
  }

  getUsersByStatus(users: User[], active: boolean): User[] {
    return users.filter(user => user.active === active);
  }

  searchUsers(users: User[], searchTerm: string): User[] {
    const term = searchTerm.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }

  sortUsersByName(users: User[]): User[] {
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
  }

  sortUsersByEmail(users: User[]): User[] {
    return [...users].sort((a, b) => a.email.localeCompare(b.email));
  }

  sortUsersByCreatedAt(users: User[]): User[] {
    return [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ========== VALIDAÇÕES ==========

  validateUserData(data: CreateUserRequest | UpdateUserRequest): string[] {
    const errors: string[] = [];

    if ('name' in data && data.name !== undefined) {
      if (!data.name.trim()) {
        errors.push('Nome é obrigatório');
      } else if (data.name.length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
      } else if (data.name.length > 100) {
        errors.push('Nome deve ter no máximo 100 caracteres');
      }
    }

    if ('email' in data && data.email !== undefined) {
      if (!data.email.trim()) {
        errors.push('Email é obrigatório');
      } else if (!this.isValidEmail(data.email)) {
        errors.push('Email deve ter um formato válido');
      }
    }

    if ('password' in data && data.password !== undefined) {
      if (!data.password.trim()) {
        errors.push('Senha é obrigatória');
      } else if (data.password.length < 6) {
        errors.push('Senha deve ter pelo menos 6 caracteres');
      }
    }

    return errors;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidUserName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 100;
  }
}

export const usersService = new UsersService(); 