import { Code, Text, UnstyledButton } from "@mantine/core";
import { shortcutName } from "../../constants/CANNED_RESPONSE";
import fillTemplate from "../../utils/fillTemplate";
import classes from "./Composer.module.css";

/** Keyboard-navigable list of canned responses (navigation is driven by the composer). */
const CannedResponsePicker = ({
  responses,
  activeIndex,
  variables,
  onSelect,
  onActiveChange,
}) => {
  if (!responses.length) {
    return (
      <Text size="xs" c="dimmed" p="sm">
        No canned responses match. Create one under Canned Responses.
      </Text>
    );
  }

  return (
    <div
      role="listbox"
      aria-label="Canned responses"
      className={classes.pickerList}
    >
      {responses.map((response, index) => (
        <UnstyledButton
          key={response._id}
          role="option"
          aria-selected={index === activeIndex}
          className={classes.pickerItem}
          data-active={index === activeIndex || undefined}
          onMouseEnter={() => onActiveChange(index)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(response)}
        >
          <div className={classes.pickerHead}>
            <Code className={classes.pickerShortcut}>
              /{shortcutName(response.shortcut)}
            </Code>
            {response.title && (
              <Text size="xs" fw={500} truncate tt="capitalize" miw={0}>
                {response.title}
              </Text>
            )}
          </div>
          <Text size="xs" c="dimmed" lineClamp={1}>
            {fillTemplate(response.content, variables)}
          </Text>
        </UnstyledButton>
      ))}
    </div>
  );
};

export default CannedResponsePicker;
