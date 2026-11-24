import { upperFirst } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showNotification } from "src/notifications/showNotification";
import api, { getActiveWorkspace, resourceUrl } from ".";

// Websites of the workspace in the URL — /:slug/websites, or admin/:slug/websites for a
// super admin.

export const useGetAllWebsitesQuery = () => {
  return useQuery({
    queryKey: ["websites", getActiveWorkspace(), "all"],
    queryFn: () =>
      api.get(resourceUrl("websites/all")).then(({ data }) => data),
  });
};

export const useCreateWebsiteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => api.post(resourceUrl("websites"), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites"] });
      showNotification({
        title: upperFirst("website successfully added"),
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

export const useUpdateWebsiteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      api.patch(resourceUrl(`websites/${id}`), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites"] });
      showNotification({
        title: upperFirst("website successfully updated"),
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

export const useDeleteWebsiteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(resourceUrl(`websites/${id}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites"] });
      showNotification({
        title: upperFirst("website successfully deleted"),
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
