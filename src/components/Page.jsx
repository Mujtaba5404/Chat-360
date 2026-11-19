import { Group, Text, Title } from "@mantine/core";
import { useBreadcrumbs } from "../layouts/breadcrumbs";
import classes from "./Page.module.css";

// Standard page frame: compact header (title, description, actions) and padded body.
// `breadcrumbs` replaces the header trail, e.g. [{ label: "Widgets", to: "/widgets" }, { label: "Editor" }].
const Page = ({
  title,
  description,
  actions,
  breadcrumbs,
  children,
  width = "wide",
}) => {
  useBreadcrumbs(breadcrumbs);

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
};

export default Page;
