import { upperFirst } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showNotification } from "src/notifications/showNotification";
import api, { getActiveWorkspace, resourceUrl } from ".";

// Widgets of the workspace in the URL — /:slug/widgets, or admin/:slug/widgets for a
// super admin. Each widget belongs to one website and has its own public key.

export const useGetAllWidgetsQuery = () => {
  return useQuery({
    queryKey: ["widgets", getActiveWorkspace(), "all"],
    queryFn: () => api.get(resourceUrl("widgets/all")).then(({ data }) => data),
  });
};

export const useGetWidgetQuery = (id) => {
  return useQuery({
    queryKey: ["widgets", getActiveWorkspace(), id],
    queryFn: () =>
      api.get(resourceUrl(`widgets/${id}`)).then(({ data }) => data),
    enabled: Boolean(id) && id !== "new",
    retry: false,
  });
};

export const useCreateWidgetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      api.post(resourceUrl("widgets"), payload).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets"] });
      showNotification({
        title: upperFirst("widget successfully created"),
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

export const useUpdateWidgetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      api.patch(resourceUrl(`widgets/${id}`), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets"] });
      showNotification({
        title: upperFirst("widget successfully updated"),
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

export const useDeleteWidgetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(resourceUrl(`widgets/${id}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["widgets"] });
      showNotification({
        title: upperFirst("widget successfully deleted"),
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
