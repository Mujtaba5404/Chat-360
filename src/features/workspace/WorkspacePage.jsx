import {
  IconBell,
  IconClock,
  IconLanguage,
  IconSettings,
  IconShieldLock,
  IconUsersGroup,
  IconKey,
} from '@tabler/icons-react';
import { NavLink, Navigate, useParams } from 'react-router';
import Page from '../../components/ui/Page';
import BusinessHoursSettings from './components/BusinessHoursSettings';
import GeneralSettings from './components/GeneralSettings';
import LocalizationSettings from './components/LocalizationSettings';
import NotificationSettings from './components/NotificationSettings';
import RolesSettings from './components/RolesSettings';
import SecuritySettings from './components/SecuritySettings';
import TeamsSettings from './components/TeamsSettings';
import classes from './WorkspacePage.module.css';

const SECTIONS = [
  { id: 'general', label: 'General', icon: IconSettings, Component: GeneralSettings },
  { id: 'teams', label: 'Teams', icon: IconUsersGroup, Component: TeamsSettings },
  { id: 'roles', label: 'Roles & permissions', icon: IconKey, Component: RolesSettings },
  { id: 'business-hours', label: 'Business hours', icon: IconClock, Component: BusinessHoursSettings },
  { id: 'localization', label: 'Localization', icon: IconLanguage, Component: LocalizationSettings },
  { id: 'notifications', label: 'Notifications', icon: IconBell, Component: NotificationSettings },
  { id: 'security', label: 'Security', icon: IconShieldLock, Component: SecuritySettings },
];

export default function WorkspacePage() {
  const { section: sectionId } = useParams();
  const section = SECTIONS.find((s) => s.id === sectionId);
  if (!section) return <Navigate to="/workspace/general" replace />;

  const { Component } = section;

  return (
    <Page title="Workspace settings" description="Manage your workspace, team structure and policies." width="narrow">
      <div className={classes.layout}>
        <nav className={classes.nav} aria-label="Workspace settings">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <NavLink key={id} to={`/workspace/${id}`} className={classes.link}>
              <Icon size={16} stroke={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className={classes.content}>
          {/* key resets section forms when switching sections */}
          <Component key={section.id} />
        </div>
      </div>
    </Page>
  );
}
