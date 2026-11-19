import { ActionIcon, Menu } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";

const stop = (event) => event.stopPropagation();

/**
 * Overflow "…" menu for table rows and cards.
 * items: [{ label, icon, onClick, color?, disabled? } | { divider: true }]; falsy items are skipped.
 * Events are stopped so the menu never triggers the row's own click handler.
 */
const RowActions = ({ items, label = "More actions" }) => {
  return (
    <div onClick={stop} onKeyDown={stop} style={{ display: "inline-flex" }}>
      <Menu width={180}>
        <Menu.Target>
          <ActionIcon aria-label={label}>
            <IconDots size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          {items.filter(Boolean).map((item, index) =>
            item.divider ? (
              <Menu.Divider key={`divider-${index}`} />
            ) : (
              <Menu.Item
                key={item.label}
                leftSection={item.icon && <item.icon size={14} stroke={1.75} />}
                color={item.color}
                disabled={item.disabled}
                onClick={item.onClick}
              >
                {item.label}
              </Menu.Item>
            ),
          )}
        </Menu.Dropdown>
      </Menu>
    </div>
  );
};

export default RowActions;
