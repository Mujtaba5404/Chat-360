import { Button, Checkbox, Group, Input, Text } from "@mantine/core";
import PERMISSIONS, {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
  permissionKey,
} from "../../constants/PERMISSIONS";
import classes from "../workspace/WorkspaceSettings.module.css";

const actionLabel = (action) =>
  action.charAt(0) + action.slice(1).toLowerCase();

/** Resource × action checkbox matrix for a user's `permissions` array. */
const PermissionsInput = ({
  value = [],
  onChange,
  label = "Permissions",
  error,
  disabled,
}) => {
  const selected = new Set(value);
  const has = (resource, action) =>
    selected.has(permissionKey(resource, action));

  const set = (keys, on) => {
    const next = new Set(selected);
    keys.forEach((key) => (on ? next.add(key) : next.delete(key)));
    // Keep the canonical order so the payload is stable.
    onChange(PERMISSIONS.filter((key) => next.has(key)));
  };

  const rowKeys = (resource) =>
    PERMISSION_ACTIONS.map((action) => permissionKey(resource, action));
  const columnKeys = (action) =>
    PERMISSION_RESOURCES.map(({ value }) => permissionKey(value, action));
  const allOf = (keys) => keys.every((key) => selected.has(key));
  const someOf = (keys) => keys.some((key) => selected.has(key));

  return (
    <Input.Wrapper
      label={label}
      description={`${selected.size} of ${PERMISSIONS.length} granted`}
      error={error}
    >
      <Group gap="xs" mt={6} mb={8}>
        <Button
          variant="default"
          size="compact-xs"
          disabled={disabled}
          onClick={() => onChange(PERMISSIONS)}
        >
          Select all
        </Button>
        <Button
          variant="default"
          size="compact-xs"
          disabled={disabled}
          onClick={() =>
            set(
              PERMISSION_RESOURCES.map(({ value }) =>
                permissionKey(value, "READ"),
              ),
              true,
            )
          }
        >
          Read everything
        </Button>
        <Button
          variant="subtle"
          color="gray"
          size="compact-xs"
          disabled={disabled}
          onClick={() => onChange([])}
        >
          Clear
        </Button>
      </Group>

      <div
        className={classes.matrix}
        style={{ border: "1px solid var(--cm-border)", borderRadius: 8 }}
      >
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              {PERMISSION_ACTIONS.map((action) => {
                const keys = columnKeys(action);
                return (
                  <th key={action}>
                    <Checkbox
                      size="xs"
                      label={actionLabel(action)}
                      checked={allOf(keys)}
                      indeterminate={!allOf(keys) && someOf(keys)}
                      disabled={disabled}
                      onChange={(event) =>
                        set(keys, event.currentTarget.checked)
                      }
                      styles={{ body: { justifyContent: "center" } }}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_RESOURCES.map((resource) => {
              const keys = rowKeys(resource.value);
              return (
                <tr key={resource.value}>
                  <td>
                    <Checkbox
                      size="xs"
                      label={<Text size="sm">{resource.label}</Text>}
                      checked={allOf(keys)}
                      indeterminate={!allOf(keys) && someOf(keys)}
                      disabled={disabled}
                      onChange={(event) =>
                        set(keys, event.currentTarget.checked)
                      }
                    />
                  </td>
                  {PERMISSION_ACTIONS.map((action) => (
                    <td key={action}>
                      <Checkbox
                        size="xs"
                        aria-label={`${resource.label}: ${actionLabel(action)}`}
                        checked={has(resource.value, action)}
                        disabled={disabled}
                        onChange={(event) =>
                          set(
                            [permissionKey(resource.value, action)],
                            event.currentTarget.checked,
                          )
                        }
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Input.Wrapper>
  );
};

export default PermissionsInput;
