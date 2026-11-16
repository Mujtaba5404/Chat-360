import { Group, Text, Title } from '@mantine/core';
import classes from './Page.module.css';

/** Standard page frame: compact header (title, description, actions) and padded body. */
export default function Page({ title, description, actions, children, width = 'wide' }) {
  return (
    <div className={classes.page} data-width={width}>
      <header className={classes.header}>
        <div className={classes.heading}>
          <Title order={1} className={classes.title}>
            {title}
          </Title>
          {description && (
            <Text size="sm" c="dimmed" mt={2}>
              {description}
            </Text>
          )}
        </div>
        {actions && (
          <Group gap="sm" wrap="nowrap">
            {actions}
          </Group>
        )}
      </header>
      {children}
    </div>
  );
}
