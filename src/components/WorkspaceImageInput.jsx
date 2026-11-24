import { Button, FileButton, Group, Input, Stack, Text } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { useEffect, useMemo } from "react";
import WORKSPACE from "../constants/WORKSPACE";
import formatBytes from "../utils/formatBytes";
import WorkspaceAvatar from "./WorkspaceAvatar";

const LIMIT = formatBytes(WORKSPACE.IMAGE_MAX_BYTES);

/**
 * Picks a new workspace image (`value` is the picked File, or null to keep the
 * current one). Shows the pick, or the saved image, as the workspace avatar.
 */
const WorkspaceImageInput = ({
  workspace,
  title,
  color,
  value,
  onChange,
  error,
  disabled,
}) => {
  const preview = useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value],
  );
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  // The avatar follows the unsaved name and color too.
  const shown = {
    ...workspace,
    title: title || workspace?.title,
    settings: { ...workspace?.settings, color },
  };

  return (
    <Input.Wrapper label="Workspace image" error={error}>
      <Group gap="md" mt={6} wrap="nowrap">
        <WorkspaceAvatar workspace={shown} src={preview} size={56} />
        <Stack gap={4}>
          <Group gap="xs">
            <FileButton
              accept={WORKSPACE.IMAGE_TYPES.join(",")}
              onChange={(file) => file && onChange(file)}
              disabled={disabled}
            >
              {(props) => (
                <Button
                  {...props}
                  variant="default"
                  size="xs"
                  leftSection={<IconUpload size={14} />}
                  disabled={disabled}
                >
                  {workspace?.image || value ? "Change image" : "Upload image"}
                </Button>
              )}
            </FileButton>
            {value && (
              <Button
                variant="subtle"
                color="gray"
                size="xs"
                onClick={() => onChange(null)}
                disabled={disabled}
              >
                {workspace?.image ? "Keep current" : "Remove"}
              </Button>
            )}
          </Group>
          <Text size="xs" c="dimmed">
            {value
              ? `${value.name} · ${formatBytes(value.size)}`
              : `PNG, JPG, WebP or GIF, up to ${LIMIT}. Square works best.`}
          </Text>
        </Stack>
      </Group>
    </Input.Wrapper>
  );
};

export default WorkspaceImageInput;
