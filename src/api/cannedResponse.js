import { upperFirst } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showNotification } from "src/notifications/showNotification";
import api, { getActiveWorkspace, resourceUrl } from ".";
import { toCannedPayload, toCannedValues } from "../constants/CANNED_RESPONSE";

// Canned responses of the workspace in the URL — /:slug/canned-responses, or
// admin/:slug/canned-responses for a super admin.

export const useGetAllCannedResponsesQuery = () => {
  return useQuery({
    queryKey: ["canned-responses", getActiveWorkspace(), "all"],
    queryFn: () =>
      api.get(resourceUrl("canned-responses/all")).then(({ data }) => data),
  });
};

export const useCreateCannedResponseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => api.post(resourceUrl("canned-responses"), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canned-responses"] });
      showNotification({
        title: upperFirst("canned response successfully created"),
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

export const useUpdateCannedResponseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      api.patch(resourceUrl(`canned-responses/${id}`), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canned-responses"] });
      showNotification({
        title: upperFirst("canned response successfully updated"),
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

export const useDeleteCannedResponseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => api.delete(resourceUrl(`canned-responses/${id}`)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["canned-responses"] });
      showNotification({
        title: upperFirst("canned response successfully deleted"),
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

// Counts an insert from the chat composer. Silent: it must never interrupt a reply.
// An update replaces the whole record, so the saved fields go along with the count.
export const useRecordCannedUsageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (response) =>
      api.patch(resourceUrl(`canned-responses/${response._id}`), {
        ...toCannedPayload(toCannedValues(response)),
        usageCount: (response.usageCount ?? 0) + 1,
        lastUsedAt: new Date().toISOString(),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["canned-responses"] }),
  });
};
