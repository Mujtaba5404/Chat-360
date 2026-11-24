import { Drawer } from "@mantine/core";
import { useDisclosure, useHotkeys, useLocalStorage } from "@mantine/hooks";
import { Outlet } from "react-router";
import { sizes } from "../constants/TOKENS";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import BreadcrumbsProvider from "./BreadcrumbsProvider";
import GlobalSearch from "../components/GlobalSearch";
import ShortcutsModal from "../components/ShortcutsModal";
import { useWorkspaceAccent } from "../theme/accent";
import classes from "./AppLayout.module.css";

const AppLayout = () => {
  useWorkspaceAccent();
  const [collapsed, setCollapsed] = useLocalStorage({
    key: "cm-sidebar-collapsed",
    defaultValue: false,
  });
  const [mobileNavOpened, mobileNav] = useDisclosure(false);
  const [shortcutsOpened, shortcuts] = useDisclosure(false);
  const toggleSidebar = () => setCollapsed((value) => !value);

  useHotkeys([
    ["[", toggleSidebar],
    ["shift+?", shortcuts.open],
  ]);

  return (
    <BreadcrumbsProvider>
      <div className={classes.shell} data-collapsed={collapsed || undefined}>
        <aside className={classes.sidebar} aria-label="Main navigation">
          <AppSidebar collapsed={collapsed} />
        </aside>

        <Drawer
          opened={mobileNavOpened}
          onClose={mobileNav.close}
          position="left"
          size={sizes.sidebar + 32}
          withCloseButton={false}
          padding={0}
          hiddenFrom="md"
        >
          <AppSidebar onNavigate={mobileNav.close} />
        </Drawer>

        <div className={classes.main}>
          <AppHeader
            sidebarCollapsed={collapsed}
            onToggleSidebar={toggleSidebar}
            onOpenMobileNav={mobileNav.open}
          />
          <main className={classes.content}>
            <Outlet />
          </main>
        </div>

        <GlobalSearch />
        <ShortcutsModal opened={shortcutsOpened} onClose={shortcuts.close} />
      </div>
    </BreadcrumbsProvider>
  );
};

export default AppLayout;
