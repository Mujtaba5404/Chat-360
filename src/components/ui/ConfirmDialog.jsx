import { Button, Group, Modal, Text } from '@mantine/core';

export default function ConfirmDialog({ opened, onClose, onConfirm, title, message, confirmLabel = 'Delete', color = 'red' }) {
  const confirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="sm">
      <Text size="sm" c="dimmed">
        {message}
      </Text>
      <Group justify="flex-end" gap="sm" mt="xl">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button color={color} onClick={confirm} data-autofocus>
          {confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
}
