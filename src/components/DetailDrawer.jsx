import { Drawer, Text } from "@mantine/core";
import classes from "./DetailDrawer.module.css";

const DetailDrawer = ({
  opened,
  onClose,
  title,
  summary,
  footer,
  children,
}) => {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={title}
      padding={0}
      classNames={{
        header: classes.header,
        body: classes.body,
        content: classes.content,
      }}
    >
      {summary && <div className={classes.summary}>{summary}</div>}
      <div className={classes.sections}>{children}</div>
      {footer && <div className={classes.footer}>{footer}</div>}
    </Drawer>
  );
};

export const DetailSection = ({ title, action, children }) => {
  return (
    <section className={classes.section}>
      <div className={classes.sectionHeader}>
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.4}>
          {title}
        </Text>
        {action}
      </div>
      {children}
    </section>
  );
};

export default DetailDrawer;
