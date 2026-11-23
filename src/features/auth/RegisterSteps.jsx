import {
  Anchor,
  Button,
  Group,
  PasswordInput,
  PinInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconArrowRight,
  IconLock,
  IconMail,
  IconUser,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  useResendOtpMutation,
  useSignupMutation,
  useVerifyEmailMutation,
} from "src/api/auth";
import classes from "./Login.module.css";
import toAuthUser from "./toAuthUser";

const RESEND_SECONDS = 60;

export const AccountStep = ({ data, onNext }) => {
  const signupMutation = useSignupMutation();

  const form = useForm({
    initialValues: {
      name: data.name ?? "",
      email: data.email ?? "",
      password: data.password ?? "",
    },
  });

  const handleSubmit = (values) => {
    // Came back with "Change" but kept the same email — the account already exists.
    if (data.user && values.email === data.email) return onNext(values);

    const payload = {
      ...values,
      name: values.name.trim().replace(/\s+/g, " "),
    };

    signupMutation.mutate(payload, {
      onSuccess: ({ data: user }) =>
        onNext({ ...values, user: toAuthUser(user) }),
    });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack gap="md">
        <TextInput
          label="Full name"
          placeholder="Jane Cooper"
          autoComplete="name"
          size="md"
          leftSection={<IconUser size={16} stroke={1.75} />}
          autoFocus
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Work email"
          placeholder="you@company.com"
          type="email"
          autoComplete="email"
          size="md"
          leftSection={<IconMail size={16} stroke={1.75} />}
          {...form.getInputProps("email")}
        />
        <PasswordInput
          label="Password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          size="md"
          leftSection={<IconLock size={16} stroke={1.75} />}
          {...form.getInputProps("password")}
        />
        <Button
          type="submit"
          size="md"
          fullWidth
          loading={signupMutation.isPending}
          rightSection={<IconArrowRight size={16} />}
        >
          Create account
        </Button>
      </Stack>
    </form>
  );
};

export const OtpStep = ({ data, onNext, onBack }) => {
  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendOtpMutation();
  const [code, setCode] = useState("");
  const [wait, setWait] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!wait) return;

    const timer = setTimeout(() => setWait(wait - 1), 1000);

    return () => clearTimeout(timer);
  }, [wait]);

  const resend = () =>
    resendMutation.mutate(undefined, {
      onSuccess: () => {
        setCode("");
        setWait(RESEND_SECONDS);
      },
    });

  const verify = (event) => {
    event.preventDefault();
    verifyMutation.mutate(code, {
      onSuccess: () => onNext({ emailVerified: true }),
      onError: () => setCode(""),
    });
  };

  return (
    <form onSubmit={verify}>
      <Stack gap="md">
        <Text size="sm">
          Code sent to <b>{data.email}</b>{" "}
          <Anchor component="button" type="button" size="sm" onClick={onBack}>
            Change
          </Anchor>
        </Text>

        <PinInput
          autoFocus
          oneTimeCode
          type="number"
          length={6}
          size="md"
          value={code}
          onChange={setCode}
          className={classes.pin}
          aria-label="One-time code"
        />

        <Button
          type="submit"
          size="md"
          fullWidth
          disabled={code.length < 6}
          loading={verifyMutation.isPending}
          rightSection={<IconArrowRight size={16} />}
        >
          Verify email
        </Button>

        <Group gap={4} justify="center">
          <Text size="sm" c="dimmed">
            Didn&apos;t get the code?
          </Text>

          <Button
            variant="subtle"
            size="compact-sm"
            disabled={wait > 0}
            loading={resendMutation.isPending}
            onClick={resend}
          >
            {wait ? `Resend in ${wait}s` : "Resend code"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
