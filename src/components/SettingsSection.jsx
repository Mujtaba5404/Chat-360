import { Text } from "@mantine/core";
import classes from "./SettingsSection.module.css";

const SettingsSection = ({
  title,
  description,
  action,
  footer,
  children,
  flush = false,
}) => {
  return (
    <section className={classes.section}>
      <div className={classes.header}>
        <div>
          <Text fw={600} size="sm">
            {title}
          </Text>
          {description && (
            <Text size="xs" c="dimmed" mt={2}>
              {description}
            </Text>
          )}
        </div>
        {action}
      </div>
      <div className={classes.body} data-flush={flush || undefined}>
        {children}
      </div>
      {footer && <div className={classes.footer}>{footer}</div>}
    </section>
  );
};

export const SettingRow = ({ label, description, children }) => {
  return (
    <div className={classes.row}>
      <div className={classes.rowText}>
        <Text size="sm" fw={500}>
          {label}
        </Text>
        {description && (
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        )}
      </div>
      <div className={classes.rowControl}>{children}</div>
    </div>
  );
};

export default SettingsSection;
