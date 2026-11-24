import { upperFirst } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showNotification } from "src/notifications/showNotification";
import api, { getActiveWorkspace, resourceUrl } from ".";

// Tags of the workspace in the URL — /:slug/tags, or admin/:slug/tags for a super admin.

export const useGetAllTagsQuery = () => {
  return useQuery({
    queryKey: ["tags", getActiveWorkspace(), "all"],
    queryFn: () => api.get(resourceUrl("tags/all")).then(({ data }) => data),
  });
};

export const useCreateTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      api.post(resourceUrl("tags"), payload).then(({ data }) => data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      showNotification({
        title: upperFirst("tag successfully created"),
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

export const useUpdateTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      api.patch(resourceUrl(`tags/${id}`), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      showNotification({
        title: upperFirst("tag successfully updated"),
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

export const useDeleteTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(resourceUrl(`tags/${id}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      showNotification({
        title: upperFirst("tag successfully deleted"),
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
