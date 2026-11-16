import { Center, Group, Loader, Text } from '@mantine/core';

export default function LoadingState({ label = 'Loading…' }) {
  return (
    <Center h="100%" mih={240} role="status">
      <Group gap="sm">
        <Loader size="xs" />
        <Text size="sm" c="dimmed">
          {label}
        </Text>
      </Group>
    </Center>
  );
}
