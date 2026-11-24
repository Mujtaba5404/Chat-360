import { upperFirst } from "@mantine/hooks";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { showNotification } from "src/notifications/showNotification";
import api from ".";
import { toWorkspaceFormData } from "./workspaceFormData";

// Super admin only. These routes are platform-wide, never workspace-scoped.

export const useGetAdminWorkspacesQuery = (params) => {
  return useQuery({
    queryKey: ["admin", "workspaces", params],
    queryFn: () =>
      api.get("admin/workspaces", { params }).then(({ data }) => data),
    placeholderData: keepPreviousData,
  });
};

export const useGetAllAdminWorkspacesQuery = (options = {}) => {
  return useQuery({
    queryKey: ["admin", "workspaces", "all"],
    queryFn: () => api.get("admin/workspaces/all").then(({ data }) => data),
    ...options,
  });
};

// Workspaces are sent as multipart (they may carry an image). See toWorkspaceFormData.
export const useCreateWorkspaceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payload, image }) =>
      api.post(
        "admin/workspaces",
        await toWorkspaceFormData(payload, { image }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "workspaces"] });
      showNotification({
        title: upperFirst("workspace successfully created"),
        type: "success",
      });
    },
    onError: (error) =>
      showNotification({
        title: upperFirst(error.response?.data?.message || "error"),
        type: "error",
      }),
  });
};

export const useUpdateAdminWorkspaceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payload, image, workspace }) =>
      api.patch(
        `admin/workspaces/${workspace._id}`,
        await toWorkspaceFormData(payload, { image, workspace }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      showNotification({
        title: upperFirst("workspace successfully updated"),
        type: "success",
      });
    },
    onError: (error) =>
      showNotification({
        title: upperFirst(
          error.response?.data?.message || error.message || "error",
        ),
        type: "error",
      }),
  });
};

export const useGetAdminUsersQuery = (params) => {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => api.get("admin/users", { params }).then(({ data }) => data),
    placeholderData: keepPreviousData,
  });
};

export const useGetAllAdminUsersQuery = () => {
  return useQuery({
    queryKey: ["admin", "users", "all"],
    queryFn: () => api.get("admin/users/all").then(({ data }) => data),
  });
};

export const useCreateAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => api.post("admin/users", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      showNotification({
        title: upperFirst("user successfully created"),
        type: "success",
      });
    },
    onError: (error) =>
      showNotification({
        title: upperFirst(error.response?.data?.message || "error"),
        type: "error",
      }),
  });
};

export const useUpdateAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) => api.patch(`admin/users/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showNotification({
        title: upperFirst("user successfully updated"),
        type: "success",
      });
    },
    onError: (error) =>
      showNotification({
        title: upperFirst(error.response?.data?.message || "error"),
        type: "error",
      }),
  });
};

export const useDeleteAdminUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showNotification({
        title: upperFirst("user successfully deleted"),
        type: "success",
      });
    },
    onError: (error) =>
      showNotification({
        title: upperFirst(error.response?.data?.message || "error"),
        type: "error",
      }),
  });
};

export const useDeleteWorkspaceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(`admin/workspaces/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "workspaces"] });
      showNotification({
        title: upperFirst("workspace successfully deleted"),
        type: "success",
      });
    },
    onError: (error) =>
      showNotification({
        title: upperFirst(error.response?.data?.message || "error"),
        type: "error",
      }),
  });
};
