export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Team {
  id: number;
  name: string;
  members: User[];
  isActive?: boolean;
}

export const mockUsers: User[] = [
  { id: 1, name: 'João Silva', email: 'joao@email.com' },
  { id: 2, name: 'Maria Santos', email: 'maria@email.com' },
  { id: 3, name: 'Pedro Oliveira', email: 'pedro@email.com' },
  { id: 4, name: 'Ana Costa', email: 'ana@email.com' },
];

export const initialTeams: Team[] = [
  {
    id: 1,
    name: 'Red Bull Racing',
    members: [mockUsers[0], mockUsers[1]],
    isActive: true,
  },
  {
    id: 2,
    name: 'Ferrari',
    members: [mockUsers[2], mockUsers[3]],
    isActive: true,
  },
]; 