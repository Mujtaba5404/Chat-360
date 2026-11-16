import { Text } from '@mantine/core';
import CopyAction from './CopyAction';
import classes from './CodeBlock.module.css';

export default function CodeBlock({ code, label = 'HTML' }) {
  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Text size="xs" c="dimmed" fw={500}>
          {label}
        </Text>
        <CopyAction value={code} label="Copy code" withLabel />
      </div>
      <pre className={classes.pre}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
