import { Alert, Button, Checkbox, Divider, Group, PasswordInput, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconArrowRight, IconLock, IconMail, IconSparkles } from '@tabler/icons-react';
import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { DEMO_PASSWORD, isAuthenticated, signIn } from '../../app/session';
import Logo from '../../components/ui/Logo';
import { rules } from '../../lib/validation';
import LoginShowcase from './components/LoginShowcase';
import classes from './LoginPage.module.css';

const DEMO_EMAIL = 'sarah@acme.io';
const YEAR = new Date().getFullYear();

/** Only allow in-app redirects after sign-in. */
const safeNext = (value) => (value?.startsWith('/') && !value.startsWith('//') ? value : '/chat');

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm({
    initialValues: { email: '', password: '', remember: true },
    validate: { email: rules.email, password: rules.required('Password') },
  });

  if (isAuthenticated()) return <Navigate to={safeNext(params.get('next'))} replace />;

  const submit = form.onSubmit(async (values) => {
    setError(null);
    setSubmitting(true);
    try {
      const user = await signIn(values);
      notifications.show({ message: `Welcome back, ${user.name.split(' ')[0]}` });
      navigate(safeNext(params.get('next')), { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  });

  const fillDemo = () => {
    form.setValues({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
    setError(null);
  };

  return (
    <div className={classes.page}>
      <main className={classes.formSide}>
        <header className={classes.top}>
          <Group gap="sm">
            <Logo size={30} />
            <Text fw={600} size="md">
              Chat Model
            </Text>
          </Group>
          {/* <ThemeSwitcher withLabels={false} /> */}
        </header>

        <div className={classes.formWrap}>
          <h1 className={classes.title}>Welcome back</h1>
          <Text c="dimmed" size="sm" mb="xl">
            Sign in to your support workspace to pick up where your team left off.
          </Text>

          <form onSubmit={submit} noValidate>
            <Stack gap="md">
              {error && (
                <Alert color="red" variant="light" icon={<IconAlertCircle size={16} />} py="xs">
                  <Text size="sm">{error}</Text>
                </Alert>
              )}
              <TextInput
                label="Work email"
                placeholder="you@company.com"
                type="email"
                autoComplete="email"
                size="md"
                leftSection={<IconMail size={16} stroke={1.75} />}
                autoFocus
                {...form.getInputProps('email')}
              />
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                autoComplete="current-password"
                size="md"
                leftSection={<IconLock size={16} stroke={1.75} />}
                {...form.getInputProps('password')}
              />
              <Checkbox label="Keep me signed in on this device" size="sm" {...form.getInputProps('remember', { type: 'checkbox' })} />
              <Button type="submit" size="md" fullWidth loading={submitting} rightSection={<IconArrowRight size={16} />}>
                Sign in
              </Button>
            </Stack>
          </form>

          <Divider label="Exploring the product?" labelPosition="center" my="lg" />

          <UnstyledButton className={classes.demo} onClick={fillDemo}>
            <span className={classes.demoIcon}>
              <IconSparkles size={16} stroke={1.75} />
            </span>
            <span className={classes.demoText}>
              <Text size="sm" fw={500}>
                Use the demo workspace
              </Text>
              <Text size="xs" c="dimmed" ff="monospace">
                {DEMO_EMAIL} · {DEMO_PASSWORD}
              </Text>
            </span>
            <IconArrowRight size={16} className={classes.demoArrow} />
          </UnstyledButton>
        </div>

        <footer className={classes.bottom}>
          <Text size="xs" c="dimmed">
            © {YEAR} Chat Model
          </Text>
          <Text size="xs" c="dimmed">
            Live chat & customer support platform
          </Text>
        </footer>
      </main>

      <div className={classes.showcaseSide}>
        <LoginShowcase />
      </div>
    </div>
  );
}
