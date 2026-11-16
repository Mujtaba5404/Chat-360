import { createCollection } from '../../lib/store';
import { users } from '../../mocks/users';

export const usersStore = createCollection(users, 'u');

export const ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'agent', label: 'Agent' },
  { value: 'viewer', label: 'Viewer' },
];

export const roleLabel = (role) => ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;

/** Active agents that can be assigned conversations. */
export const useAssignableAgents = () => {
  const users = usersStore.useItems();
  return users.filter((user) => user.status === 'active' && user.role !== 'viewer');
};
