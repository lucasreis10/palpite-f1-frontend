import { API_URLS } from '../config/api';

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
      const response = await fetch(`${this.baseUrl}`);
      if (response.ok) {
        const users = await response.json();
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
      }
      throw new Error('Erro ao buscar usuários');
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
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
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (response.ok) {
        const user = await response.json();
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'USER',
          active: user.active !== false,
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString()
        };
      }
      throw new Error('Usuário não encontrado');
    } catch (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      throw error;
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

  // ========== OPERAÇÕES ADMINISTRATIVAS (SIMULADAS) ==========
  // Nota: Estas operações são simuladas localmente até que os endpoints administrativos sejam implementados no backend

  async createUser(request: CreateUserRequest): Promise<User> {
    try {
      // TODO: Implementar endpoint no backend
      // Por enquanto, simular criação
      const newUser: User = {
        id: Date.now(),
        name: request.name,
        email: request.email,
        role: request.role,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Simulando criação de usuário:', newUser);
      return newUser;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async updateUser(id: number, request: UpdateUserRequest): Promise<User> {
    try {
      // TODO: Implementar endpoint no backend
      // Por enquanto, buscar o usuário atual e simular atualização
      const currentUser = await this.getUserById(id);
      
      const updatedUser: User = {
        ...currentUser,
        name: request.name ?? currentUser.name,
        email: request.email ?? currentUser.email,
        role: request.role ?? currentUser.role,
        active: request.active ?? currentUser.active,
        updatedAt: new Date().toISOString()
      };

      console.log('Simulando atualização de usuário:', updatedUser);
      return updatedUser;
    } catch (error) {
      console.error(`Erro ao atualizar usuário ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      // TODO: Implementar endpoint no backend
      console.log(`Simulando exclusão de usuário ${id}`);
    } catch (error) {
      console.error(`Erro ao deletar usuário ${id}:`, error);
      throw error;
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
      const allUsers = await this.getAllUsers();
      const activeUsers = allUsers.filter(user => user.active);
      const inactiveUsers = allUsers.filter(user => !user.active);
      const adminUsers = allUsers.filter(user => user.role === 'ADMIN');
      const regularUsers = allUsers.filter(user => user.role === 'USER');

      return {
        totalUsers: allUsers.length,
        activeUsers: activeUsers.length,
        inactiveUsers: inactiveUsers.length,
        adminUsers: adminUsers.length,
        regularUsers: regularUsers.length,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de usuários:', error);
      throw error;
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