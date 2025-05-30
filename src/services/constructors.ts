import axiosInstance from '../config/axios';
import { API_URLS } from '../config/api';
import { authService } from './auth';

export interface Constructor {
  id: number;
  constructorId: string;
  name: string;
  nationality: string;
  url?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConstructorRequest {
  constructorId: string;
  name: string;
  nationality: string;
  url?: string;
}

export interface UpdateConstructorRequest {
  name?: string;
  nationality?: string;
  url?: string;
  active?: boolean;
}

export interface ConstructorStats {
  totalConstructors: number;
  activeConstructors: number;
  inactiveConstructors: number;
  nationalitiesCount: number;
}

class ConstructorsService {
  private readonly baseUrl = API_URLS.CONSTRUCTORS;

  // ========== BUSCAR CONSTRUTORES ==========

  async getAllConstructors(): Promise<Constructor[]> {
    try {
      const response = await axiosInstance.get(this.baseUrl);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao buscar construtores';
      console.error('Erro ao buscar todos os construtores:', error);
      throw new Error(errorMessage);
    }
  }

  async getActiveConstructors(): Promise<Constructor[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/active`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao buscar construtores ativos';
      console.error('Erro ao buscar construtores ativos:', error);
      throw new Error(errorMessage);
    }
  }

  async getConstructorById(id: number): Promise<Constructor> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Construtor não encontrado';
      console.error(`Erro ao buscar construtor ${id}:`, error);
      throw new Error(errorMessage);
    }
  }

  async getConstructorByConstructorId(constructorId: string): Promise<Constructor> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/constructor-id/${constructorId}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Construtor não encontrado';
      console.error(`Erro ao buscar construtor por constructorId ${constructorId}:`, error);
      throw new Error(errorMessage);
    }
  }

  async searchConstructorsByName(name: string): Promise<Constructor[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/search?name=${encodeURIComponent(name)}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao buscar construtores por nome';
      console.error(`Erro ao buscar construtores por nome ${name}:`, error);
      throw new Error(errorMessage);
    }
  }

  async getConstructorsByNationality(nationality: string): Promise<Constructor[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/nationality/${nationality}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao buscar construtores por nacionalidade';
      console.error(`Erro ao buscar construtores por nacionalidade ${nationality}:`, error);
      throw new Error(errorMessage);
    }
  }

  // ========== OPERAÇÕES ADMINISTRATIVAS (SIMULADAS) ==========
  // Nota: Estas operações são simuladas localmente até que os endpoints administrativos sejam implementados no backend

  async createConstructor(request: CreateConstructorRequest): Promise<Constructor> {
    try {
      // TODO: Implementar endpoint no backend
      // Por enquanto, simular criação
      const newConstructor: Constructor = {
        id: Date.now(),
        constructorId: request.constructorId,
        name: request.name,
        nationality: request.nationality,
        url: request.url,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Simulando criação de construtor:', newConstructor);
      return newConstructor;
    } catch (error) {
      console.error('Erro ao criar construtor:', error);
      throw error;
    }
  }

  async updateConstructor(id: number, request: UpdateConstructorRequest): Promise<Constructor> {
    try {
      // TODO: Implementar endpoint no backend
      // Por enquanto, buscar o construtor atual e simular atualização
      const currentConstructor = await this.getConstructorById(id);
      
      const updatedConstructor: Constructor = {
        ...currentConstructor,
        name: request.name ?? currentConstructor.name,
        nationality: request.nationality ?? currentConstructor.nationality,
        url: request.url ?? currentConstructor.url,
        active: request.active ?? currentConstructor.active,
        updatedAt: new Date().toISOString()
      };

      console.log('Simulando atualização de construtor:', updatedConstructor);
      return updatedConstructor;
    } catch (error) {
      console.error(`Erro ao atualizar construtor ${id}:`, error);
      throw error;
    }
  }

  async deleteConstructor(id: number): Promise<void> {
    try {
      // TODO: Implementar endpoint no backend
      console.log(`Simulando exclusão de construtor ${id}`);
    } catch (error) {
      console.error(`Erro ao deletar construtor ${id}:`, error);
      throw error;
    }
  }

  async activateConstructor(id: number): Promise<Constructor> {
    try {
      // TODO: Implementar endpoint no backend
      return await this.updateConstructor(id, { active: true });
    } catch (error) {
      console.error(`Erro ao ativar construtor ${id}:`, error);
      throw error;
    }
  }

  async deactivateConstructor(id: number): Promise<Constructor> {
    try {
      // TODO: Implementar endpoint no backend
      return await this.updateConstructor(id, { active: false });
    } catch (error) {
      console.error(`Erro ao inativar construtor ${id}:`, error);
      throw error;
    }
  }

  // ========== ESTATÍSTICAS ==========

  async getConstructorStats(): Promise<ConstructorStats> {
    try {
      const allConstructors = await this.getAllConstructors();
      const activeConstructors = allConstructors.filter(constructor => constructor.active);
      const inactiveConstructors = allConstructors.filter(constructor => !constructor.active);
      const nationalities = new Set(allConstructors.map(constructor => constructor.nationality));

      return {
        totalConstructors: allConstructors.length,
        activeConstructors: activeConstructors.length,
        inactiveConstructors: inactiveConstructors.length,
        nationalitiesCount: nationalities.size,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de construtores:', error);
      throw error;
    }
  }

  // ========== UTILITÁRIOS ==========

  formatConstructorName(constructor: Constructor): string {
    return constructor.name;
  }

  generateConstructorId(name: string): string {
    // Gera um constructorId baseado no nome (ex: "red_bull")
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '_') // Substitui espaços por underscore
      .replace(/_+/g, '_') // Remove underscores duplicados
      .replace(/^_|_$/g, ''); // Remove underscores do início e fim
  }

  getConstructorsByStatus(constructors: Constructor[], active: boolean): Constructor[] {
    return constructors.filter(constructor => constructor.active === active);
  }

  searchConstructors(constructors: Constructor[], searchTerm: string): Constructor[] {
    const term = searchTerm.toLowerCase();
    return constructors.filter(constructor =>
      constructor.name.toLowerCase().includes(term) ||
      constructor.nationality.toLowerCase().includes(term) ||
      constructor.constructorId.toLowerCase().includes(term)
    );
  }

  sortConstructorsByName(constructors: Constructor[]): Constructor[] {
    return [...constructors].sort((a, b) => a.name.localeCompare(b.name));
  }

  sortConstructorsByNationality(constructors: Constructor[]): Constructor[] {
    return [...constructors].sort((a, b) => a.nationality.localeCompare(b.nationality));
  }

  getUniqueNationalities(constructors: Constructor[]): string[] {
    const nationalities = new Set(constructors.map(c => c.nationality));
    return Array.from(nationalities).sort();
  }

  // ========== VALIDAÇÕES ==========

  validateConstructorData(data: CreateConstructorRequest | UpdateConstructorRequest): string[] {
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

    if ('nationality' in data && data.nationality !== undefined) {
      if (!data.nationality.trim()) {
        errors.push('Nacionalidade é obrigatória');
      }
    }

    if ('constructorId' in data && data.constructorId !== undefined) {
      if (!data.constructorId.trim()) {
        errors.push('Constructor ID é obrigatório');
      } else if (!/^[a-z0-9_]+$/.test(data.constructorId)) {
        errors.push('Constructor ID deve conter apenas letras minúsculas, números e underscores');
      }
    }

    if ('url' in data && data.url !== undefined && data.url.trim()) {
      try {
        new URL(data.url);
      } catch {
        errors.push('URL deve ser válida');
      }
    }

    return errors;
  }

  isValidConstructorId(constructorId: string): boolean {
    return /^[a-z0-9_]+$/.test(constructorId) && constructorId.length >= 2;
  }
}

export const constructorsService = new ConstructorsService(); 