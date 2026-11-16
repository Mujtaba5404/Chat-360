import { Drawer } from '@mantine/core';
import { useDisclosure, useHotkeys, useLocalStorage } from '@mantine/hooks';
import { Navigate, Outlet, useLocation, useNavigation } from 'react-router';
import { useCurrentUser } from '../../app/session';
import { sizes } from '../../theme/tokens';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import GlobalSearch from './GlobalSearch';
import ShortcutsModal from './ShortcutsModal';
import classes from './AppLayout.module.css';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useLocalStorage({ key: 'cm-sidebar-collapsed', defaultValue: false });
  const [mobileNavOpened, mobileNav] = useDisclosure(false);
  const [shortcutsOpened, shortcuts] = useDisclosure(false);
  const navigation = useNavigation();
  const location = useLocation();
  const user = useCurrentUser();
  const toggleSidebar = () => setCollapsed((value) => !value);

  useHotkeys([
    ['[', toggleSidebar],
    ['shift+?', shortcuts.open],
  ]);

  // Route guard: nothing inside the shell renders without an active session.
  if (!user || user.status !== 'active') {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return (
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
        <main className={classes.content} aria-busy={navigation.state === 'loading'}>
          {navigation.state === 'loading' && <div className={classes.progress} role="progressbar" aria-label="Loading page" />}
          <Outlet />
        </main>
      </div>

      <GlobalSearch />
      <ShortcutsModal opened={shortcutsOpened} onClose={shortcuts.close} />
    </div>
  );
}
