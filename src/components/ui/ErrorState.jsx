import { Button, Center, EmptyState, Group } from '@mantine/core';
import { IconAlertTriangle, IconCompass } from '@tabler/icons-react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router';

/** Route error boundary UI. */
export function ErrorState({ fullPage = false }) {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : (error?.message ?? 'An unexpected error occurred.');

  return (
    <Center h={fullPage ? '100dvh' : '100%'} p="lg">
      <EmptyState
        size="sm"
        withIndicatorBackground
        icon={<IconAlertTriangle size={20} />}
        title="Something went wrong"
        description={message}
      >
        <Group justify="center" gap="sm" mt="md">
          <Button variant="default" onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <Button component="a" href="/chat">
            Go to inbox
          </Button>
        </Group>
      </EmptyState>
    </Center>
  );
}

export function NotFoundState() {
  return (
    <Center h="100%" p="lg">
      <EmptyState
        size="sm"
        withIndicatorBackground
        icon={<IconCompass size={20} />}
        title="Page not found"
        description="The page you're looking for doesn't exist or was moved."
      >
        <Button component={Link} to="/chat" mt="md">
          Back to inbox
        </Button>
      </EmptyState>
    </Center>
  );
}
