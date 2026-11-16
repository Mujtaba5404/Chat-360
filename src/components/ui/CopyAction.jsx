import { ActionIcon, Button, CopyButton, Tooltip } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';

/** Copy-to-clipboard as an icon button (default) or a labeled button. */
export default function CopyAction({ value, label = 'Copy', withLabel = false }) {
  return (
    <CopyButton value={value} timeout={1600}>
      {({ copied, copy }) => {
        const Icon = copied ? IconCheck : IconCopy;
        if (withLabel) {
          return (
            <Button variant="default" size="xs" onClick={copy} leftSection={<Icon size={14} />} color={copied ? 'green' : undefined}>
              {copied ? 'Copied' : label}
            </Button>
          );
        }
        return (
          <Tooltip label={copied ? 'Copied' : label}>
            <ActionIcon onClick={copy} aria-label={label} color={copied ? 'green' : 'gray'} size="sm">
              <Icon size={14} />
            </ActionIcon>
          </Tooltip>
        );
      }}
    </CopyButton>
  );
}
