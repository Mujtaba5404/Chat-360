import { upperFirst } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import { showNotification } from "src/notifications/showNotification";
import api from ".";

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: (payload) => api.post("auth/signup", payload),
    onSuccess: () =>
      showNotification({
        title: upperFirst("account created, please verify your email"),
        type: "success",
      }),
    onError: (error) =>
      showNotification({
        title: upperFirst(error.response?.data?.message || "error"),
        type: "error",
      }),
  });
};

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: (otp) => api.post("auth/verifyEmail", { otp }),
    onSuccess: () =>
      showNotification({
        title: upperFirst("email successfully verified"),
        type: "success",
      }),
    onError: (error) =>
      showNotification({
        title: upperFirst(error.response?.data?.message || "error"),
        type: "error",
      }),
  });
};

export const useResendOtpMutation = () => {
  return useMutation({
    mutationFn: () => api.get("auth/resendOtp"),
    onSuccess: () =>
      showNotification({
        title: upperFirst("a new code was sent to your email"),
        type: "success",
      }),
    onError: (error) =>
      showNotification({
        title: upperFirst(error.response?.data?.message || "error"),
        type: "error",
      }),
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (payload) => api.post("auth/login", payload),
    onSuccess: () =>
      showNotification({
        title: upperFirst("successfully logged in!"),
        type: "success",
      }),
    onError: (error) =>
      showNotification({
        title: upperFirst(error.response?.data?.message || "error"),
        type: "error",
      }),
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: () => api.post("auth/logout"),
    onSuccess: () =>
      showNotification({
        title: upperFirst("successfully logged out!"),
        type: "success",
      }),
    onError: (error) =>
      showNotification({
        title: upperFirst(error.response?.data?.message || "error"),
        type: "error",
      }),
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: (payload) => api.patch("auth/changePassword", payload),
    onSuccess: () =>
      showNotification({
        title: upperFirst("password successfully changed"),
        type: "success",
      }),
    onError: (error) =>
      showNotification({
        title: upperFirst(error.response?.data?.message || "error"),
        type: "error",
      }),
  });
};
