import { Group, Kbd, Modal, Stack, Text } from "@mantine/core";
import { useOs } from "@mantine/hooks";

const SHORTCUTS = [
  {
    group: "General",
    items: [
      ["mod", "K", "Search & quick actions"],
      ["[", "Collapse sidebar"],
      ["?", "Show keyboard shortcuts"],
    ],
  },
  {
    group: "Inbox",
    items: [
      ["J", "Next conversation"],
      ["K", "Previous conversation"],
      ["Enter", "Send reply"],
      ["Shift", "Enter", "New line"],
      ["/", "Insert canned response"],
    ],
  },
];

const ShortcutsModal = ({ opened, onClose }) => {
  const os = useOs();
  const mod = os === "macos" || os === "ios" ? "⌘" : "Ctrl";

  return (
    <Modal opened={opened} onClose={onClose} title="Keyboard shortcuts" size="sm">
      <Stack gap="lg">
        {SHORTCUTS.map(({ group, items }) => (
          <div key={group}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="xs">{group}</Text>
            <Stack gap="xs">
              {items.map((item) => {
                const keys = item
                  .slice(0, -1)
                  .map((key) => (key === "mod" ? mod : key));
                const label = item.at(-1);
                return (
                  <Group key={label} justify="space-between">
                    <Text size="sm">{label}</Text>
                    <Group gap={4}>
                      {keys.map((key) => (
                        <Kbd key={key}>{key}</Kbd>
                      ))}
                    </Group>
                  </Group>
                );
              })}
            </Stack>
          </div>
        ))}
      </Stack>
    </Modal>
  );
};

export default ShortcutsModal;