import { useMutation } from 'react-query';
import { useApiClient } from 'hooks/useApiClient';

export const userKeys = {
  all: ['users'] as const,
  list: () => [...userKeys.all, 'list'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};

interface RoleInput {
  userId: string;
  roleId: string;
}
export const useUserAssignRole = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: RoleInput) =>
      (await apiClient.user.userControllerAssignRole(userId, roleId)).data,
  });
};

export const useUserRemoveRole = () => {
  const apiClient = useApiClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: RoleInput) =>
      (await apiClient.user.userControllerRemoveRole(userId, roleId)).data,
  });
};