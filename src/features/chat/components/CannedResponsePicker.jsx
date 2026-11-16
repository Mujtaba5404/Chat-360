import { Code, Text, UnstyledButton } from '@mantine/core';
import { fillTemplate } from '../../../lib/format';
import classes from './Composer.module.css';

/** Keyboard-navigable list of canned responses (navigation is driven by the composer). */
export default function CannedResponsePicker({ responses, activeIndex, variables, onSelect, onActiveChange }) {
  if (!responses.length) {
    return (
      <Text size="xs" c="dimmed" p="sm">
        No canned responses match. Create one under Canned Responses.
      </Text>
    );
  }

  return (
    <div role="listbox" aria-label="Canned responses" className={classes.pickerList}>
      {responses.map((response, index) => (
        <UnstyledButton
          key={response.id}
          role="option"
          aria-selected={index === activeIndex}
          className={classes.pickerItem}
          data-active={index === activeIndex || undefined}
          onMouseEnter={() => onActiveChange(index)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(response)}
        >
          <div className={classes.pickerHead}>
            <Code className={classes.pickerShortcut}>/{response.shortcut}</Code>
            <Text size="sm" fw={500} truncate>
              {response.title}
            </Text>
          </div>
          <Text size="xs" c="dimmed" lineClamp={1}>
            {fillTemplate(response.message, variables)}
          </Text>
        </UnstyledButton>
      ))}
    </div>
  );
}
