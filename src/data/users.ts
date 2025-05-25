export interface User {
  id: number;
  name: string;
  email: string;
  isActive?: boolean;
}

export const initialUsers: User[] = [
  { id: 1, name: 'João Silva', email: 'joao@email.com', isActive: true },
  { id: 2, name: 'Maria Santos', email: 'maria@email.com', isActive: true },
  { id: 3, name: 'Pedro Oliveira', email: 'pedro@email.com', isActive: true },
  { id: 4, name: 'Ana Costa', email: 'ana@email.com', isActive: true },
]; 