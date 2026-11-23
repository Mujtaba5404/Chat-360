import { Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useLocalStorage } from "@mantine/hooks";
import { IconArrowRight, IconLock, IconMail } from "@tabler/icons-react";
import { Navigate, useNavigate } from "react-router";
import { useLoginMutation } from "src/api/auth";
import { upsertAuthUser } from "src/api/user";
import useFilters from "../../hooks/useFilters";
import { HOME_PATH } from "../../layouts/navigation";
import AuthLayout, { AuthSwitch } from "./AuthLayout";
import { REGISTER_PATHS } from "./registerPaths";
import toAuthUser from "./toAuthUser";

const safeNext = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : HOME_PATH;

const Login = () => {
  const [auth, setAuth] = useLocalStorage({
    key: "auth",
    getInitialValueInEffect: false,
  });
  const navigate = useNavigate();
  const { filters } = useFilters();
  const loginMutation = useLoginMutation();
  const form = useForm({
    initialValues: { email: "", password: "" },
  });

  if (auth?.id) return <Navigate to={safeNext(filters.next)} replace />;

  const handleSubmit = (values) => {
    loginMutation.mutate(values, {
      onSuccess: ({ data }) => {
        const user = toAuthUser(data);
        upsertAuthUser(user);
        setAuth(user);
        navigate(safeNext(filters.next), { replace: true });
      },
    });
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your support workspace to pick up where your team left off."
    >
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Stack gap="md">
          <TextInput
            label="Work email"
            placeholder="you@company.com"
            type="email"
            autoComplete="email"
            size="md"
            leftSection={<IconMail size={16} stroke={1.75} />}
            autoFocus
            {...form.getInputProps("email")}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            size="md"
            leftSection={<IconLock size={16} stroke={1.75} />}
            {...form.getInputProps("password")}
          />
          <Button
            type="submit"
            size="md"
            fullWidth
            loading={loginMutation.isPending}
            rightSection={<IconArrowRight size={16} />}
          >
            Sign in
          </Button>
        </Stack>
      </form>

      <AuthSwitch
        prompt="Don't have an account?"
        to={REGISTER_PATHS.account}
        label="Sign up"
      />
    </AuthLayout>
  );
};

export default Login;
