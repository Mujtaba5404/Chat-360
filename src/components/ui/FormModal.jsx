import { Button, Group, Modal, Stack } from '@mantine/core';

/** Modal with a form body and standard Cancel / Submit footer. */
export default function FormModal({ opened, onClose, title, onSubmit, submitLabel = 'Save', size = 'md', children }) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} size={size}>
      <form onSubmit={onSubmit} noValidate>
        <Stack gap="md">{children}</Stack>
        <Group justify="flex-end" gap="sm" mt="xl">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </Group>
      </form>
    </Modal>
  );
}
